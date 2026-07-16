import { NextResponse } from "next/server";
import { validateOrigin } from "@/lib/api-utils";
import { logout } from "@/lib/rails";
import { clearSessionCookies, getSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const token = await getSessionToken();

  if (token) {
    try {
      await logout(token);
    } catch {
      // Session may already be invalid/expired upstream; clearing the local
      // cookie is still the correct outcome for the client.
    }
  }

  await clearSessionCookies();
  return new NextResponse(null, { status: 204 });
}
