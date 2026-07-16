import { NextRequest, NextResponse } from "next/server";
import { SESSION_ROLE_COOKIE, SESSION_TOKEN_COOKIE } from "@/lib/session-cookies";

// Allowed roles per protected area prefix.
const AREA_RULES: { prefix: string; roles: Set<string> }[] = [
  { prefix: "/dashboard", roles: new Set(["admin", "member", "auxiliary"]) },
  { prefix: "/content", roles: new Set(["admin", "auxiliary"]) },
  { prefix: "/admin", roles: new Set(["admin"]) },
];

function ruleFor(pathname: string) {
  return AREA_RULES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rule = ruleFor(pathname);
  if (!rule) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(SESSION_ROLE_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!role || !rule.roles.has(role)) {
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/content/:path*", "/admin/:path*"],
};
