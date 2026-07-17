// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExercisesBank } from "./ExercisesBank";
import { ExercisePreview } from "./ExercisePreview";
import type { ManagementExercise } from "@/lib/paag-types";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const sample: ManagementExercise[] = [
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
    statement: "Calcula $3x^2$.",
    steps: [
      {
        id: "s1",
        phase: "procedure",
        position: 1,
        prompt: "Resultado",
        answerType: "expression",
        correctAnswer: "6x",
        maxScore: 10,
      },
    ],
  },
  {
    id: "5",
    title: "Regla de la cadena",
    status: "draft",
    difficulty: "easy",
    topicId: "10",
    topicName: "Derivadas",
    source: "xml",
    position: 2,
    updatedAt: "2026-07-16T08:00:00Z",
    statement: "Deriva $(2x+1)^3$.",
  },
];

describe("ExercisesBank", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/management/exercises?") || url.endsWith("/api/management/exercises")) {
        return new Response(JSON.stringify({ data: sample, meta: { page: 1, totalPages: 1, totalCount: 2 } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.includes("/api/management/exercises/5") && init?.method === "PATCH") {
        return new Response(
          JSON.stringify({
            error: {
              code: "validation_failed",
              message: "El ejercicio no se puede publicar.",
              details: [{ field: "steps", message: "Falta un paso procedure." }],
            },
          }),
          { status: 422, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("/api/management/exercises/") && init?.method === "DELETE") {
        return new Response(null, { status: 204 });
      }
      if (url.includes("/api/management/topics/") && url.includes("/reorder") && init?.method === "PATCH") {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("{}", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("renders the exercise table from mock data", async () => {
    render(<ExercisesBank initial={sample} />);
    await waitFor(() => {
      expect(screen.getByText("Derivada de polinomios")).toBeTruthy();
      expect(screen.getByText("Regla de la cadena")).toBeTruthy();
    });
  });

  it("shows publish 422 details when publish fails", async () => {
    const user = userEvent.setup();
    render(<ExercisesBank initial={sample} />);
    await waitFor(() => expect(screen.getByText("Regla de la cadena")).toBeTruthy());

    const menus = screen.getAllByLabelText("Acciones");
    await user.click(menus[1]!);
    await user.click(await screen.findByRole("menuitem", { name: "Publicar" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(/no se puede publicar/i);
      expect(screen.getByRole("alert").textContent).toMatch(/procedure/i);
    });
  });

  it("applies status filter via the BFF query string", async () => {
    const user = userEvent.setup();
    render(<ExercisesBank initial={sample} />);
    await waitFor(() => expect(screen.getByText("Regla de la cadena")).toBeTruthy());

    await user.selectOptions(screen.getByLabelText("Estado"), "draft");

    await waitFor(() => {
      const listCalls = fetchMock.mock.calls.filter(([input]) =>
        String(input).includes("/api/management/exercises"),
      );
      expect(listCalls.some(([input]) => String(input).includes("status=draft"))).toBe(true);
    });
  });

  it("archives with confirmation via DELETE soft-delete", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<ExercisesBank initial={sample} />);
    await waitFor(() => expect(screen.getByText("Regla de la cadena")).toBeTruthy());

    const menus = screen.getAllByLabelText("Acciones");
    await user.click(menus[1]!);
    await user.click(await screen.findByRole("menuitem", { name: "Archivar" }));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(
        fetchMock.mock.calls.some(
          ([input, init]) =>
            String(input).includes("/api/management/exercises/5") &&
            (init as RequestInit | undefined)?.method === "DELETE",
        ),
      ).toBe(true);
    });
    confirmSpy.mockRestore();
  });

  it("reorders siblings with the up control", async () => {
    const user = userEvent.setup();
    render(<ExercisesBank initial={sample} />);
    await waitFor(() => expect(screen.getByText("Regla de la cadena")).toBeTruthy());

    await user.click(screen.getByRole("button", { name: "Subir Regla de la cadena" }));

    await waitFor(() => {
      const reorder = fetchMock.mock.calls.find(
        ([input, init]) =>
          String(input).includes("/api/management/topics/10/reorder") &&
          (init as RequestInit | undefined)?.method === "PATCH",
      );
      expect(reorder).toBeTruthy();
      const body = JSON.parse(String((reorder![1] as RequestInit).body)) as { exerciseIds: string[] };
      expect(body.exerciseIds).toEqual(["5", "1"]);
    });
  });
});

describe("ExercisePreview", () => {
  it("renders statement, steps and expected answers", () => {
    render(<ExercisePreview exercise={sample[0]!} />);
    expect(screen.getByText("Enunciado")).toBeTruthy();
    expect(screen.getByText("Pasos (1)")).toBeTruthy();
    expect(screen.getByText(/Respuesta esperada/)).toBeTruthy();
    expect(screen.getByText(/6x/)).toBeTruthy();
  });

  it("marks the correct choice, tolerance and hint penalties", () => {
    const rich: ManagementExercise = {
      id: "9",
      title: "Integral",
      status: "draft",
      difficulty: "medium",
      topicId: "11",
      topicName: "Integrales",
      source: "manual",
      position: 1,
      updatedAt: "2026-07-16T12:00:00Z",
      statement: "Evalúa $\\int_0^1 2x\\,dx$.",
      steps: [
        {
          id: "s9",
          phase: "procedure",
          position: 1,
          prompt: "Resultado numérico",
          answerType: "numeric",
          options: [
            { id: "a", label: "0" },
            { id: "b", label: "1" },
          ],
          correctAnswer: "b",
          tolerance: 0.01,
          maxScore: 25,
          hints: [{ text: "Área bajo la recta.", penaltyPercent: 20 }],
        },
      ],
    };

    render(<ExercisePreview exercise={rich} />);
    expect(screen.getByText(/b\. 1 ✓/)).toBeTruthy();
    expect(screen.getByText(/tol\. 0\.01/)).toBeTruthy();
    expect(screen.getByText(/Pista 1 \(−20%\): Área bajo la recta\./)).toBeTruthy();
  });
});
