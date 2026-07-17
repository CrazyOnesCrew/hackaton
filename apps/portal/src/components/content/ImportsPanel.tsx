"use client";

import { useCallback, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import type { ImportJobSummary } from "@/lib/paag-types";

const STATUS_LABEL: Record<ImportJobSummary["status"], string> = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
};

const STATUS_VARIANT: Record<ImportJobSummary["status"], "active" | "inactive" | "highlight"> = {
  pending: "inactive",
  processing: "inactive",
  completed: "active",
  failed: "highlight",
};

type ApiError = {
  error?: { message?: string; details?: { field: string; message: string }[] };
};

export function ImportsPanel({ initialJobs }: { initialJobs: ImportJobSummary[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState(initialJobs);
  const [selected, setSelected] = useState<ImportJobSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [polling, setPolling] = useState(false);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/management/exercise_imports");
    if (!res.ok) return;
    const json = (await res.json()) as { data: ImportJobSummary[] };
    setJobs(json.data);
  }, []);

  async function pollUntilDone(id: string) {
    setPolling(true);
    try {
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch(`/api/management/exercise_imports/${id}`);
        if (!res.ok) break;
        const json = (await res.json()) as { data: ImportJobSummary };
        setSelected(json.data);
        await refreshList();
        if (json.data.status === "completed" || json.data.status === "failed") break;
      }
    } finally {
      setPolling(false);
    }
  }

  async function uploadFile(file: File) {
    setClientError(null);
    if (!file.name.toLowerCase().endsWith(".xml")) {
      setClientError("Solo se aceptan archivos con extensión .xml.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setClientError("El archivo supera el límite de 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/management/exercise_imports", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        const details = body?.error?.details?.map((d) => d.message).join(" ") ?? "";
        setClientError(
          [body?.error?.message, details].filter(Boolean).join(" ") ||
            "No se pudo importar el archivo.",
        );
        return;
      }
      const json = (await res.json()) as { data: ImportJobSummary };
      setSelected(json.data);
      await refreshList();
      void pollUntilDone(json.data.id);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-2 text-lg font-bold text-ink">Ayuda de importación</h2>
        <p className="mb-3 text-sm text-ink-muted">
          El archivo debe cumplir el esquema XSD del banco. Descarga el esquema y un XML de
          ejemplo con dos ejercicios válidos.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/examples/exercise-bank.xsd"
            className="text-sm font-semibold text-primary-strong hover:underline"
            download
          >
            Descargar exercise-bank.xsd
          </a>
          <a
            href="/examples/exercise-bank-example.xml"
            className="text-sm font-semibold text-primary-strong hover:underline"
            download
          >
            Descargar XML de ejemplo
          </a>
        </div>
      </Card>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void uploadFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-primary bg-primary-soft" : "border-[var(--border)] bg-surface"
        }`}
        aria-label="Zona para soltar archivo XML"
      >
        <p className="font-semibold text-ink">Arrastra un XML aquí o haz clic para elegir</p>
        <p className="mt-1 text-sm text-ink-muted">Máximo 5 MB · extensión .xml</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xml,application/xml,text/xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
            e.target.value = "";
          }}
        />
        {uploading ? (
          <p className="mt-3 text-sm text-ink-muted" aria-live="polite">
            Subiendo…
          </p>
        ) : null}
      </div>

      {clientError ? (
        <div role="alert" className="rounded-card bg-accent-soft px-4 py-3 text-sm text-ink">
          {clientError}
        </div>
      ) : null}

      <section aria-labelledby="import-history-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="import-history-heading" className="text-lg font-bold text-ink">
            Historial
          </h2>
          <Button type="button" variant="ghost" onClick={() => void refreshList()}>
            Actualizar
          </Button>
        </div>
        <ul className="space-y-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <button
                type="button"
                onClick={() => setSelected(job)}
                className="flex w-full flex-wrap items-center justify-between gap-3 rounded-card bg-surface px-4 py-3 text-left hover:bg-primary-soft"
              >
                <div>
                  <p className="font-semibold text-ink">{job.filename}</p>
                  <p className="text-xs text-ink-muted">
                    {new Date(job.createdAt).toLocaleString("es")}
                    {typeof job.createdCount === "number"
                      ? ` · ${job.createdCount} creados / ${job.rejectedCount ?? 0} rechazados`
                      : ""}
                  </p>
                </div>
                <Chip variant={STATUS_VARIANT[job.status]}>{STATUS_LABEL[job.status]}</Chip>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {selected ? (
        <Card aria-label="Detalle de importación">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-ink">{selected.filename}</h2>
            <Chip variant={STATUS_VARIANT[selected.status]}>
              {STATUS_LABEL[selected.status]}
            </Chip>
            {polling ? (
              <span className="animate-pulse text-xs font-semibold text-ink-muted">
                Consultando estado…
              </span>
            ) : null}
          </div>
          {selected.report ? (
            <>
              <p className="mb-3 text-sm text-ink">
                Creados: <strong>{selected.report.created}</strong>
              </p>
              {selected.report.rejected.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-ink-muted">
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Título</th>
                        <th className="py-2">Errores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.report.rejected.map((row) => (
                        <tr key={`${row.index}-${row.title}`} className="border-t border-[var(--border)]">
                          <td className="py-2 pr-3 text-ink">{row.index}</td>
                          <td className="py-2 pr-3 text-ink">{row.title}</td>
                          <td className="py-2 text-ink-muted">{row.errors.join("; ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-ink-muted">Sin rechazos en este lote.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-muted">
              {selected.status === "pending" || selected.status === "processing"
                ? "El reporte estará disponible cuando termine el procesamiento."
                : "Sin reporte disponible."}
            </p>
          )}
        </Card>
      ) : null}
    </div>
  );
}
