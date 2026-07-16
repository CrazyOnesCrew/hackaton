"use client";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-full flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
            Algo <span style={{ color: "var(--color-primary)" }}>salió mal</span>
          </h1>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            No se pudo conectar con la API.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-4 text-center" style={{ border: "1px solid var(--border)" }}>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            El servidor no está disponible en este momento. Verifica tu conexión e inténtalo de
            nuevo.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity btn-accent"
          >
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
