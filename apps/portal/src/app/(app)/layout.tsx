import { redirect } from "next/navigation";
import Shell from "@/components/layout/Shell";
import { isPortalRole } from "@/lib/navigation";
import { getProfile, normalizeRailsError, RailsRequestError } from "@/lib/rails";
import { getSessionToken } from "@/lib/session";

// All routes under (app)/* are verified server-side against Rails (the
// source of truth for identity — see AGENTS.md / ADR 002) before the Shell
// ever renders. `proxy.ts` already enforces role-scoped access for /dashboard
// and /admin; this layout additionally handles the "session went invalid
// mid-flight" case (401 → clear cookies → /login) and unreachable-Rails
// errors (thrown so `error.tsx` renders the friendly boundary).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  let user;
  try {
    user = await getProfile(token);
  } catch (error) {
    const normalized = normalizeRailsError(error);
    if (normalized instanceof RailsRequestError && normalized.unauthorized) {
      redirect("/api/auth/clear");
    }
    throw normalized;
  }

  if (!isPortalRole(user.role)) {
    redirect("/api/auth/clear");
  }

  return <Shell user={user}>{children}</Shell>;
}
