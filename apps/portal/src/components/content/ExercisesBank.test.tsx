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
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
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
        return new Response("{}", { status: 200 });
      }),
    );
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
});

describe("ExercisePreview", () => {
  it("renders statement, steps and expected answers", () => {
    render(<ExercisePreview exercise={sample[0]!} />);
    expect(screen.getByText("Enunciado")).toBeTruthy();
    expect(screen.getByText("Pasos (1)")).toBeTruthy();
    expect(screen.getByText(/Respuesta esperada/)).toBeTruthy();
    expect(screen.getByText(/6x/)).toBeTruthy();
  });
});
