import { NAV_SECTIONS } from "./constants";

// Searchable command index for the ⌘K palette. Derived from the sidebar nav so
// pages stay in sync automatically, plus a few global actions. `keywords` feeds
// Fuse.js so fuzzy/synonym matches work (e.g. "inicio" → Dashboard).

export type CommandAction = "toggle-theme" | "open-changelog";

export interface Command {
  id: string;
  label: string;
  /** Group heading in the palette. */
  section: string;
  /** Icon key resolved by the palette's icon map. */
  icon: string;
  href?: string;
  action?: CommandAction;
  keywords?: string;
}

// Extra search terms per route for richer matching.
const KEYWORDS: Record<string, string> = {
  "/dashboard": "dashboard home inicio panel",
  "/admin": "admin settings configuración",
};

function buildCommands(): Command[] {
  const out: Command[] = [];

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      out.push({
        id: `nav:${item.href}`,
        label: item.label,
        section: section.label,
        icon: item.icon,
        href: item.href,
        keywords: KEYWORDS[item.href],
      });
      for (const child of item.children ?? []) {
        out.push({
          id: `nav:${child.href}:${child.label}`,
          label: child.label,
          section: item.label,
          icon: item.icon,
          href: child.href,
          keywords: `${item.label} ${KEYWORDS[child.href] ?? ""}`.trim(),
        });
      }
    }
  }

  out.push(
    {
      id: "action:toggle-theme",
      label: "Cambiar tema (claro / oscuro)",
      section: "Acciones",
      icon: "theme",
      action: "toggle-theme",
      keywords: "dark mode oscuro claro tema theme apariencia",
    },
    {
      id: "action:open-changelog",
      label: "Ver novedades",
      section: "Acciones",
      icon: "sparkles",
      action: "open-changelog",
      keywords: "changelog versión version cambios release notes",
    },
  );

  return out;
}

export const COMMANDS: Command[] = buildCommands();
