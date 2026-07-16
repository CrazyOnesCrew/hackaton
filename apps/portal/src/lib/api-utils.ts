import type { ZodIssue } from "zod";
import { reportError } from "./error-reporting";
import { RailsRequestError } from "./rails";

/**
 * Formats Zod parse issues into the `{ error: { code, message, details } }`
 * envelope used across the API (matches Rails's `validation_error` shape).
 * Use in every admin catalog Route Handler after a `schema.safeParse()`
 * failure (spec 009-admin-catalog-management).
 */
export function zodValidationErrorResponse(issues: ZodIssue[]): Response {
  return Response.json(
    {
      error: {
        code: "validation_error",
        message: "Datos inválidos.",
        details: issues.map((issue) => ({ field: String(issue.path[0]), message: issue.message })),
      },
    },
    { status: 422 },
  );
}

/**
 * Converts a caught error from an admin catalog `rails.ts` call into the
 * Next.js Response the Route Handler should return: Rails's own error body
 * passed through unchanged, or a generic 503 when Rails is unreachable.
 * Auth helpers (`requireAdmin`/`requireAdminToken`) throw a `Response`
 * directly — callers should check `error instanceof Response` first and
 * return it as-is before calling this helper.
 */
export function railsErrorResponse(error: unknown): Response {
  if (error instanceof RailsRequestError) {
    return Response.json(
      error.body ?? { error: { code: "unknown_error", message: error.message } },
      { status: error.status },
    );
  }
  return Response.json(
    { error: { code: "upstream_unavailable", message: "No se pudo conectar con la API." } },
    { status: 503 },
  );
}

/**
 * Validate that the request Origin matches the Host (lightweight CSRF protection).
 * Returns null if valid, or a Response with 403 if invalid.
 *
 * Apply this at the top of every state-changing route handler (POST/PATCH/DELETE).
 */
export function validateOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Allow requests without Origin (e.g., same-origin navigations, curl)
  if (!origin) return null;
  if (!host) return null;

  try {
    const originHost = new URL(origin).host;
    if (originHost === host) return null;
  } catch {
    // Invalid origin URL → fall through to 403
  }

  return Response.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Validate admin secret for destructive operations (e.g. /api/seed, /api/clear).
 * Returns null if valid, or a Response with 401 if invalid.
 *
 * Distinct from `requireAdmin()` in `lib/auth/server.ts` which checks the
 * authenticated user's role. Use this one for break-glass / out-of-band routes.
 */
export function requireAdminSecret(request: Request): Response | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null; // No secret configured = no auth required (dev mode)

  const token =
    request.headers.get("x-admin-token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (token === secret) return null;

  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * Simple in-memory rate limiter.
 * Suitable for low-traffic admin/destructive endpoints. Replace with Redis-backed
 * limiter for high-scale workloads.
 */
const rateLimitStore = new Map<string, number[]>();

export function rateLimit(
  request: Request,
  { maxRequests = 3, windowMs = 60_000 } = {},
): Response | null {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
      },
    );
  }

  recent.push(now);
  rateLimitStore.set(ip, recent);

  // Periodic cleanup so the Map doesn't grow unbounded.
  if (rateLimitStore.size > 1000) {
    for (const [key, times] of rateLimitStore) {
      const valid = times.filter((t) => now - t < windowMs);
      if (valid.length === 0) rateLimitStore.delete(key);
      else rateLimitStore.set(key, valid);
    }
  }

  return null;
}

/**
 * Standard error response — never expose internal error details to clients.
 * Always wrap caught exceptions in route handlers with this.
 */
export function errorResponse(error: unknown, context?: string): Response {
  reportError(error, context);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
