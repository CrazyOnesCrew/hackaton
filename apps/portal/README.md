# Portal — AI-First Project Template

Web portal built on **Next.js 16** + **React 19** with **Tailwind CSS 4**. It
provides a role-scoped admin/member shell whose authentication is backed by the
Rails API (`apps/api`) — the portal has no database or auth provider of its own.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 with CSS design tokens (light/dark)
- Vitest, ESLint, Docker standalone build

## Setup

```bash
cd apps/portal
npm install
npm run dev -- -p 3001        # http://localhost:3001
```

The Rails API must be running (default `http://127.0.0.1:3000`, override with
`RAILS_API_URL`). Sign in with a seeded account (`admin@example.com` /
`member@example.com`, password `Password123`).

## Routes

- `/` — public landing → sign in
- `/login`, `/access-denied`
- `/dashboard` — any authenticated user
- `/admin` — `admin` role only (example of a role-scoped area)
- `/api/auth/*` — login/logout/me/clear route handlers

## Commands

```bash
npm run dev            # local dev
npm run build          # production build (does NOT type-check)
npx tsc --noEmit       # type-check
npm run lint           # ESLint
npm run test           # Vitest
```

## Notes

- Rails is the single source of truth for users and sessions (ADR-002). Do not
  reintroduce Prisma, SQLite, or Firebase.
- Build UI from the `ui/*` primitives and tokens — see `DESIGN.md`.
- Every change bumps the version and updates `src/lib/changelog.ts` +
  `CHANGELOG.md` (see `AGENTS.md`).
