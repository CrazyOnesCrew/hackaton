import { requireAdmin } from "@/lib/auth/server";

// Example admin-only page. `proxy.ts` already restricts `/admin` to the admin
// role at the edge; `requireAdmin()` is the server-side belt-and-suspenders.
export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-bold mb-1" style={{ color: "var(--fg)" }}>
        Admin
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--fg-muted)" }}>
        Admin-only area. Only users with the <code>admin</code> role can see this.
      </p>

      <div className="glass-panel rounded-2xl p-6" style={{ border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Signed in as <span style={{ color: "var(--fg)" }}>{user.email}</span>.
        </p>
      </div>
    </div>
  );
}
