# CLAUDE.md

@AGENTS.md

Claude Code entry point for `apps/portal`. The canonical repo rules live in the
root `AGENTS.md`; portal specifics live in this app's `AGENTS.md` (imported
above). Do not duplicate rules — edit the appropriate `AGENTS.md`.

## Overview

Web portal built on Next.js 16 + React 19 with Tailwind CSS 4. It keeps a design
system and shell (Sidebar/TopBar, `ui/*` primitives, tokens) but has **no
database or auth provider of its own**: Rails (`apps/api`) is the single source
of truth for users and sessions (ADR-002).

## Architecture

- `src/proxy.ts` — role-scoped route protection at the edge (`/dashboard` for any
  authenticated user, `/admin` for the `admin` role).
- `src/app/` — App Router. The `(app)` group is auth-gated by a server-side
  layout that verifies the session against Rails via `getProfile()` before
  rendering `Shell`. `src/app/api/auth/` hosts login/logout/me/clear handlers.
- `src/components/layout/` — Shell, Sidebar, TopBar, LoginScreen.
- `src/lib/` — `rails.ts` (Rails HTTP client), `session.ts` (cookies),
  `navigation.ts` (roles/nav), `auth/server.ts` (`getCurrentUser()`,
  `requireAdmin()`), `contexts/`, `api-utils.ts`, `error-reporting.ts`.

## Conventions

- Server Components by default; `"use client"` only where interactivity demands it.
- API route handlers validate the request Origin (CSRF) via `validateOrigin()`.
- Admin-only operations go through `requireAdmin()`.
- Errors in route handlers funnel through `errorResponse(err, "context")`.
- Roles in the template are `admin` and `member` — extend `navigation.ts`,
  `proxy.ts`, and `rails.ts`'s `RailsUser` together.

## Known gotchas

- `next.config.ts` sets `typescript.ignoreBuildErrors` — `npm run build` does not
  type-check. Run `npx tsc --noEmit` separately.
- The theme bootstrap uses `next/script` with `strategy="beforeInteractive"`;
  don't replace it with a raw `<script>` tag.
- Do not reintroduce Prisma, SQLite, or Firebase (ADR-002).

## Read before editing

- `DESIGN.md` — design system: form primitives + validation, tables, tokens
- `README.md` — setup and routes
- Repo root `docs/` — getting started, architecture, AI workflow
