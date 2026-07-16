import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/session";

// Server components can't mutate cookies during render; (app)/layout.tsx
// redirects here when Rails reports the session invalid.
export async function GET(request: Request) {
  await clearSessionCookies();
  return NextResponse.redirect(new URL("/login", request.url));
}
