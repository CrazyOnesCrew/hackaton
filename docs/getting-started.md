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

## Everything with Docker Compose (recommended)

The fastest way to a working dev environment. You only need Docker Desktop —
no local Ruby, PostgreSQL, or Node required for the API and portal. From the
**repo root**:

```bash
cp .env.example .env          # first time only; adjust ports if needed
docker compose up --build     # db + api + worker + portal
```

This starts, in dependency order:

| Service | What it is | URL / check |
|---|---|---|
| `db` | PostgreSQL 17 (healthcheck: `pg_isready`) | host port `${POSTGRES_HOST_PORT:-5433}` |
| `api` | Rails API — prepares/migrates the DB, then serves (healthcheck: `/up`) | http://localhost:3000/up |
| `worker` | Solid Queue worker (same image as `api`) | — |
| `portal` | Next.js portal in dev mode, talking to the API at `http://api:3000` | http://localhost:3001 |

The first `portal` request compiles the app, so give it a minute before the
page responds. Verify the stack:

```bash
docker compose ps
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/up   # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001      # 200
```

Seed demo users (first time only), then sign in at http://localhost:3001:

```bash
docker compose exec api bin/rails db:seed   # admin@example.com / member@example.com
```

Code for both `api` and `portal` is bind-mounted, so edits on the host hot
reload inside the containers. Common commands:

```bash
docker compose logs -f portal               # follow a service's logs
docker compose exec api bin/rails console   # Rails console
docker compose down                         # stop (keeps DB data)
```

Mobile (Expo) intentionally runs on the host — see step 3 below. The rest of
this guide covers running each app **without** Docker.

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
