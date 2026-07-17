// In-app changelog — the source of truth for the "What's new" modal.
//
// Versioning workflow (see CLAUDE.md → "Versioning & changelog"):
//   1. Every feature / fix bumps `version` in package.json semantically
//      (feat → minor, fix/patch → patch, breaking → major).
//   2. Add a matching entry at the TOP of CHANGELOG below.
//   3. Keep CHANGELOG.md (Keep a Changelog format) in sync for the repo.
//
// The newest entry's `version` should equal package.json's version, which is
// what the sidebar widget displays via APP_VERSION.

export type ChangeKind = "added" | "changed" | "fixed" | "removed";
export type ReleaseType = "major" | "minor" | "patch";

export interface ChangelogEntry {
  version: string;
  /** ISO date (yyyy-mm-dd). */
  date: string;
  type: ReleaseType;
  /**
   * `text` supports inline markdown: `**bold**`, `_italic_`, `` `code` `` and
   * `[link](url)`. Rendered by the in-app "What's new" modal.
   */
  changes: { kind: ChangeKind; text: string }[];
}

export const CHANGE_KIND_META: Record<ChangeKind, { label: string; color: string }> = {
  added: { label: "New", color: "#10b981" },
  changed: { label: "Changed", color: "#8b74e8" },
  fixed: { label: "Fix", color: "#f59e0b" },
  removed: { label: "Removed", color: "#ef4444" },
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "2026-07-16",
    type: "minor",
    changes: [
      {
        kind: "added",
        text: "Exportación CSV de notas por contexto LTI (`/content/grades`) con mock/BFF.",
      },
    ],
  },
  {
    version: "1.3.1",
    date: "2026-07-16",
    type: "patch",
    changes: [
      {
        kind: "fixed",
        text: "Client fetch/anchors respect `NEXT_BASE_PATH` so auth and content APIs work under `/portal`.",
      },
    ],
  },
  {
    version: "1.3.0",
    date: "2026-07-16",
    type: "minor",
    changes: [
      { kind: "added", text: "Importación XML con dropzone, polling de estado y reporte de creados/rechazados." },
    ],
  },
  {
    version: "1.2.0",
    date: "2026-07-16",
    type: "minor",
    changes: [
      { kind: "added", text: "Banco de ejercicios: tabla con filtros, publicar/archivar, reordenar y preview con KaTeX." },
    ],
  },
  {
    version: "1.1.0",
    date: "2026-07-16",
    type: "minor",
    changes: [
      { kind: "added", text: "Rol **auxiliary** y gestor de contenidos (`/content`) con dashboard mock/real conmutable vía `NEXT_PUBLIC_USE_MOCK_API`." },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-07-13",
    type: "major",
    changes: [
      { kind: "added", text: "Initial version of the **AI-First Project Template** portal — Next.js 16, React 19, Rails-backed authentication, role-scoped shell (`/dashboard`, admin-only `/admin`)." },
    ],
  },
];
