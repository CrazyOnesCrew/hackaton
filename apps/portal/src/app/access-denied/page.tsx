import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
            Acceso <span style={{ color: "var(--color-primary)" }}>restringido</span>
          </h1>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Esta sección está reservada para usuarios autorizados del portal.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4 text-center" style={{ border: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Si crees que deberías tener acceso, contacta al equipo administrador.
          </p>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity btn-accent"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
