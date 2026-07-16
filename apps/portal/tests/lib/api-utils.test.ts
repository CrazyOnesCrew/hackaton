import { describe, it, expect, beforeEach } from "vitest";
import { validateOrigin, requireAdminSecret, rateLimit } from "@/lib/api-utils";

function makeRequest(headers: Record<string, string>): Request {
  return new Request("http://example.com/api/x", { headers });
}

describe("validateOrigin", () => {
  it("allows requests without an Origin header", () => {
    expect(validateOrigin(makeRequest({ host: "example.com" }))).toBeNull();
  });

  it("allows requests where Origin host matches Host", () => {
    expect(
      validateOrigin(
        makeRequest({ origin: "https://example.com", host: "example.com" }),
      ),
    ).toBeNull();
  });

  it("rejects mismatched origin", () => {
    const res = validateOrigin(
      makeRequest({ origin: "https://evil.com", host: "example.com" }),
    );
    expect(res?.status).toBe(403);
  });
});

describe("requireAdminSecret", () => {
  beforeEach(() => {
    delete process.env.ADMIN_SECRET;
  });

  it("returns null when no ADMIN_SECRET is configured (dev)", () => {
    expect(requireAdminSecret(makeRequest({}))).toBeNull();
  });

  it("accepts the matching x-admin-token header", () => {
    process.env.ADMIN_SECRET = "supersecret";
    expect(
      requireAdminSecret(makeRequest({ "x-admin-token": "supersecret" })),
    ).toBeNull();
  });

  it("rejects bad tokens with 401", () => {
    process.env.ADMIN_SECRET = "supersecret";
    expect(
      requireAdminSecret(makeRequest({ "x-admin-token": "nope" }))?.status,
    ).toBe(401);
  });
});

describe("rateLimit", () => {
  it("rejects after maxRequests within the window", () => {
    const headers = { "x-forwarded-for": "9.9.9.9" };
    const opts = { maxRequests: 2, windowMs: 60_000 };
    expect(rateLimit(makeRequest(headers), opts)).toBeNull();
    expect(rateLimit(makeRequest(headers), opts)).toBeNull();
    expect(rateLimit(makeRequest(headers), opts)?.status).toBe(429);
  });
});
