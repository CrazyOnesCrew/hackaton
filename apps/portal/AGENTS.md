# Portal — Agent Instructions

App-specific rules for `apps/portal`. The canonical repo-wide rules live in the
root `AGENTS.md`; this file only adds portal specifics. It must not contradict
the root rules, the constitution, or accepted ADRs.

## This is not the Next.js you may know

This app uses **Next.js 16** + **React 19**. Both have breaking changes vs older
versions — APIs, conventions, and file structure may differ from older training
data. Check the installed docs/types before writing code and heed deprecation
notices.

## Rails is the source of truth

The portal has **no local database and no auth provider of its own**. Rails
(`apps/api`) owns users and sessions (ADR-002). Do not reintroduce Prisma,
SQLite, Firebase, or any local identity/session store.

## Build UI from the design system

Before writing any form, table, menu, or input, read `DESIGN.md`. Reuse the
`ui/*` primitives and the CSS design tokens — never hard-code colors, radii, or
shadows.

## Versioning is part of "done"

Every feature/fix must:

1. Bump `version` in `package.json` (`fix` → patch, `feat` → minor, breaking → major).
2. Prepend an entry to `src/lib/changelog.ts` (rendered by the in-app "What's
   new" modal) — its newest `version` must equal `package.json`.
3. Mirror it in `CHANGELOG.md` (Keep a Changelog format).

The deploy target shown beside the version comes from `src/lib/env.ts`.

## Checks

`npx tsc --noEmit` (build does **not** type-check — `next.config.ts` sets
`ignoreBuildErrors`), `npm run lint`, `npm run test`, `npm run build`.
