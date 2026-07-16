import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";
import { SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE } from "./lib/session-cookies";

function requestFor(path: string, cookies: Record<string, string> = {}) {
  const url = `http://localhost:3000${path}`;
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

describe("proxy /dashboard protection (any authenticated role)", () => {
  it("allows unauthenticated requests to public routes", () => {
    const response = proxy(requestFor("/login"));
    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated visitors away from /dashboard to /login", () => {
    const response = proxy(requestFor("/dashboard"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    expect(response.headers.get("location")).toContain("from=%2Fdashboard");
  });

  it("allows a member session through to /dashboard", () => {
    const response = proxy(
      requestFor("/dashboard", {
        [SESSION_TOKEN_COOKIE]: "sess_abc",
        [SESSION_ROLE_COOKIE]: "member",
      }),
    );
    expect(response.status).toBe(200);
  });

  it("allows an admin session through to /dashboard", () => {
    const response = proxy(
      requestFor("/dashboard", {
        [SESSION_TOKEN_COOKIE]: "sess_abc",
        [SESSION_ROLE_COOKIE]: "admin",
      }),
    );
    expect(response.status).toBe(200);
  });
});

describe("proxy /admin protection (admin-only)", () => {
  it("redirects unauthenticated visitors away from /admin preserving from", () => {
    const response = proxy(requestFor("/admin"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    expect(response.headers.get("location")).toContain("from=%2Fadmin");
  });

  it("redirects a member session on /admin to /access-denied", () => {
    const response = proxy(
      requestFor("/admin", {
        [SESSION_TOKEN_COOKIE]: "sess_abc",
        [SESSION_ROLE_COOKIE]: "member",
      }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/access-denied");
  });

  it("allows an admin session through to /admin", () => {
    const response = proxy(
      requestFor("/admin", {
        [SESSION_TOKEN_COOKIE]: "sess_abc",
        [SESSION_ROLE_COOKIE]: "admin",
      }),
    );
    expect(response.status).toBe(200);
  });
});
