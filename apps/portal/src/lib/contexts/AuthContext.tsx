"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/base-path";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Server-resolved user (see `(app)/layout.tsx`, which verifies the session
   * against Rails before ever rendering the Shell). When provided, skips the
   * client-side `/api/auth/me` hydration fetch entirely.
   */
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [loading, setLoading] = useState(initialUser === undefined);

  // Initial hydration: only needed when no server-resolved user was provided
  // (e.g. this provider is used outside the auth-gated (app) layout).
  useEffect(() => {
    if (initialUser !== undefined) return;
    let cancelled = false;
    fetch(withBasePath("/api/auth/me"))
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          ok: false as const,
          error: body?.error?.message ?? "Correo o contraseña incorrectos.",
        };
      }
      setUser(body.data.user as User);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "No se pudo conectar con el servidor. Inténtalo de nuevo." };
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch(withBasePath("/api/auth/logout"), { method: "POST" }).catch(() => undefined);
    setUser(null);
    // The (app) layout resolves auth server-side once per navigation — clearing
    // client state alone doesn't leave the protected page. Force a real
    // navigation to /login so proxy.ts/layout re-check the (now-cleared) session.
    router.replace("/login");
    router.refresh();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
