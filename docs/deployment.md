# PAAG production deployment

Deploy PAAG on any host that can run Docker Engine and Docker Compose v2.
The same compose file works **on-premise** (your own server) and on a **cloud VM**.
There are no platform-specific steps beyond installing Docker and opening ports.

## Architecture

| Service  | Image / build                         | Role                                      |
|----------|---------------------------------------|-------------------------------------------|
| `db`     | `postgres:17-alpine`                  | Primary + Solid Queue databases           |
| `api`    | `apps/api/Dockerfile`                 | Rails API (Thruster on port 80)           |
| `worker` | same as `api`, command `bin/jobs`     | Solid Queue background jobs               |
| `portal` | `apps/portal/Dockerfile`              | Next.js admin portal (`/portal`)          |
| `web`    | `apps/mobile/Dockerfile.web`          | Static Expo web export (nginx)            |
| `proxy`  | `caddy:2`                             | TLS + path-based reverse proxy            |

Named volumes: `postgres_data`, `lti_keys`, `rails_storage`, `caddy_data`, `caddy_config`.

### Public URL map (path-based, default)

| Path        | Upstream                          |
|-------------|-----------------------------------|
| `/`         | `web` (student app)               |
| `/portal*`  | `portal`                          |
| `/api*`     | `api`                             |
| `/lti*`     | `api`                             |
| `/up`       | `api` health check                |

### Subdomain alternative

If you prefer hostnames instead of path prefixes, replace the site block in
`deploy/Caddyfile` with three sites (example):

```caddy
app.example.com {
	reverse_proxy web:80
}

portal.example.com {
	reverse_proxy portal:8080
}

api.example.com {
	reverse_proxy api:80
}
```

When using subdomains, rebuild the portal **without** `NEXT_BASE_PATH` (empty),
set `APP_WEB_URL` / `EXPO_PUBLIC_API_URL` to the matching public origins, and
point `PORTAL_RAILS_API_URL` at `http://api:80` (internal) or the public API URL
if the portal must call it from outside the compose network.

## Requirements

- Docker Engine 24+ and Compose v2 plugin
- ~4 GB RAM minimum (8 GB recommended when building images on the same host)
- 2+ CPU cores recommended
- Disk: ~10 GB free for images + database growth
- Outbound HTTPS for image pulls and (in production) ACME certificate issuance
- Open inbound **80** and **443** on the host firewall / security group

## Secrets and credentials

1. Copy the template:

   ```bash
   cp .env.production.example .env.production
   ```

2. Set a strong `POSTGRES_PASSWORD` and `ADMIN_SECRET`.

3. Provide `RAILS_MASTER_KEY`. This is the contents of `apps/api/config/master.key`
   from the environment that owns the Rails credentials. Without it the API
   container will not boot.

   If you do not have credentials yet (fresh clone):

   ```bash
   cd apps/api
   bin/rails credentials:edit
   # copy config/master.key value into RAILS_MASTER_KEY
   ```

   Never commit `master.key` or `.env.production`.

4. Set public URLs:

   - Local smoke: `CADDY_SITE=http://localhost`, `APP_WEB_URL=http://localhost`,
     `EXPO_PUBLIC_API_URL=http://localhost`
   - Production: `CADDY_SITE=your.hostname`, `DOMAIN=your.hostname`,
     `APP_WEB_URL=https://your.hostname`,
     `EXPO_PUBLIC_API_URL=https://your.hostname`

5. Optional: `ANTHROPIC_API_KEY` when AI feedback is enabled.

## On-premise

