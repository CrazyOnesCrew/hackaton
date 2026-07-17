// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Chip } from "./chip";

afterEach(cleanup);

describe("Chip (PAAG-002 design system)", () => {
  it("defaults to the inactive variant (light gray surface)", () => {
    render(<Chip>Materia</Chip>);
    const chip = screen.getByText("Materia");
    expect(chip.className).toContain("bg-surface");
    expect(chip.className).toContain("text-ink");
    expect(chip.className).toContain("rounded-pill");
  });

  it("active variant uses soft lavender with dark text", () => {
    render(<Chip variant="active">Activo</Chip>);
    const chip = screen.getByText("Activo");
    expect(chip.className).toContain("bg-primary-soft");
    expect(chip.className).toContain("text-ink");
  });

  it("highlight variant is the dark chip with white text", () => {
    render(<Chip variant="highlight">Grade 2</Chip>);
    const chip = screen.getByText("Grade 2");
    expect(chip.className).toContain("bg-ink");
    expect(chip.className).toContain("text-white");
  });

  it("has no shadows (flat design) and accepts extra classes", () => {
    render(
      <Chip variant="active" className="mt-2">
        Extra
      </Chip>,
    );
    const chip = screen.getByText("Extra");
    expect(chip.className).not.toMatch(/shadow/);
    expect(chip.className).toContain("mt-2");
  });

  it("renders as a span so it can live inside buttons and links", () => {
    render(<Chip>Etiqueta</Chip>);
    expect(screen.getByText("Etiqueta").tagName).toBe("SPAN");
  });
});
