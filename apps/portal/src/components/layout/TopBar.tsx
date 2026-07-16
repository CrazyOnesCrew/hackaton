"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, LogOut, Search } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useLayout } from "@/lib/contexts/LayoutContext";
import { ROUTE_LABELS } from "@/lib/constants";
import { ROLE_LABELS, isPortalRole } from "@/lib/navigation";
import Dropdown from "@/components/ui/Dropdown";

const CommandPalette = dynamic(() => import("./CommandPalette"), { ssr: false });

export default function TopBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { openMobile } = useLayout();
  const [searchOpen, setSearchOpen] = useState(false);
  const initials = user?.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "";
  const roleLabel = isPortalRole(user?.role) ? ROLE_LABELS[user.role] : "";

  const title = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] ?? "";
    return ROUTE_LABELS[last] ?? ROUTE_LABELS[segments[0] ?? ""] ?? "Panel";
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-[var(--accent-bg)]";
  const menuItem =
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--accent-bg)]";

  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 px-4 sm:gap-3 sm:px-6"
      style={{ background: "var(--toolbar-bg)", borderBottom: "1px solid var(--border)" }}
    >
      <button
        onClick={openMobile}
        className={`${iconBtn} lg:hidden`}
        style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>

      <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg" style={{ color: "var(--fg)" }}>
        {title}
      </h1>

      <div className="flex-1" />

      {/* Search trigger */}
      <button
        onClick={() => setSearchOpen(true)}
        className="hidden items-center gap-2 rounded-md border px-3 transition-colors hover:bg-[var(--accent-bg)] md:flex"
        style={{ borderColor: "var(--border)", background: "var(--input-bg)" }}
        aria-label="Buscar"
      >
        <Search size={15} style={{ color: "var(--fg-faint)" }} />
        <span className="h-9 w-44 content-center text-left text-sm lg:w-56" style={{ color: "var(--fg-faint)" }}>
          Buscar en todo…
        </span>
        <kbd className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ background: "var(--bg-subtle)", color: "var(--fg-faint)" }}>
          ⌘K
        </kbd>
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className={`${iconBtn} md:hidden`}
        style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
        aria-label="Buscar"
      >
        <Search size={18} />
      </button>

      <span className="mx-0.5 hidden h-6 w-px sm:block" style={{ background: "var(--border)" }} />

      {/* User menu */}
      {user && (
        <Dropdown
          trigger={
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-ink" style={{ background: "var(--color-primary)" }}>
                {initials}
              </span>
              <span className="hidden max-w-28 truncate text-sm font-medium lg:block" style={{ color: "var(--fg)" }}>
                {user.displayName}
              </span>
              <ChevronDown size={14} style={{ color: "var(--fg-muted)" }} />
            </>
          }
          triggerClassName="flex items-center gap-2 rounded-md border py-1 pl-1 pr-2 transition-colors hover:bg-[var(--accent-bg)]"
          triggerStyle={{ borderColor: "var(--border)" }}
          triggerLabel="Cuenta"
          panelClassName="w-60 p-1"
        >
          {({ close }) => (
            <>
              <div className="flex items-center gap-3 border-b px-3 py-3" style={{ borderColor: "var(--border)" }}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-ink" style={{ background: "var(--color-primary)" }}>
                  {initials}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold" style={{ color: "var(--fg)" }}>{user.displayName}</div>
                  <div className="truncate text-xs" style={{ color: "var(--fg-muted)" }}>{user.email}</div>
                  {roleLabel && (
                    <div className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ background: "var(--accent-bg)", color: "var(--color-primary-strong)" }}>
                      {roleLabel}
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t p-1" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => { close(); logout(); }}
                  className={menuItem}
                  style={{ color: "#ef4444" }}
                  role="menuitem"
                >
                  <LogOut size={16} strokeWidth={1.75} /> Cerrar sesión
                </button>
              </div>
            </>
          )}
        </Dropdown>
      )}

      {searchOpen && <CommandPalette onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
