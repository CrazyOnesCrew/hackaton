// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImportsPanel } from "./ImportsPanel";
import type { ImportJobSummary } from "@/lib/paag-types";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const history: ImportJobSummary[] = [
  {
    id: "imp-1",
    filename: "derivadas-basicas.xml",
    status: "completed",
    createdAt: "2026-07-14T11:00:00Z",
    createdCount: 8,
    rejectedCount: 1,
    report: {
      created: 8,
      rejected: [{ index: 3, title: "Ejercicio X", errors: ["topic slug 'foo' no existe"] }],
    },
  },
];

describe("ImportsPanel", () => {
  it("renders history and rejected report details", async () => {
    const user = userEvent.setup();
    render(<ImportsPanel initialJobs={history} />);
    expect(screen.getByText("derivadas-basicas.xml")).toBeTruthy();
    await user.click(screen.getByText("derivadas-basicas.xml"));
    expect(screen.getByText("Ejercicio X")).toBeTruthy();
    expect(screen.getByText(/topic slug 'foo' no existe/)).toBeTruthy();
    expect(screen.getByText(/Creados:/)).toBeTruthy();
  });

  it("uploads a valid XML and shows pending then completed report", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let pollCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith("/api/management/exercise_imports") && init?.method === "POST") {
          return new Response(
            JSON.stringify({
              data: {
                id: "imp-new",
                filename: "nuevo.xml",
                status: "pending",
                createdAt: "2026-07-16T12:00:00Z",
              },
            }),
            { status: 202, headers: { "Content-Type": "application/json" } },
          );
        }
        if (url.includes("/api/management/exercise_imports/imp-new")) {
          pollCount += 1;
          const status = pollCount < 2 ? "processing" : "completed";
          return new Response(
            JSON.stringify({
              data: {
                id: "imp-new",
                filename: "nuevo.xml",
                status,
                createdAt: "2026-07-16T12:00:00Z",
                createdCount: status === "completed" ? 2 : undefined,
                rejectedCount: status === "completed" ? 1 : undefined,
                report:
                  status === "completed"
                    ? {
                        created: 2,
                        rejected: [
                          {
                            index: 2,
                            title: "Ejercicio rechazado de ejemplo",
                            errors: ["topic slug 'desconocido' no existe"],
                          },
                        ],
                      }
                    : undefined,
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
        if (url.includes("/api/management/exercise_imports")) {
          return new Response(JSON.stringify({ data: history }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response("{}", { status: 200 });
      }),
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    const { container } = render(<ImportsPanel initialJobs={history} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(
      ['<?xml version="1.0"?><exerciseBank version="1.0"></exerciseBank>'],
      "nuevo.xml",
      { type: "application/xml" },
    );
    await user.upload(input, file);

    await waitFor(() => expect(screen.getByText("nuevo.xml")).toBeTruthy());
    await vi.advanceTimersByTimeAsync(4500);
    await waitFor(() => {
      expect(screen.getByText("Ejercicio rechazado de ejemplo")).toBeTruthy();
    });
  });

  it("shows immediate 422 details for invalid XSD without adding history row from response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === "POST") {
          return new Response(
            JSON.stringify({
              error: {
                code: "validation_failed",
                message: "El XML no valida contra el XSD.",
                details: [{ field: "file", message: "Falta el elemento raíz exerciseBank." }],
              },
            }),
            { status: 422, headers: { "Content-Type": "application/json" } },
          );
        }
        return new Response(JSON.stringify({ data: history }), { status: 200 });
      }),
    );

    const user = userEvent.setup();
    const { container } = render(<ImportsPanel initialJobs={history} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["INVALID_XSD"], "malo.xml", { type: "application/xml" });
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(/no valida contra el XSD/i);
    });
    expect(screen.queryByText("malo.xml")).toBeNull();
  });

  it("renders help card with XSD and example XML download links", () => {
    render(<ImportsPanel initialJobs={[]} />);
    expect(screen.getByText("Ayuda de importación")).toBeTruthy();
    const xsd = screen.getByRole("link", { name: /Descargar exercise-bank\.xsd/i });
    const example = screen.getByRole("link", { name: /Descargar XML de ejemplo/i });
    expect(xsd.getAttribute("href")).toMatch(/\/examples\/exercise-bank\.xsd$/);
    expect(example.getAttribute("href")).toMatch(/\/examples\/exercise-bank-example\.xml$/);
  });

  it("rejects non-XML files client-side without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ImportsPanel initialJobs={[]} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["not xml"], "notas.csv", { type: "text/csv" });
    // Bypass browser `accept` filtering so we exercise the client-side guard.
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(/extensión \.xml/i);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects files larger than 5 MB client-side without calling fetch", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    const { container } = render(<ImportsPanel initialJobs={[]} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "grande.xml", {
      type: "application/xml",
    });
    await user.upload(input, big);

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toMatch(/5 MB/i);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows empty history without inventing rows", () => {
    render(<ImportsPanel initialJobs={[]} />);
    expect(screen.getByText("Historial")).toBeTruthy();
    expect(screen.queryByText("derivadas-basicas.xml")).toBeNull();
  });
});
