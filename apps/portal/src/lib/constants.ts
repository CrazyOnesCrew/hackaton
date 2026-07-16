import { NAV_ENTRIES } from "./navigation";

// App version — single source of truth from package.json
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const APP_VERSION: string = require("../../package.json").version;

// ── Sidebar nav ─────────────────────────────────────
//
// Items may declare `children` to render an expandable sub-menu. Parents with
// children act as a disclosure toggle in the expanded sidebar; in the collapsed
// rail they fall back to linking their own `href`.

export interface NavChild {
  href: string;
  label: string;
}

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  children?: NavChild[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const ICON_BY_HREF: Record<string, string> = {
  "/dashboard": "dashboard",
  "/admin": "settings",
};

// Unfiltered nav sections — used by the ⌘K command palette (harmless to list
// both areas there; the real access control is the role-scoped Sidebar and
// middleware.ts). See `entriesFor(role)` in ./navigation for the role-scoped
// list the Sidebar actually renders.
export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: NAV_ENTRIES.map((entry) => ({
      href: entry.href,
      label: entry.label,
      icon: ICON_BY_HREF[entry.href] ?? "dashboard",
    })),
  },
];

// ── Breadcrumb route labels ─────────────────────────
//
// Maps a path segment to its human label. <Breadcrumb /> reads this when
// auto-deriving trails from the pathname; pages can still pass explicit items
// (e.g. dynamic [id] routes that need the entity title).

export const ROUTE_LABELS: Record<string, string> = {
  "": "Dashboard",
  dashboard: "Dashboard",
  admin: "Admin",
};
