// Rails HTTP client. The portal has no local database — Rails (`apps/api`) is
// the single source of truth for users and sessions. This file exposes just
// the auth/profile surface the template needs; add your own typed clients here.
const RAILS_API_URL = process.env.RAILS_API_URL ?? "http://127.0.0.1:3000";

export type RailsUser = {
  id: string;
  email: string;
  displayName: string;
  role: "admin" | "member" | "auxiliary";
};

export type RailsSession = {
  token: string;
  expiresAt: string;
};

export type RailsErrorBody = {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
};

/** Rails answered with a non-2xx HTTP status (401, 403, 422, 5xx, ...). */
export class RailsRequestError extends Error {
  status: number;
  body: RailsErrorBody | null;

  constructor(status: number, body: RailsErrorBody | null) {
    super(body?.error?.message ?? "The request could not be completed.");
    this.status = status;
    this.body = body;
  }

  get unauthorized(): boolean {
    return this.status === 401;
  }
}

/** Rails could not be reached at all (network failure, server down). */
export class RailsUnreachableError extends Error {
  constructor() {
    super("Could not connect to the API.");
  }
}

export function normalizeRailsError(error: unknown): RailsRequestError | RailsUnreachableError {
  if (error instanceof RailsRequestError || error instanceof RailsUnreachableError) {
    return error;
  }
  return new RailsUnreachableError();
}

export async function railsFetch(path: string, init: RequestInit) {
  let response: Response;
  try {
    response = await fetch(`${RAILS_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new RailsUnreachableError();
  }

  if (!response.ok) {
    let body: RailsErrorBody | null = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    throw new RailsRequestError(response.status, body);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const result = await railsFetch("/api/v1/sessions", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return result.data as { user: RailsUser; session: RailsSession };
}

export async function logout(token: string) {
  await railsFetch("/api/v1/sessions/current", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getProfile(token: string): Promise<RailsUser> {
  const result = await railsFetch("/api/v1/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  return result.data as RailsUser;
}
