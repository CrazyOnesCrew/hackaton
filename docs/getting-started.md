# Getting Started

This template is a monorepo of three independent apps. You can run any subset,
but the mobile and portal clients need the API for authentication.

## Prerequisites

- Ruby **3.4.9** (pinned in `apps/api/.ruby-version`) and Bundler
- PostgreSQL 14+ (running locally)
- Node.js 20+ (24 tested)
- pnpm (mobile) and npm (portal)

Don't have Ruby yet? The README has step-by-step
[Ruby + Rails installation with RVM](../README.md#installing-ruby-and-rails-with-rvm)
for macOS, Linux, and Windows (via WSL2), including the OS build dependencies the
`pg` gem needs.

## 1. API (`apps/api`)

```bash
cd apps/api
cp .env.example .env          # optional; defaults work for a standard local PG
bundle install
bin/rails db:prepare          # create DB + run migrations
bin/rails db:seed             # demo users: admin@example.com / member@example.com
bin/rails server -b 0.0.0.0   # http://localhost:3000
```

Health check: `curl http://localhost:3000/up`. API metadata:
`curl http://localhost:3000/api/v1/info`.

If `db:prepare` fails with `PG::ConnectionBad`, another PostgreSQL may hold
port 5432 — set `DB_PORT` in `apps/api/.env`.

## 2. Portal (`apps/portal`)

```bash
cd apps/portal
npm install
# RAILS_API_URL defaults to http://127.0.0.1:3000
npm run dev -- -p 3001        # http://localhost:3001
```

Sign in with a seeded account. `/dashboard` is available to any signed-in user;
`/admin` is admin-only.

## 3. Mobile (`apps/mobile`)

```bash
cd apps/mobile
pnpm install
# point at your API (defaults to http://127.0.0.1:3000 in development)
export EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
pnpm start                    # then press i / a, or scan the QR
```

## Root convenience scripts

Once each app is installed, the root `package.json` can start any of them from
the repo root (one per terminal):

```bash
npm run backend       # Rails API            → http://localhost:3000
npm run frontend      # Next.js portal       → http://localhost:3001
npm run mobile        # Expo dev server
npm run mobile:clear  # Expo with a cleared Metro cache (-c)
npm run mobile:web    # Expo in the browser  → http://localhost:8081
```

These scripts only **start** the apps — they don't install dependencies or
prepare the database. Do that once per app first (see the steps above). Each one
delegates to the app's own package manager, so there is no root workspace to
install.

## Verifying a change

| App | Checks |
|---|---|
| api | `bin/rails test`, `bin/rubocop`, `bin/brakeman` |
| mobile | `pnpm type-check`, `pnpm lint`, `pnpm test` (or `pnpm check-all`) |
| portal | `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build` |

## Next steps

- Read [`architecture.md`](architecture.md) to see how the apps fit together.
- Read [`ai-development-workflow.md`](ai-development-workflow.md) before adding AI.
- Follow [`template/customization-guide.md`](template/customization-guide.md) to
  turn this into your own project.
