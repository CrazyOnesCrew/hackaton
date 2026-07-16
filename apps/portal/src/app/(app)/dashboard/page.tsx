import { getCurrentUser } from "@/lib/auth/server";

// Generic authenticated landing page. Any signed-in user (admin or member)
// can reach it — replace it with your project's real dashboard.
export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
        Dashboard
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--fg-muted)" }}>
        Welcome{user ? `, ${user.displayName}` : ""}. This is a starter dashboard —
        build your project&apos;s screens here.
      </p>

      <div className="glass-panel rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Signed in as <span style={{ color: "var(--fg)" }}>{user?.email}</span>
          {" "}({user?.role}).
        </p>
      </div>
    </div>
  );
}
