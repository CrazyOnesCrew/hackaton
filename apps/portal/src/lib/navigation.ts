export type PortalRole = "admin" | "member" | "auxiliary";

export type NavEntry = {
  label: string;
  href: string;
  roles: PortalRole[];
};

const CONTENT_ROLES: PortalRole[] = ["admin", "auxiliary"];

// `/dashboard` is available to any authenticated portal role.
// `/content/*` is the PAAG content manager (auxiliary + admin).
// `/admin` remains admin-only.
export const NAV_ENTRIES: NavEntry[] = [
  { label: "Dashboard", href: "/dashboard", roles: ["admin", "member", "auxiliary"] },
  { label: "Contenido", href: "/content", roles: CONTENT_ROLES },
  { label: "Ejercicios", href: "/content/exercises", roles: CONTENT_ROLES },
  { label: "Importaciones", href: "/content/imports", roles: CONTENT_ROLES },
  { label: "Calificaciones", href: "/content/grades", roles: CONTENT_ROLES },
  { label: "Admin", href: "/admin", roles: ["admin"] },
];

export const ROLE_LABELS: Record<PortalRole, string> = {
  admin: "Admin",
  member: "Miembro",
  auxiliary: "Auxiliar",
};

export function isPortalRole(role: string | null | undefined): role is PortalRole {
  return role === "admin" || role === "member" || role === "auxiliary";
}

export function isContentManager(role: string | null | undefined): boolean {
  return role === "admin" || role === "auxiliary";
}

export function entriesFor(role: PortalRole): NavEntry[] {
  return NAV_ENTRIES.filter((entry) => entry.roles.includes(role));
}

export function roleHome(role: PortalRole): string {
  if (role === "auxiliary") return "/content";
  return "/dashboard";
}
