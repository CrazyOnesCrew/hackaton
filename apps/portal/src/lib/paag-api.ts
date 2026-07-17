import "server-only";

import { railsFetch, RailsRequestError } from "@/lib/rails";
import { getSessionToken } from "@/lib/session";
import type {
  ContentDashboardSummary,
  ExerciseStatus,
  ImportJobSummary,
  LtiContext,
  ManagementExercise,
  ManagementExerciseFilters,
  Paginated,
} from "@/lib/paag-types";

export type {
  ContentDashboardSummary,
  ExerciseStatus,
  ImportJobSummary,
  LtiContext,
  ManagementExercise,
  ManagementExerciseFilters,
  Paginated,
} from "@/lib/paag-types";

/** Mock by default outside production; set NEXT_PUBLIC_USE_MOCK_API=false to hit Rails. */
export function shouldUseMockApi(): boolean {
  const raw = process.env.NEXT_PUBLIC_USE_MOCK_API;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export const MOCK_EXERCISES: ManagementExercise[] = [
  {
    id: "1",
    title: "Derivada de polinomios",
    status: "published",
    difficulty: "easy",
    topicId: "10",
    topicName: "Derivadas",
    source: "xml",
    position: 1,
    updatedAt: "2026-07-14T10:00:00Z",
    statement: "Calcula la derivada de $f(x) = 3x^2 + 2x - 1$.",
    steps: [
      {
        id: "s1",
        phase: "identification",
        position: 1,
        prompt: "¿Qué tipo de función es?",
        answerType: "single_choice",
        options: [
          { id: "a", label: "Polinomio" },
          { id: "b", label: "Trigonométrica" },
        ],
        correctAnswer: "a",
        maxScore: 10,
        hints: [{ text: "Mira los exponentes enteros.", penaltyPercent: 10 }],
      },
      {
        id: "s2",
        phase: "procedure",
        position: 2,
        prompt: "Escribe la derivada.",
        answerType: "expression",
        correctAnswer: "6x+2",
        maxScore: 20,
        hints: [{ text: "Deriva término a término.", penaltyPercent: 15 }],
      },
    ],
  },
  {
    id: "2",
    title: "Integral definida",
    status: "draft",
    difficulty: "medium",
    topicId: "11",
    topicName: "Integrales",
    source: "manual",
    position: 1,
    updatedAt: "2026-07-15T12:00:00Z",
    statement: "Evalúa $\\int_0^1 2x\\,dx$.",
    steps: [
      {
        id: "s3",
        phase: "procedure",
        position: 1,
        prompt: "Resultado numérico",
        answerType: "numeric",
        correctAnswer: "1",
        tolerance: 0.01,
        maxScore: 25,
      },
    ],
  },
  {
    id: "3",
    title: "Límites laterales",
    status: "published",
    difficulty: "medium",
    topicId: "12",
    topicName: "Límites",
    source: "xml",
    position: 1,
    updatedAt: "2026-07-15T18:00:00Z",
    statement: "Calcula $\\lim_{x \\to 0^+} \\frac{1}{x}$.",
  },
  {
    id: "4",
    title: "Serie de Taylor",
    status: "archived",
    difficulty: "hard",
    topicId: "10",
    topicName: "Derivadas",
    source: "manual",
    position: 2,
    updatedAt: "2026-07-10T09:00:00Z",
    statement: "Escribe el polinomio de Taylor de orden 2 de $e^x$ en 0.",
  },
  {
    id: "5",
    title: "Regla de la cadena",
    status: "draft",
    difficulty: "easy",
    topicId: "10",
    topicName: "Derivadas",
    source: "xml",
    position: 3,
    updatedAt: "2026-07-16T08:00:00Z",
    statement: "Deriva $f(x) = (2x+1)^3$.",
    steps: [
      {
        id: "s4",
        phase: "identification",
        position: 1,
        prompt: "Identifica la composición",
        answerType: "single_choice",
        options: [
          { id: "a", label: "u = 2x+1" },
          { id: "b", label: "u = x^3" },
        ],
        // Intentionally incomplete for publish-422 mock
        maxScore: 10,
      },
    ],
  },
];

let mockExerciseStore: ManagementExercise[] = structuredClone(MOCK_EXERCISES);

export function resetMockExerciseStore() {
  mockExerciseStore = structuredClone(MOCK_EXERCISES);
}

export function getMockExerciseStore() {
  return mockExerciseStore;
}

let mockImportStore: ImportJobSummary[] = [
  {
    id: "imp-3",
    filename: "calculo-unidad-3.xml",
    status: "completed",
    createdAt: "2026-07-16T09:30:00Z",
    createdCount: 12,
    rejectedCount: 1,
    report: {
      created: 12,
      rejected: [{ index: 3, title: "Ejercicio X", errors: ["topic slug 'foo' no existe"] }],
    },
  },
  {
    id: "imp-2",
    filename: "limites-borrador.xml",
    status: "failed",
    createdAt: "2026-07-15T16:00:00Z",
    createdCount: 0,
    rejectedCount: 4,
  },
  {
    id: "imp-1",
    filename: "derivadas-basicas.xml",
    status: "completed",
    createdAt: "2026-07-14T11:00:00Z",
    createdCount: 8,
    rejectedCount: 0,
    report: { created: 8, rejected: [] },
  },
];

const mockImportPollTicks = new Map<string, number>();

const MOCK_CONTEXTS: LtiContext[] = [
  {
    contextId: "ctx-1",
    contextTitle: "Curso Álgebra 2026",
    platformName: "Moodle",
    lessonSessionsCount: 42,
  },
  {
    contextId: "ctx-2",
    contextTitle: "Cálculo I — Grupo B",
    platformName: "Canvas",
    lessonSessionsCount: 18,
  },
];

function summarizeExercises(exercises: ManagementExercise[]): ContentDashboardSummary {
  const totalsByStatus: Record<ExerciseStatus, number> = {
    draft: 0,
    published: 0,
    archived: 0,
  };
  for (const exercise of exercises) {
    totalsByStatus[exercise.status] += 1;
  }
  return {
    totalsByStatus,
    totalExercises: exercises.length,
    recentImports: mockImportStore.slice(0, 3),
  };
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getSessionToken();
  if (!token) throw new Response("Unauthorized", { status: 401 });
  return { Authorization: `Bearer ${token}` };
}

export async function listManagementExercises(
  filters: ManagementExerciseFilters = {},
): Promise<Paginated<ManagementExercise>> {
  if (shouldUseMockApi()) {
    let data = [...mockExerciseStore];
    if (filters.topicId) data = data.filter((e) => e.topicId === filters.topicId);
    if (filters.status) data = data.filter((e) => e.status === filters.status);
    if (filters.difficulty) data = data.filter((e) => e.difficulty === filters.difficulty);
    const page = filters.page ?? 1;
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const slice = data.slice(start, start + pageSize);
    return {
      data: slice,
      meta: {
        page,
        totalPages: Math.max(1, Math.ceil(data.length / pageSize)),
        totalCount: data.length,
      },
    };
  }

  const params = new URLSearchParams();
  if (filters.topicId) params.set("topicId", filters.topicId);
  if (filters.status) params.set("status", filters.status);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.page) params.set("page", String(filters.page));
  const qs = params.toString();
  const result = await railsFetch(`/api/v1/management/exercises${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return result as Paginated<ManagementExercise>;
}

export async function getManagementExercise(id: string): Promise<ManagementExercise | null> {
  if (shouldUseMockApi()) {
    return mockExerciseStore.find((e) => e.id === id) ?? null;
  }
  try {
    const result = await railsFetch(`/api/v1/management/exercises/${id}`, {
      method: "GET",
      headers: await authHeaders(),
    });
    return (result as { data: ManagementExercise }).data;
  } catch (error) {
    if (error instanceof RailsRequestError && error.status === 404) return null;
    throw error;
  }
}

export async function patchManagementExercise(
  id: string,
  body: Partial<Pick<ManagementExercise, "status">>,
): Promise<ManagementExercise> {
  if (shouldUseMockApi()) {
    const exercise = mockExerciseStore.find((e) => e.id === id);
    if (!exercise) throw new RailsRequestError(404, { error: { code: "not_found", message: "No encontrado." } });
    if (body.status === "published") {
      const hasProcedure = exercise.steps?.some((s) => s.phase === "procedure");
      const hasAnswers = exercise.steps?.every((s) => s.correctAnswer != null);
      if (!hasProcedure || !hasAnswers) {
        throw new RailsRequestError(422, {
          error: {
            code: "validation_failed",
            message: "El ejercicio no se puede publicar.",
            details: [
              { field: "steps", message: "Se requiere al menos un paso en la fase procedure." },
              { field: "correctAnswer", message: "Todas las respuestas correctas deben estar definidas." },
            ],
          },
        });
      }
    }
    Object.assign(exercise, body, { updatedAt: new Date().toISOString() });
    return structuredClone(exercise);
  }

  const result = await railsFetch(`/api/v1/management/exercises/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  return (result as { data: ManagementExercise }).data;
}

export async function deleteManagementExercise(id: string): Promise<void> {
  if (shouldUseMockApi()) {
    mockExerciseStore = mockExerciseStore.filter((e) => e.id !== id);
    return;
  }
  await railsFetch(`/api/v1/management/exercises/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
}

export async function reorderTopicExercises(topicId: string, exerciseIds: string[]): Promise<void> {
  if (shouldUseMockApi()) {
    exerciseIds.forEach((id, index) => {
      const exercise = mockExerciseStore.find((e) => e.id === id && e.topicId === topicId);
      if (exercise) exercise.position = index + 1;
    });
    return;
  }
  await railsFetch(`/api/v1/management/topics/${topicId}/reorder`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ exerciseIds }),
  });
}

export async function getContentDashboardSummary(): Promise<ContentDashboardSummary> {
  if (shouldUseMockApi()) {
    return summarizeExercises(mockExerciseStore);
  }

  const { data, meta } = await listManagementExercises();
  const totalsByStatus: Record<ExerciseStatus, number> = {
    draft: 0,
    published: 0,
    archived: 0,
  };
  for (const exercise of data) {
    if (exercise.status in totalsByStatus) {
      totalsByStatus[exercise.status] += 1;
    }
  }
  return {
    totalsByStatus,
    totalExercises: meta.totalCount,
    recentImports: [],
  };
}

export async function listImportJobs(page = 1): Promise<Paginated<ImportJobSummary>> {
  if (shouldUseMockApi()) {
    return {
      data: [...mockImportStore],
      meta: { page, totalPages: 1, totalCount: mockImportStore.length },
    };
  }
  const result = await railsFetch(`/api/v1/management/exercise_imports?page=${page}`, {
    method: "GET",
    headers: await authHeaders(),
  });
  return result as Paginated<ImportJobSummary>;
}

export async function getImportJob(id: string): Promise<ImportJobSummary | null> {
  if (shouldUseMockApi()) {
    const job = mockImportStore.find((j) => j.id === id);
    if (!job) return null;
    if (job.status === "pending" || job.status === "processing") {
      const ticks = (mockImportPollTicks.get(id) ?? 0) + 1;
      mockImportPollTicks.set(id, ticks);
      if (ticks === 1) {
        job.status = "processing";
      } else {
        job.status = "completed";
        job.createdCount = 2;
        job.rejectedCount = 1;
        job.report = {
          created: 2,
          rejected: [
            {
              index: 2,
              title: "Ejercicio rechazado de ejemplo",
              errors: ["topic slug 'desconocido' no existe"],
            },
          ],
        };
      }
    }
    return structuredClone(job);
  }
  try {
    const result = await railsFetch(`/api/v1/management/exercise_imports/${id}`, {
      method: "GET",
      headers: await authHeaders(),
    });
    return (result as { data: ImportJobSummary }).data;
  } catch (error) {
    if (error instanceof RailsRequestError && error.status === 404) return null;
    throw error;
  }
}

/** Create an import job from multipart file. Throws RailsRequestError on 422. */
export async function createImportJob(file: File): Promise<ImportJobSummary> {
  if (shouldUseMockApi()) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xml")) {
      throw new RailsRequestError(422, {
        error: {
          code: "validation_failed",
          message: "Archivo XML inválido.",
          details: [{ field: "file", message: "Solo se aceptan archivos .xml." }],
        },
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new RailsRequestError(422, {
        error: {
          code: "validation_failed",
          message: "Archivo demasiado grande.",
          details: [{ field: "file", message: "El máximo es 5 MB." }],
        },
      });
    }
    const text = await file.text();
    if (!text.includes("<exerciseBank") || text.includes("INVALID_XSD")) {
      throw new RailsRequestError(422, {
        error: {
          code: "validation_failed",
          message: "El XML no valida contra el XSD.",
          details: [{ field: "file", message: "Falta el elemento raíz exerciseBank o el esquema es inválido." }],
        },
      });
    }
    const job: ImportJobSummary = {
      id: `imp-${Date.now()}`,
      filename: file.name,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    mockImportStore = [job, ...mockImportStore];
    mockImportPollTicks.set(job.id, 0);
    return structuredClone(job);
  }

  const token = await getSessionToken();
  if (!token) throw new Response("Unauthorized", { status: 401 });
  const form = new FormData();
  form.append("file", file);
  const base = process.env.RAILS_API_URL ?? "http://127.0.0.1:3000";
  let response: Response;
  try {
    response = await fetch(`${base}/api/v1/management/exercise_imports`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: form,
      cache: "no-store",
    });
  } catch {
    throw new RailsRequestError(503, {
      error: { code: "upstream_unavailable", message: "No se pudo conectar con la API." },
    });
  }
  if (!response.ok) {
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    throw new RailsRequestError(response.status, body);
  }
  const result = (await response.json()) as { data: ImportJobSummary };
  return result.data;
}

export async function listLtiContexts(): Promise<LtiContext[]> {
  if (shouldUseMockApi()) return MOCK_CONTEXTS;
  const result = await railsFetch("/api/v1/management/lti_contexts", {
    method: "GET",
    headers: await authHeaders(),
  });
  return (result as { data: LtiContext[] }).data;
}

export async function exportGradesCsv(contextId: string): Promise<{ filename: string; body: string }> {
  if (shouldUseMockApi()) {
    const date = new Date().toISOString().slice(0, 10);
    return {
      filename: `grades-${contextId}-${date}.csv`,
      body: [
        "username,email,fullname,grade,lesson,completedat",
        "jperez,jperez@example.com,Juan Pérez,85.00,ecuaciones-lineales,2026-07-16T18:30:00Z",
        "mlopez,mlopez@example.com,María López,92.50,derivadas,2026-07-15T14:00:00Z",
      ].join("\n"),
    };
  }

  const token = await getSessionToken();
  if (!token) throw new Response("Unauthorized", { status: 401 });
  const base = process.env.RAILS_API_URL ?? "http://127.0.0.1:3000";
  const response = await fetch(
    `${base}/api/v1/management/grade_exports?contextId=${encodeURIComponent(contextId)}`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "text/csv" },
      cache: "no-store",
    },
  );
  if (!response.ok) {
    throw new RailsRequestError(response.status, null);
  }
  const body = await response.text();
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(disposition);
  const date = new Date().toISOString().slice(0, 10);
  return {
    filename: match?.[1] ?? `grades-${contextId}-${date}.csv`,
    body,
  };
}
