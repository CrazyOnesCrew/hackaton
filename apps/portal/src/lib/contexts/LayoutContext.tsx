"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

// Shell layout state lives here so Sidebar and TopBar stay in sync without
// prop-drilling. The desktop collapse preference persists to localStorage; the
// mobile drawer is ephemeral and resets on navigation.
//
// localStorage payload is versioned + minimal per docs/BEST_PRACTICES.md →
// client-localstorage-schema, so a future shape change can be migrated safely.

const STORAGE_KEY = "template-layout";
const SCHEMA_VERSION = 1;

interface PersistedLayout {
  v: number;
  collapsed: boolean;
}

interface LayoutContextValue {
  /** Desktop: icon-only rail when true. */
  collapsed: boolean;
  /** Viewport is ≥ lg (matches the breakpoint where the rail applies). */
  isDesktop: boolean;
  /** Mobile (<lg): off-canvas drawer open state. */
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

const DESKTOP_MQ = "(min-width: 1024px)";

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}

function readPersisted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<PersistedLayout>;
    if (parsed.v !== SCHEMA_VERSION) return false;
    return !!parsed.collapsed;
  } catch {
    return false;
  }
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  // Lazy init from storage. Safe here: the Shell only mounts the sidebar after
  // the client-side auth check resolves, so there is no SSR/CSR width mismatch.
  const [collapsed, setCollapsed] = useState(readPersisted);
  const [mobileOpen, setMobileOpen] = useState(false);
  // The collapse rail only has meaning at ≥ lg; below that the mobile drawer
  // takes over and always shows full labels + sub-menus. Track the breakpoint
  // so consumers can branch correctly regardless of the persisted preference.
  // Lazy init is client-safe (sidebar mounts post-auth).
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_MQ).matches : true,
  );
  const pathname = usePathname();

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Auto-close the mobile drawer on navigation. Done as a render-time state
  // adjustment (the React-recommended alternative to a setState-in-effect) so
  // the close happens in the same commit as the route change — no extra paint.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  // Persist the collapse preference whenever it changes.
  useEffect(() => {
    const payload: PersistedLayout = { v: SCHEMA_VERSION, collapsed };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* storage unavailable (private mode) — ignore */
    }
  }, [collapsed]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const value = useMemo(
    () => ({
      collapsed,
      isDesktop,
      mobileOpen,
      toggleCollapsed,
      openMobile,
      closeMobile,
    }),
    [collapsed, isDesktop, mobileOpen, toggleCollapsed, openMobile, closeMobile],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}
