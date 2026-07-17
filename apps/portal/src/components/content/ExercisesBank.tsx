"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, Eye } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { RowActions } from "@/components/ui/row-actions";
import { withBasePath } from "@/lib/base-path";
import type {
  ExerciseDifficulty,
  ExerciseStatus,
  ManagementExercise,
} from "@/lib/paag-types";

const STATUS_LABEL: Record<ExerciseStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

const DIFFICULTY_LABEL: Record<ExerciseDifficulty, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

const DIFFICULTY_VARIANT: Record<ExerciseDifficulty, "active" | "inactive" | "highlight"> = {
  easy: "active",
  medium: "inactive",
  hard: "highlight",
};

type ApiError = {
  error?: { message?: string; details?: { field: string; message: string }[] };
};

async function fetchExercises(filters: {
  topicId: string;
  status: string;
  difficulty: string;
}): Promise<ManagementExercise[]> {
  const params = new URLSearchParams();
  if (filters.topicId) params.set("topicId", filters.topicId);
  if (filters.status) params.set("status", filters.status);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  const res = await fetch(withBasePath(`/api/management/exercises?${params}`), { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el banco.");
  const json = (await res.json()) as { data: ManagementExercise[] };
  return json.data;
}

export function ExercisesBank({ initial }: { initial: ManagementExercise[] }) {
  const [rows, setRows] = useState(initial);
  const [topicId, setTopicId] = useState("");
  const [status, setStatus] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  const topics = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of initial) map.set(row.topicId, row.topicName);
    return [...map.entries()];
  }, [initial]);

  const reload = useCallback(
    async (filters?: { topicId?: string; status?: string; difficulty?: string }) => {
      const next = {
        topicId: filters?.topicId ?? topicId,
        status: filters?.status ?? status,
        difficulty: filters?.difficulty ?? difficulty,
      };
      setLoading(true);
      setError(null);
      try {
        const data = await fetchExercises(next);
        setRows(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al cargar.");
      } finally {
        setLoading(false);
      }
    },
    [topicId, status, difficulty],
  );

  async function patchStatus(id: string, next: ExerciseStatus) {
    setActionError(null);
    const res = await fetch(withBasePath(`/api/management/exercises/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as ApiError | null;
      const details = body?.error?.details?.map((d) => d.message).join(" ") ?? "";
      setActionError([body?.error?.message, details].filter(Boolean).join(" ") || "No se pudo actualizar.");
      return;
    }
    await reload();
  }

  async function archive(id: string) {
    if (!window.confirm("¿Archivar este ejercicio? Esta acción lo oculta del banco activo.")) {
      return;
    }
    setActionError(null);
    const res = await fetch(withBasePath(`/api/management/exercises/${id}`), { method: "DELETE" });
    if (!res.ok) {
      setActionError("No se pudo archivar el ejercicio.");
      return;
    }
    await reload();
  }

  async function move(row: ManagementExercise, direction: -1 | 1) {
    const siblings = rows
      .filter((e) => e.topicId === row.topicId)
      .sort((a, b) => a.position - b.position);
    const index = siblings.findIndex((e) => e.id === row.id);
    const swap = index + direction;
    if (index < 0 || swap < 0 || swap >= siblings.length) return;
    const ordered = [...siblings];
    [ordered[index], ordered[swap]] = [ordered[swap], ordered[index]];
    const exerciseIds = ordered.map((e) => e.id);
    setActionError(null);
    const res = await fetch(withBasePath(`/api/management/topics/${row.topicId}/reorder`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseIds }),
    });
    if (!res.ok) {
      setActionError("No se pudo reordenar.");
      return;
    }
    await reload();
  }

  const columns = useMemo<ColumnDef<ManagementExercise>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Título",
        cell: ({ row }) => (
          <Link
            href={`/content/exercises/${row.original.id}`}
            className="font-semibold text-ink hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "topicName",
        header: "Tema",
      },
      {
        accessorKey: "difficulty",
        header: "Dificultad",
        cell: ({ row }) => (
          <Chip variant={DIFFICULTY_VARIANT[row.original.difficulty]}>
            {DIFFICULTY_LABEL[row.original.difficulty]}
          </Chip>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <Chip variant={row.original.status === "published" ? "active" : "inactive"}>
            {STATUS_LABEL[row.original.status]}
          </Chip>
        ),
      },
      {
        accessorKey: "source",
        header: "Fuente",
        cell: ({ row }) => (row.original.source === "xml" ? "XML" : "Manual"),
      },
      {
        accessorKey: "updatedAt",
        header: "Fecha",
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString("es", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const ex = row.original;
          return (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-md p-1.5 text-ink-muted hover:bg-primary-soft"
                title="Subir"
                aria-label={`Subir ${ex.title}`}
                onClick={() => startTransition(() => void move(ex, -1))}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                className="rounded-md p-1.5 text-ink-muted hover:bg-primary-soft"
                title="Bajar"
                aria-label={`Bajar ${ex.title}`}
                onClick={() => startTransition(() => void move(ex, 1))}
              >
                <ArrowDown size={16} />
              </button>
              <RowActions
                actions={[
                  {
                    label: "Vista previa",
                    icon: Eye,
                    href: `/content/exercises/${ex.id}`,
                  },
                  ex.status === "published"
                    ? {
                        label: "Despublicar",
                        onSelect: () => void patchStatus(ex.id, "draft"),
                      }
                    : {
                        label: "Publicar",
                        onSelect: () => void patchStatus(ex.id, "published"),
                      },
                  {
                    label: "Archivar",
                    danger: true,
                    onSelect: () => void archive(ex.id),
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload closes over filters
    [rows],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
          Tema
          <select
            value={topicId}
            onChange={(e) => {
              const value = e.target.value;
              setTopicId(value);
              void reload({ topicId: value });
            }}
            className="h-10 min-w-[10rem] rounded-pill bg-surface px-4 text-sm text-ink"
          >
            <option value="">Todos</option>
            {topics.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
          Estado
          <select
            value={status}
            onChange={(e) => {
              const value = e.target.value;
              setStatus(value);
              void reload({ status: value });
            }}
            className="h-10 min-w-[10rem] rounded-pill bg-surface px-4 text-sm text-ink"
          >
            <option value="">Todos</option>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-ink-muted">
          Dificultad
          <select
            value={difficulty}
            onChange={(e) => {
              const value = e.target.value;
              setDifficulty(value);
              void reload({ difficulty: value });
            }}
            className="h-10 min-w-[10rem] rounded-pill bg-surface px-4 text-sm text-ink"
          >
            <option value="">Todas</option>
            <option value="easy">Fácil</option>
            <option value="medium">Media</option>
            <option value="hard">Difícil</option>
          </select>
        </label>
        <Button type="button" variant="secondary" onClick={() => void reload()} disabled={loading}>
          Actualizar
        </Button>
      </div>

      {actionError ? (
        <div
          role="alert"
          className="rounded-card bg-accent-soft px-4 py-3 text-sm font-medium text-ink"
        >
          {actionError}
        </div>
      ) : null}
      {error ? (
        <div role="alert" className="rounded-card bg-accent-soft px-4 py-3 text-sm text-ink">
          {error}
        </div>
      ) : null}
      {loading || pending ? (
        <p className="text-sm text-ink-muted" aria-live="polite">
          Cargando…
        </p>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        searchPlaceholder="Buscar por título…"
        emptyMessage="No hay ejercicios con estos filtros."
        pageSize={10}
      />
    </div>
  );
}
