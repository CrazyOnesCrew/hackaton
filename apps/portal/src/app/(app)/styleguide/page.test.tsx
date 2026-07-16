// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import StyleguidePage from "./page";

afterEach(cleanup);

describe("/styleguide demo page (PAAG-002)", () => {
  it("renders the page title", () => {
    render(<StyleguidePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Guía de estilo" })).toBeTruthy();
  });

  it("renders every design-system section", () => {
    render(<StyleguidePage />);
    for (const title of [
      "Paleta de colores",
      "Tipografía (Nunito)",
      "Botones (pill)",
      "Chips",
      "Cards (radius 24px, sin sombra)",
      "Inputs (pill, fondo gris claro)",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: title })).toBeTruthy();
    }
  });

  it("shows swatches for all @theme color tokens of the ticket", () => {
    render(<StyleguidePage />);
    for (const token of [
      "primary",
      "primary-soft",
      "accent",
      "accent-soft",
      "surface",
      "ink",
      "ink-muted",
    ]) {
      expect(screen.getByText(token)).toBeTruthy();
    }
  });

  it("demonstrates the three button variants plus disabled state", () => {
    render(<StyleguidePage />);
    expect(screen.getByRole("button", { name: "Acción principal" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Acción secundaria" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Acción fantasma" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Deshabilitado" })).toHaveProperty("disabled", true);
  });

  it("demonstrates the three chip variants", () => {
    render(<StyleguidePage />);
    expect(screen.getByText("Activo · lavanda")).toBeTruthy();
    expect(screen.getByText("Inactivo · gris claro")).toBeTruthy();
    expect(screen.getByText("Destacado · dark")).toBeTruthy();
  });

  it("demonstrates inputs with label, error and disabled states", () => {
    render(<StyleguidePage />);
    expect(screen.getByLabelText("Nombre")).toBeTruthy();
    expect(screen.getByText("Este correo no es válido.")).toBeTruthy();
    expect(screen.getByLabelText("Deshabilitado")).toHaveProperty("disabled", true);
  });
});
