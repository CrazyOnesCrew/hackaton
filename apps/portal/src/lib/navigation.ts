export type PortalRole = "admin" | "member";

export type NavEntry = {
  label: string;
  href: string;
  roles: PortalRole[];
};

// Generic nav entries. `/dashboard` is available to any authenticated user;
// `/admin` demonstrates an admin-only area. Add your own entries here.
export const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["admin", "member"] },
  { label: "Admin", href: "/admin", roles: ["admin"] },
];

export const ROLE_LABELS: Record<PortalRole, string> = {
  admin: "Admin",
  member: "Member",
};

export function isPortalRole(role: string | null | undefined): role is PortalRole {
  return role === "admin" || role === "member";
}

export function entriesFor(role: PortalRole): NavEntry[] {
  return NAV_ENTRIES.filter((entry) => entry.roles.includes(role));
}

export function roleHome(role: PortalRole): string {
  // All roles currently land on the dashboard; branch here to add
  // role-specific home routes.
  return role === "admin" ? "/dashboard" : "/dashboard";
}