1. Install Docker on the server and clone this repository.
2. Complete [Secrets and credentials](#secrets-and-credentials).
3. From the repository root:

   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

4. Wait until all services are healthy:

   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production ps
   ```

5. Smoke checks:

   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost/up        # expect 200
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost/           # student web
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost/portal     # portal
   ```

The API entrypoint runs `bin/rails db:prepare` on first boot (creates/migrates
the primary and queue databases). You do not run migrations by hand unless you
are recovering from a failed deploy.

## Cloud (any VM)

Same steps as on-premise. Typical extras:

1. Point a DNS **A/AAAA** record at the VM public IP (`DOMAIN` / `CADDY_SITE`).
2. Open ports 80/443 in the cloud firewall.
3. Set `CADDY_SITE` to the bare hostname (no `http://`) so Caddy can obtain
   certificates automatically.
4. Use HTTPS URLs for `APP_WEB_URL` and `EXPO_PUBLIC_API_URL`, then rebuild
   `web` (and portal if public URLs are baked in):

   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
   ```

No proprietary PaaS features are required.

## LTI tool keys

The compose stack mounts a named volume `lti_keys` at
`/rails/config/lti_keys` in `api` and `worker`.

Generate an RSA private key once and place it in the volume:

```bash
# Create a PEM on the host, then copy into the running api container volume path
openssl genrsa -out tool_private.pem 2048

docker compose -f docker-compose.prod.yml --env-file .env.production cp \
  ./tool_private.pem api:/rails/config/lti_keys/tool_private.pem

# Lock down permissions inside the container if needed, then restart api/worker
docker compose -f docker-compose.prod.yml --env-file .env.production restart api worker
```

Keep `LTI_TOOL_PRIVATE_KEY_PATH` pointing at that PEM path (default in the
example env file). Rotate by generating a new key, updating the LMS tool
registration, replacing the PEM in the volume, and restarting `api` / `worker`.
Remove the host copy of the PEM after install.

## PostgreSQL backups

Logical dump (recommended):

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "paag-$(date +%Y%m%d).sql.gz"
```

Restore into a stopped-or-empty database (destructive — take care):

```bash
gunzip -c paag-YYYYMMDD.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

Schedule dumps with cron or your orchestrator. Keep backups off the application
server when possible. Volume snapshots of `postgres_data` are a secondary option
but are not a substitute for tested logical dumps.

## Day-2 operations

| Action                         | Command |
|--------------------------------|---------|
| Follow API logs                | `docker compose -f docker-compose.prod.yml --env-file .env.production logs -f api` |
| Rails console                  | `docker compose -f docker-compose.prod.yml --env-file .env.production exec api bin/rails console` |
| Stop (keep volumes)            | `docker compose -f docker-compose.prod.yml --env-file .env.production down` |
| Rebuild one service            | `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build portal` |

## Troubleshooting

| Symptom | Likely cause | What to do |
|---------|--------------|------------|
| `api` exits immediately mentioning credentials / master key | Missing or wrong `RAILS_MASTER_KEY` | Set the key from `apps/api/config/master.key`; rebuild is not required, only recreate the container |
| `db` healthy but `api` unhealthy | Migrations failing or DB password mismatch | `logs api`; confirm `POSTGRES_*` match `DB_*` |
| Portal 404 under `/portal` | Image built without `NEXT_BASE_PATH=/portal` | Rebuild portal with the compose file (passes the build arg) |
| Student web calls wrong API host | `EXPO_PUBLIC_API_URL` baked at build time | Update `.env.production` and `docker compose ... up -d --build web` |
| TLS / certificate errors | DNS not pointing at the host, or `CADDY_SITE` still `http://localhost` | Fix DNS; set `CADDY_SITE` to the bare hostname; check `logs proxy` |
| Worker unhealthy | Jobs process not started | `logs worker`; ensure `api` finished `db:prepare` first |
| Out of memory during build | Host < 4 GB free RAM | Build on a larger machine, or build services one at a time |

## Smoke test checklist

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production config
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
docker compose -f docker-compose.prod.yml --env-file .env.production ps

curl -s -o /dev/null -w "%{http_code}\n" http://localhost/up
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/portal
```

Expect HTTP 200 from `/up`. The student web (`/`) and portal (`/portal`) should
return a successful HTML response (2xx).
