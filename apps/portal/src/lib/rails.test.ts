import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getProfile,
  normalizeRailsError,
  RailsRequestError,
  RailsUnreachableError,
} from "./rails";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("rails API client error normalization", () => {
  it("throws RailsRequestError with unauthorized flag on 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(401, {
          error: { code: "unauthorized", message: "Autenticación requerida o inválida." },
        }),
      ),
    );

    const error = await getProfile("bad-token").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RailsRequestError);
    expect((error as RailsRequestError).status).toBe(401);
    expect((error as RailsRequestError).unauthorized).toBe(true);
    expect((error as RailsRequestError).body?.error.code).toBe("unauthorized");
  });

  it("throws RailsRequestError with parsed body on 422", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(422, {
          error: {
            code: "validation_error",
            message: "No fue posible actualizar el perfil.",
            details: [{ field: "email", message: "Ya existe una cuenta con este correo." }],
          },
        }),
      ),
    );

    const error = await getProfile("token").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RailsRequestError);
    expect((error as RailsRequestError).status).toBe(422);
    expect((error as RailsRequestError).unauthorized).toBe(false);
    expect((error as RailsRequestError).body?.error.details?.[0].field).toBe("email");
  });

  it("throws RailsUnreachableError when the network fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    const error = await getProfile("token").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(RailsUnreachableError);
    expect((error as RailsUnreachableError).message).toContain("Could not connect");
  });

  it("returns the profile payload on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(200, {
          data: {
            id: "usr_1",
            email: "admin-demo@example.com",
            displayName: "Administrador Demo",
            role: "admin",
          },
        }),
      ),
    );

    const user = await getProfile("token");
    expect(user.displayName).toBe("Administrador Demo");
    expect(user.role).toBe("admin");
  });

  it("normalizeRailsError maps unknown throwables to RailsUnreachableError", () => {
    expect(normalizeRailsError(new TypeError("boom"))).toBeInstanceOf(RailsUnreachableError);
    const httpError = new RailsRequestError(500, null);
    expect(normalizeRailsError(httpError)).toBe(httpError);
  });
});
