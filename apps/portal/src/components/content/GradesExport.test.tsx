// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GradesExport } from "./GradesExport";
import type { LtiContext } from "@/lib/paag-types";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const contexts: LtiContext[] = [
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

describe("GradesExport", () => {
  it("renders selectable LTI context cards", async () => {
    const user = userEvent.setup();
    render(<GradesExport contexts={contexts} />);
    expect(screen.getByText("Curso Álgebra 2026")).toBeTruthy();
    expect(screen.getByText("Cálculo I — Grupo B")).toBeTruthy();

    const download = screen.getByRole("button", { name: "Descargar CSV" });
    expect((download as HTMLButtonElement).disabled).toBe(true);

    await user.click(screen.getByText("Curso Álgebra 2026"));
    expect((download as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText(/Contexto seleccionado/)).toBeTruthy();
    expect(screen.getByText("ctx-1")).toBeTruthy();
  });

  it("shows empty state when there are no contexts", () => {
    render(<GradesExport contexts={[]} />);
    expect(screen.getByText("Sin contextos LTI")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Descargar CSV/i })).toBeNull();
  });

  it("downloads CSV via BFF when a context is selected", async () => {
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response("username,email,fullname,grade,lesson,completedat\n", {
          status: 200,
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": 'attachment; filename="grades-ctx-1-2026-07-16.csv"',
          },
        });
      }),
    );

    const user = userEvent.setup();
    render(<GradesExport contexts={contexts} />);
    await user.click(screen.getByText("Curso Álgebra 2026"));
    await user.click(screen.getByRole("button", { name: "Descargar CSV" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/management/grade_exports?contextId=ctx-1"),
      );
      expect(createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  it("renders contingency help card for Moodle CSV import", () => {
    render(<GradesExport contexts={contexts} />);
    expect(screen.getByText("¿Cuándo usar esta exportación?")).toBeTruthy();
    expect(
      screen.getByText(/grade passback LTI.*Moodle/i),
    ).toBeTruthy();
  });

  it("surfaces BFF error when CSV generation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({ error: { message: "Contexto LTI no encontrado." } }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    const user = userEvent.setup();
    render(<GradesExport contexts={contexts} />);
    await user.click(screen.getByText("Curso Álgebra 2026"));
    await user.click(screen.getByRole("button", { name: "Descargar CSV" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(/Contexto LTI no encontrado/i);
    });
  });
});
