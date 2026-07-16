import "server-only";
import { cookies } from "next/headers";
import type { RailsUser } from "./rails";
import { SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE } from "./session-cookies";

export type SessionCookiePayload = {
  token: string;
  expiresAt: string;
  user: RailsUser;
};

function maxAgeFromExpiry(expiresAt: string): number {
  const seconds = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return Math.max(seconds, 0);
}

export async function setSessionCookies(payload: SessionCookiePayload) {
  const cookieStore = await cookies();
  const maxAge = maxAgeFromExpiry(payload.expiresAt);
  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };

  cookieStore.set(SESSION_TOKEN_COOKIE, payload.token, common);
  cookieStore.set(SESSION_ROLE_COOKIE, payload.user.role, common);
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_TOKEN_COOKIE);
  cookieStore.delete(SESSION_ROLE_COOKIE);
}

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionRole(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_ROLE_COOKIE)?.value ?? null;
}

export { SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE };
