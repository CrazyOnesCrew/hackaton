import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { ContentDashboardSummary, ExerciseStatus } from "@/lib/paag-types";

const STATUS_LABELS: Record<ExerciseStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const IMPORT_STATUS_VARIANT: Record<
  ContentDashboardSummary["recentImports"][number]["status"],
  "active" | "inactive" | "highlight"
> = {
  completed: "active",
  pending: "inactive",
  processing: "inactive",
  failed: "highlight",
};

const IMPORT_STATUS_LABEL: Record<
  ContentDashboardSummary["recentImports"][number]["status"],
  string
> = {
  completed: "Completado",
  pending: "Pendiente",
  processing: "Procesando",
  failed: "Fallido",
};

export function ContentDashboard({ summary }: { summary: ContentDashboardSummary }) {
  const statusOrder: ExerciseStatus[] = ["draft", "published", "archived"];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card aria-label="Total de ejercicios">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Total ejercicios
          </p>
          <p className="mt-2 text-3xl font-extrabold text-ink">{summary.totalExercises}</p>
        </Card>
        {statusOrder.map((status) => (
          <Card key={status} aria-label={`Ejercicios ${STATUS_LABELS[status]}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              {STATUS_LABELS[status]}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-ink">
              {summary.totalsByStatus[status]}
            </p>
          </Card>
        ))}
      </div>

      <section aria-labelledby="recent-imports-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="recent-imports-heading" className="text-lg font-bold text-ink">
              Últimas importaciones
            </h2>
            <p className="text-sm text-ink-muted">Resumen de cargas XML recientes.</p>
          </div>
          <Link
            href="/content/imports"
            className="text-sm font-semibold text-primary-strong hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {summary.recentImports.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-muted">Aún no hay importaciones para mostrar.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {summary.recentImports.map((job) => (
              <li key={job.id}>
                <Card className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{job.filename}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(job.createdAt).toLocaleString("es")}
                      {typeof job.createdCount === "number"
                        ? ` · ${job.createdCount} creados`
                        : ""}
                    </p>
                  </div>
                  <Chip variant={IMPORT_STATUS_VARIANT[job.status]}>
                    {IMPORT_STATUS_LABEL[job.status]}
                  </Chip>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
