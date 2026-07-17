"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { withBasePath } from "@/lib/base-path";
import type { LtiContext } from "@/lib/paag-types";

export function GradesExport({ contexts }: { contexts: LtiContext[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  async function download() {
    if (!selectedId) {
      setError("Selecciona un contexto LTI antes de descargar.");
      return;
    }
    setError(null);
    setDownloading(true);
    try {
      const res = await fetch(
        withBasePath(
          `/api/management/grade_exports?contextId=${encodeURIComponent(selectedId)}`,
        ),
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        setError(body?.error?.message ?? "No se pudo generar el CSV.");
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = /filename="?([^"]+)"?/.exec(disposition);
      const filename =
        match?.[1] ??
        `grades-${selectedId}-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-2 text-lg font-bold text-ink">¿Cuándo usar esta exportación?</h2>
        <p className="text-sm text-ink-muted">
          Usa el CSV cuando el grade passback LTI esté bloqueado o haya fallado. El archivo es
          compatible con la importación de calificaciones de Moodle (columnas username, email,
          fullname, grade, lesson, completedat). Importa el CSV desde el libro de
          calificaciones del curso en tu LMS.
        </p>
      </Card>

      {contexts.length === 0 ? (
        <Card>
          <h2 className="mb-2 text-lg font-bold text-ink">Sin contextos LTI</h2>
          <p className="text-sm text-ink-muted">
            Todavía no hay contextos LTI registrados. Cuando una plataforma lance una lección,
            el contexto aparecerá aquí para exportar notas.
          </p>
        </Card>
      ) : (
        <>
          <section aria-labelledby="contexts-heading">
            <h2 id="contexts-heading" className="mb-3 text-lg font-bold text-ink">
              Contextos disponibles
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {contexts.map((ctx) => {
                const selected = selectedId === ctx.contextId;
                return (
                  <li key={ctx.contextId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(ctx.contextId)}
                      aria-pressed={selected}
                      className={`w-full rounded-card p-5 text-left transition-colors ${
                        selected
                          ? "bg-primary-soft ring-2 ring-primary"
                          : "bg-surface hover:bg-primary-soft"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Chip variant={selected ? "active" : "inactive"}>{ctx.platformName}</Chip>
                        <span className="text-xs font-semibold text-ink-muted">
                          {ctx.lessonSessionsCount} sesiones
                        </span>
                      </div>
                      <p className="font-bold text-ink">{ctx.contextTitle}</p>
                      <p className="mt-1 text-xs text-ink-muted">ID: {ctx.contextId}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => void download()}
              disabled={downloading || !selectedId}
            >
              {downloading ? "Generando…" : "Descargar CSV"}
            </Button>
            {selectedId ? (
              <span className="text-sm text-ink-muted">
                Contexto seleccionado: <strong className="text-ink">{selectedId}</strong>
              </span>
            ) : null}
          </div>
        </>
      )}

      {error ? (
        <div role="alert" className="rounded-card bg-accent-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      ) : null}
    </div>
  );
}
