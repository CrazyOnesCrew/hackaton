# Running the Rails API with Docker

This runs the backend (`apps/api`) and its PostgreSQL database in containers, so
you do **not** need Ruby, Rails, Bundler, PostgreSQL, or Node.js installed on
your machine. It targets local development, especially on **Windows** via Docker
Desktop + WSL2, but works the same on macOS and Linux.

- Ruby **3.4.9**, Rails **8.1.3**, PostgreSQL **17-alpine**
- API on **http://localhost:3000** (health probe at `/up`)
- Background jobs run in a separate **Solid Queue** worker (`bin/jobs`)
- No Redis and no Node.js — the backend doesn't need them

All commands below are run **from the repository root** (where
`docker-compose.yml` lives), not from `apps/api`.

## 1. Requirements

- **Docker Desktop** (Windows 10/11, macOS, or Linux).
- On Windows: **WSL2 backend** enabled (Docker Desktop → Settings → General →
  *Use the WSL 2 based engine*). For best file-watching performance, keep the
  repository **inside the WSL2 filesystem** (e.g. `\\wsl$\Ubuntu\home\you\...`),
  not under `C:\Users\...`.
- **Git configured for LF endings.** This repo ships `.gitattributes` that force
  LF on shell scripts, so a fresh clone is correct automatically. If you cloned
  before that existed, run once: `git add --renormalize . && git checkout -- .`.

## 2. First start

```bash
cp .env.example .env      # first time only; safe defaults, no secrets
docker compose up --build
```

This builds the image, starts PostgreSQL, waits for it to be healthy, runs
`bin/rails db:prepare` (creates + migrates the app database **and** the Solid
Queue database, loads seeds on first creation), starts Rails on `0.0.0.0:3000`,
and starts the worker. Open <http://localhost:3000/up> — it should return HTTP 200.

Run detached (no logs in your terminal):

```bash
docker compose up -d
```

## 3. Everyday commands

| Action | Command |
|---|---|
| Start (detached) | `docker compose up -d` |
| Stop (keep data) | `docker compose down` |
| Restart one service | `docker compose restart api` |
| Follow API logs | `docker compose logs -f api` |
| Follow worker logs | `docker compose logs -f worker` |
| Rails console | `docker compose exec api bin/rails console` |
| Routes | `docker compose exec api bin/rails routes` |
| Migrate | `docker compose exec api bin/rails db:migrate` |
| Seed | `docker compose exec api bin/rails db:seed` |
| Tests | `docker compose exec api bin/rails test` |
| RuboCop | `docker compose exec api bundle exec rubocop` |
| Brakeman | `docker compose exec api bin/brakeman` |
| psql | `docker compose exec db psql -U postgres -d template_development` |

> `exec` runs inside the already-running container. If nothing is running yet,
> use `docker compose run --rm api <command>` instead, which starts a throwaway
> container.

## 4. Hot reload

`./apps/api` is bind-mounted into the container, so edits on your host take
effect immediately — no rebuild or restart. Rails polls file timestamps per
request in development, which works reliably over Docker Desktop mounts. You only
need to rebuild the image when the **system packages** in `Dockerfile.dev`
change.

## 5. Installing / updating gems

The `Gemfile`/`Gemfile.lock` are bind-mounted, so changes land on your host and
stay in git. Gems themselves live in a named volume (`bundle_data`).

```bash
# Add a gem (updates Gemfile + Gemfile.lock on the host)
docker compose exec api bundle add <gem_name>

# After editing the Gemfile by hand
docker compose exec api bundle install

# If a teammate changed the Gemfile and your container is missing gems
docker compose run --rm api bundle install
# then restart:
docker compose restart api worker
```

## 6. Data & volumes

Two named volumes are created:

- `postgres_data` — PostgreSQL data (survives `docker compose down`)
- `bundle_data` — installed gems

Stop containers but **keep** your database:

```bash
docker compose down
```

Delete everything **including the database** (destructive):

```bash
docker compose down -v
```

> ⚠️ **`docker compose down -v` permanently deletes your local PostgreSQL data
> and installed gems.** Use it only when you deliberately want a clean slate.
> There is no undo. The next `up` will recreate and re-seed the database.

## 7. Troubleshooting

**Port already in use (`3000` or the DB port).**
Something else is bound to the port. Change it in `.env`:
`API_PORT=3001` or `POSTGRES_HOST_PORT=5434`, then `docker compose up -d`. The DB
host port defaults to **5433** specifically to avoid clashing with a PostgreSQL
already on 5432.

**PostgreSQL not healthy / api won't start.**
Check `docker compose logs db`. Give it a moment on first boot (it initializes
the data directory). The `api` waits for the DB healthcheck automatically.

**`A server is already running` / stale `server.pid`.**
The dev entrypoint deletes `tmp/pids/server.pid` on every boot, so this normally
self-heals. If it persists: `docker compose down` then `docker compose up -d`.

**CRLF errors (`bad interpreter`, `no such file or directory` on a script).**
Your checkout has Windows line endings on a shell script. Fix once:
`git add --renormalize . && git checkout -- .`, then
`docker compose build --no-cache api`.

**Permission errors on generated files (Linux hosts).**
The dev container runs as root to keep bind mounts simple on Docker Desktop.
On native Linux you may need to `sudo chown -R "$USER" apps/api/tmp apps/api/log`
if root-created files get in the way. (This does not apply on Windows/macOS.)

**Missing gems after pulling changes.**
`docker compose run --rm api bundle install` then
`docker compose restart api worker`.

**Database does not exist.**
`docker compose run --rm api bin/rails db:prepare`.

**`Gemfile.lock` changed unexpectedly.**
The lockfile is bind-mounted and editable on purpose (so `bundle add` works).
Review the diff on your host and commit or discard as usual.

**Container keeps restarting.**
`docker compose logs -f <service>` to see the crash. A restarting `worker`
usually means the Solid Queue database isn't prepared — run
`docker compose run --rm api bin/rails db:prepare`.

## 8. What runs where

| Service | Image | Purpose |
|---|---|---|
| `db` | `postgres:17-alpine` | PostgreSQL, data in `postgres_data` |
| `api` | `Dockerfile.dev` | Rails server on `:3000`, runs `db:prepare` |
| `worker` | `Dockerfile.dev` | Solid Queue worker (`bin/jobs`); waits for `api`, skips `db:prepare` |

Production is unaffected: it uses the separate `apps/api/Dockerfile` (Kamal /
Thruster, non-root, `RAILS_ENV=production`). `Dockerfile.dev` is development-only.
