# API — AI-First Project Template

Ruby on Rails 8.1 API backend for the template. PostgreSQL, API-only (no bundled
frontend). Rails is the source of truth for users and sessions.

## Stack

| Component | Version |
|---|---|
| Ruby | 3.4.9 |
| Rails | 8.1.3 |
| PostgreSQL | 14+ |
| Puma | ≥ 5.0 |

**Key gems**

| Gem | Purpose |
|---|---|
| `rack-cors` | CORS for mobile and web clients |
| `solid_queue` | Background jobs (PostgreSQL-backed) |
| `solid_cache` | Database-backed cache |
| `solid_cable` | WebSockets over PostgreSQL |
| `bcrypt` | Password hashing (`has_secure_password`) |
| `anthropic` / `faraday` | AI provider base — keep provider calls behind Rails |

---

## Initial setup

```bash
cd apps/api
bundle install
bin/rails db:prepare      # create the database and run migrations
bin/rails db:seed         # load demo users (admin@example.com / member@example.com)
```

### Environment variables

The API reads database configuration from environment variables. With a standard
local PostgreSQL install you usually need nothing extra.

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `127.0.0.1` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | _(empty)_ | PostgreSQL password |
| `DB_NAME` | `template_development` | Development database |
| `DB_TEST_NAME` | `template_test` | Test database |
| `APP_NAME` | `AI-First Project Template` | Surfaced by `GET /api/v1/info` |
| `SEED_PASSWORD` | `Password123` | Password for demo seed users |
| `RAILS_MASTER_KEY` | — | Required in production |
| `ANTHROPIC_API_KEY` | — | Required when enabling AI features |

Override locally in `apps/api/.env` (gitignored, auto-loaded by `dotenv-rails` in
`development`/`test`). Copy `.env.example` to `.env` and change only what you need:

```bash
cp .env.example .env
```

If `db:prepare`/`db:seed` fail with `PG::ConnectionBad: ... fe_sendauth: no
password supplied` (or "connection refused"), another PostgreSQL is likely
already bound to port 5432. Diagnose with `lsof -nP -iTCP:5432 -sTCP:LISTEN`
and set `DB_PORT` accordingly in `.env`.

---

## Running in development

```bash
bin/rails server -b 0.0.0.0
```

The API listens on `http://localhost:3000`. `-b 0.0.0.0` lets physical devices on
the same Wi-Fi reach it. Health check:

```bash
curl http://localhost:3000/up
```

---

## Endpoints

Base URL: `http://localhost:3000/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/up` | no | Health check |
| `GET` | `/api/v1/info` | no | API metadata (example endpoint) |
| `POST` | `/api/v1/registrations` | no | Create an account, returns a session |
| `POST` | `/api/v1/sessions` | no | Log in, returns a session token |
| `DELETE` | `/api/v1/sessions/current` | yes | Revoke the current session |
| `GET` | `/api/v1/profile` | yes | Current user's profile |
| `PATCH` | `/api/v1/profile` | yes | Update `displayName` / `email` |

Authenticated requests send `Authorization: Bearer <session token>`.

```bash
# Register, then read your profile
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Password123"}' \
  | ruby -rjson -e 'puts JSON.parse(STDIN.read)["data"]["session"]["token"]')

curl http://localhost:3000/api/v1/profile -H "Authorization: Bearer $TOKEN"
```

---

## Data model

The template ships a minimal, generic schema:

```
users     — accounts (email, password_digest, role[admin|member], status, deleted_at)
  └── sessions  — bearer-token sessions (token, expires_at, last_seen_at, revoked_at)
```

The implemented schema's source of truth is `db/schema.rb` and `db/migrate/`. Add
your own domain models with migrations — do not hand-edit `db/schema.rb`.

---

## Code structure

```
app/
├── controllers/
│   └── api/v1/
│       ├── info_controller.rb            # example public endpoint
│       ├── registrations_controller.rb
│       ├── sessions_controller.rb
│       ├── profiles_controller.rb
│       └── concerns/authenticatable.rb   # bearer-token auth + require_role
└── models/
    ├── user.rb
    ├── session.rb
    └── concerns/discardable.rb           # soft-delete scopes
```

---

## Demo data

`db/seeds.rb` creates example accounts only (`admin@example.com`,
`member@example.com`). Replace them with your project's seeds. Never seed real
credentials.

---

## Tests

```bash
bin/rails test                                        # full suite
bin/rails test test/models/user_test.rb               # a single file
```

Coverage: user/session models and the authentication endpoints.

---

## Code quality

```bash
bin/rubocop          # linter and formatting
bin/brakeman         # security analysis
```

---

## Conventions

- All business endpoints live under `/api/v1`.
- Responses use JSON with `camelCase` fields; request bodies use `camelCase`.
- Errors return `{ "error": { "code": "...", "message": "...", "details": {} } }`.
- See `docs/architecture/api-guidelines.md` for the full standard.
