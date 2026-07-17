"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField, Input } from "@/components/ui/form";
import { withBasePath } from "@/lib/base-path";
import { isPortalRole, roleHome } from "@/lib/navigation";
import { APP_VERSION } from "@/lib/constants";

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(withBasePath("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error?.message ?? "Correo o contraseña incorrectos.");
        return;
      }

      const role = body?.data?.user?.role;
      const fallback = isPortalRole(role) ? roleHome(role) : "/dashboard";
      const redirectTo = searchParams.get("from") ?? fallback;
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
            Project <span style={{ color: "var(--color-primary)" }}>Portal</span>
          </h1>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Sign in to the portal.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 space-y-4"
          style={{ border: "1px solid var(--border)" }}
        >
          <FormField label="Correo" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </FormField>

          <FormField label="Contraseña" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </FormField>

          {error && (
            <p className="text-xs text-center" style={{ color: "#ef4444" }} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold transition-opacity disabled:opacity-50 btn-accent"
          >
            {submitting ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <p
          className="text-[9px] text-center mt-6"
          style={{ color: "var(--fg-faint)", opacity: 0.5 }}
        >
          v{APP_VERSION}
        </p>
      </div>
    </div>
  );
}
