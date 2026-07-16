// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

afterEach(cleanup);

describe("Button (PAAG-002 design system)", () => {
  it("renders a pill-shaped button with the primary variant by default", () => {
    render(<Button>Acción principal</Button>);
    const btn = screen.getByRole("button", { name: "Acción principal" });
    expect(btn.className).toContain("rounded-pill");
    expect(btn.className).toContain("bg-primary");
    expect(btn).toHaveProperty("type", "button");
  });

  it("applies the secondary variant (soft lavender background)", () => {
    render(<Button variant="secondary">Secundaria</Button>);
    const btn = screen.getByRole("button", { name: "Secundaria" });
    expect(btn.className).toContain("bg-primary-soft");
    expect(btn.className).toContain("rounded-pill");
  });

  it("applies the ghost variant (transparent background, muted text)", () => {
    render(<Button variant="ghost">Fantasma</Button>);
    const btn = screen.getByRole("button", { name: "Fantasma" });
    expect(btn.className).toContain("bg-transparent");
    expect(btn.className).toContain("text-ink-muted");
  });

  it("does not use shadow utilities (flat design)", () => {
    render(<Button>Plano</Button>);
    expect(screen.getByRole("button", { name: "Plano" }).className).not.toMatch(/shadow/);
  });

  it("disabled state blocks clicks and reduces opacity", () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Deshabilitado
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Deshabilitado" });
    expect(btn).toHaveProperty("disabled", true);
    expect(btn.className).toContain("disabled:opacity-50");
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("merges custom classes and forwards native props", () => {
    const onClick = vi.fn();
    render(
      <Button type="submit" className="w-full" onClick={onClick}>
        Enviar
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Enviar" });
    expect(btn).toHaveProperty("type", "submit");
    expect(btn.className).toContain("w-full");
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
