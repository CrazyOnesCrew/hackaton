import { NextResponse } from "next/server";
import { validateOrigin } from "@/lib/api-utils";
import { isPortalRole } from "@/lib/navigation";
import { login, logout, RailsRequestError } from "@/lib/rails";
import { setSessionCookies } from "@/lib/session";

export async function POST(request: Request) {
  const csrfError = validateOrigin(request);
  if (csrfError) return csrfError;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: { code: "validation_error", message: "Correo y contraseña son obligatorios." } },
      { status: 422 },
    );
  }

  try {
    const { user, session } = await login(email, password);

    if (!isPortalRole(user.role)) {
      // Valid credentials but not a portal role: revoke the just-issued Rails
      // session and never establish portal cookies.
      await logout(session.token).catch(() => {});
      return NextResponse.json(
        {
          error: {
            code: "role_not_allowed",
            message: "This portal is only for authorized users.",
          },
        },
        { status: 403 },
      );
    }

    await setSessionCookies({ token: session.token, expiresAt: session.expiresAt, user });
    return NextResponse.json({ data: { user } }, { status: 200 });
  } catch (error) {
    if (error instanceof RailsRequestError) {
      return NextResponse.json(
        error.body ?? { error: { code: "unknown_error", message: error.message } },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: { code: "upstream_unavailable", message: "No se pudo conectar con la API." } },
      { status: 503 },
    );
  }
}
