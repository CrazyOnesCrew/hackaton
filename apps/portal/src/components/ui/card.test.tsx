// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Card } from "./card";

afterEach(cleanup);

describe("Card (PAAG-002 design system)", () => {
  it("renders children on a rounded surface background", () => {
    render(
      <Card>
        <h3>Tarjeta plana</h3>
      </Card>,
    );
    const card = screen.getByRole("heading", { name: "Tarjeta plana" }).parentElement!;
    expect(card.className).toContain("rounded-card");
    expect(card.className).toContain("bg-surface");
  });

  it("has generous padding and no shadow utilities (flat design)", () => {
    render(<Card data-testid="card">Contenido</Card>);
    const card = screen.getByTestId("card");
    expect(card.className).toContain("p-6");
    expect(card.className).not.toMatch(/shadow/);
  });

  it("allows overriding the background via className (tailwind-merge)", () => {
    render(
      <Card data-testid="card" className="bg-primary-soft">
        Variante lavanda
      </Card>,
    );
    const card = screen.getByTestId("card");
    expect(card.className).toContain("bg-primary-soft");
    expect(card.className).not.toContain("bg-surface");
  });

  it("forwards arbitrary div props", () => {
    render(<Card role="region" aria-label="resumen" />);
    expect(screen.getByRole("region", { name: "resumen" })).toBeTruthy();
  });
});
