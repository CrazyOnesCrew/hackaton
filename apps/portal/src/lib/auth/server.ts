import "server-only";

import { getProfile, normalizeRailsError, RailsRequestError } from "@/lib/rails";
import { getSessionToken } from "@/lib/session";
import type { RailsUser } from "@/lib/rails";

/**
 * Resolves the signed-in user against Rails (the single source of truth for
 * identity — see AGENTS.md / ADR 002). Returns null when there's no session,
 * the session is invalid/expired, or Rails is unreachable.
 */
export async function getCurrentUser(): Promise<RailsUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    return await getProfile(token);
  } catch (error) {
    const normalized = normalizeRailsError(error);
    if (normalized instanceof RailsRequestError && normalized.unauthorized) {
      return null;
    }
    // Rails unreachable or another HTTP error — treat as "no session" for the
    // purposes of the client-side auth gate; server components that need to
    // distinguish this from "logged out" should call getProfile() directly.
    return null;
  }
}

export async function requireAdmin(): Promise<RailsUser> {
  const user = await getCurrentUser();
  if (!user) throw new Response("Unauthorized", { status: 401 });
  if (user.role !== "admin") throw new Response("Forbidden", { status: 403 });
  return user;
}

/**
 * Same guard as `requireAdmin()`, but also returns the session token — use it
 * in admin-only Route Handlers that call `rails.ts` with the bearer token
 * after confirming the caller is an admin.
 */
export async function requireAdminToken(): Promise<string> {
  await requireAdmin();
  const token = await getSessionToken();
  if (!token) throw new Response("Unauthorized", { status: 401 });
  return token;
}
