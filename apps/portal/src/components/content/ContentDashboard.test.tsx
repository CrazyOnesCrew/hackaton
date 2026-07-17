// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ContentDashboard } from "./ContentDashboard";
import type { ContentDashboardSummary } from "@/lib/paag-types";

afterEach(cleanup);

const summary: ContentDashboardSummary = {
  totalExercises: 5,
  totalsByStatus: { draft: 2, published: 2, archived: 1 },
  recentImports: [
    {
      id: "imp-1",
      filename: "derivadas-basicas.xml",
      status: "completed",
      createdAt: "2026-07-14T11:00:00Z",
      createdCount: 8,
    },
  ],
};

describe("ContentDashboard", () => {
  it("renders exercise totals by status", () => {
    render(<ContentDashboard summary={summary} />);
    expect(screen.getByLabelText("Total de ejercicios").textContent).toContain("5");
    expect(screen.getByLabelText("Ejercicios Borrador").textContent).toContain("2");
    expect(screen.getByLabelText("Ejercicios Publicado").textContent).toContain("2");
    expect(screen.getByLabelText("Ejercicios Archivado").textContent).toContain("1");
  });

  it("renders recent imports with status chips", () => {
    render(<ContentDashboard summary={summary} />);
    expect(screen.getByText("derivadas-basicas.xml")).toBeTruthy();
    expect(screen.getByText("Completado")).toBeTruthy();
  });
});
