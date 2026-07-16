import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/server";
import { isPortalRole, roleHome } from "@/lib/navigation";
import LoginScreen from "@/components/layout/LoginScreen";

export default async function LoginPage() {
  // FR-015: an already-authenticated portal user skips the login form. The
  // token is validated against Rails (not just cookie presence) so a stale
  // cookie renders the form instead of causing a redirect loop.
  const user = await getCurrentUser();
  if (user && isPortalRole(user.role)) {
    redirect(roleHome(user.role));
  }

  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}
