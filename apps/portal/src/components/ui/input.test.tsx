// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FormField, Input } from "./form";

afterEach(cleanup);

describe("Input (PAAG-002 design system)", () => {
  it("is pill-shaped with the surface field control styles", () => {
    render(<Input aria-label="Buscar" placeholder="Describe tu tarea…" />);
    const input = screen.getByLabelText("Buscar");
    expect(input.className).toContain("rounded-pill");
    expect(input.className).toContain("field-control");
  });

  it("marks invalid state for accessible error styling", () => {
    render(<Input aria-label="Correo" invalid defaultValue="bad" />);
    const input = screen.getByLabelText("Correo");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.className).toContain("field-control--invalid");
  });

  it("pairs with FormField label and error copy", () => {
    render(
      <FormField label="Nombre" htmlFor="nombre" error="Requerido">
        <Input id="nombre" />
      </FormField>,
    );
    expect(screen.getByLabelText("Nombre")).toBeTruthy();
    expect(screen.getByText("Requerido")).toBeTruthy();
  });
});
