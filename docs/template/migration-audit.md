# Migration Audit — Turia → AI-First Project Template

> Stage 1 deliverable for `chore/create-ai-first-project-template`.
> Purpose: classify every part of the repository as **KEEP** (generic
> infrastructure), **REMOVE** (Turia domain), or **GENERALIZE** (useful but
> Turia-branded) before performing extensive changes.

**Branch:** `chore/create-ai-first-project-template`
**Source branch (untouched):** `master`
**Working tree at start:** clean (one pre-existing, unrelated `git stash` left intact).

---

## 1. Repository-level inventory

| Path | Classification | Action |
| --- | --- | --- |
| `apps/api` (Rails 8.1) | Mixed | Keep runtime/config; remove domain models, controllers, migrations, seeds, tests |
| `apps/mobile` (Expo/RN) | Mixed | Keep shell, theming, i18n, http client, state; remove domain features/screens |
| `apps/portal` (Next.js 16) | Mixed | Keep template shell, `ui/*`, auth proxy; remove admin/provider domain areas |
| `.claude/`, `.cursor/`, `.opencode/`, `.specify/` | KEEP | Generalize agent skills/config; strip Turia assumptions |
| `AGENTS.md`, `CLAUDE.md` | GENERALIZE | Rewrite as generic AI-first monorepo instructions |
| `docs/product/*` (vision, poc-*, glossary) | REMOVE | Turia product docs |
| `docs/architecture/*` | GENERALIZE | Keep generic guidelines; strip conceptual tourism model |
| `docs/design/*` (brand, stitch, guides) | REMOVE | Turia branding/mockups |
| `docs/archive/original-project-brief.md` | REMOVE | Turia brief |
| `docs/planning/roadmap.md` | REMOVE | Turia roadmap |
| `specs/001..017` | REMOVE | Turia feature specs |
| `specs/example`, `.specify/templates` | KEEP | Generic Spec Kit scaffolding |
| `STYLE.md` | GENERALIZE/REMOVE | Turia color/design system → generic placeholder |
| `turia-dbdiagram-dbml.txt` | REMOVE | Turia data model |
| `README.md` | GENERALIZE | Rewrite as template README |
| `.env`, `.env.example` | GENERALIZE | Replace Turia values with placeholders |
| `package.json`, `.mcp.json`, `opencode.json` | KEEP/GENERALIZE | Strip Turia naming |

---

## 2. `apps/api` (Ruby on Rails)

### KEEP (generic infrastructure)
- Rails app/runtime config: `config/*`, `Gemfile`, Solid Queue/Cache/Cable, CORS.
- `application_record.rb`, `application_controller.rb`, `application_job.rb`.
- Health check route (`GET /up`).
- Authentication primitives: `user.rb`, `session.rb`, `sessions_controller.rb`,
  `registrations_controller.rb`, `concerns/authenticatable.rb` — **generalize**
  (User currently carries a Turia `role` enum incl. `traveler`).
- API versioning shell (`/api/v1` namespace).
- Test harness: `test/support`, `test_helper`, generic fixtures scaffolding.

### REMOVE (Turia domain)
Models (28 domain): `country, region, destination, place, interest,
place_interest, suggested_route, route_place, route_interest, provider_profile,
provider_destination, provider_language, provider_specialty, language, tour,
tour_place, tour_language, tour_participation, tour_checkin, tour_review,
booking_request, booking_request_status_event, itinerary, itinerary_request,
itinerary_stop, media_asset`.

Controllers: all `api/v1/*` domain controllers (countries, regions,
destinations, places, interests, providers, tours, suggested_routes,
itineraries, booking_requests, tour_*, and the `admin/`, `provider/`, `me/`,
`provider_profile/` namespaces) + their presenter concerns.

Services: `itinerary_selector, record_tour_checkin, route_timeline_reorderer,
start_tour_participation, submit_tour_review, tour_place_reorderer`.

Migrations: all 28 (tourism catalog, providers, tours, bookings, itineraries,
gamification). → replaced by a clean baseline (users + sessions only).

Seeds: `db/seeds/*` (identity, taxonomies, geography, places, routes, providers,
tours, trips, booking_requests, ai_demo, analytics, gamification) + `seeds.rb`.

Tests: all domain model/controller/service tests.

### GENERALIZE
- `module TuriaApi` → generic module name (`ApiApp`/`Api`).
- `User#role` enum → keep `admin` + generic `member` (drop `traveler`/tourism roles).
- Retain one example authenticated endpoint (`/api/v1/profile`) as a template.

---

## 3. `apps/mobile` (Expo / React Native)

### KEEP
- Expo SDK 54 / RN 0.81 / Expo Router / TypeScript config.
- `_layout.tsx`, tab shell, theming, NativeWind, fonts.
- i18n (`src/lib/i18n`, `src/translations`) — reset copy to generic keys.
- HTTP client (`src/lib/api`), hooks infra (`src/lib/hooks`), auth storage
  (`src/lib/auth`), MMKV storage abstraction.
- Generic UI primitives in `src/components/ui`.
- `src/features/auth`, `src/features/settings`, `src/features/profile` (generalize).
- The AI feature (`src/features/turia-ai`) → rename to generic `ai-assistant`
  placeholder, decoupled from domain.

### REMOVE (domain features & screens)
- Features: `tours, discover, saved-trips, destinations, planner, providers,
  catalog, explore, feed, itinerary, booking-requests, routes, onboarding,
  home` (domain parts), `style-demo`.
- Routes: `(tabs)/explorar, rutas, planes`, `resultado, tours, planner,
  proveedores, destino/[id], ruta/[id], tour/[id], lugar/[id], pais/[id],
  proveedor/[id], itinerary/preview, trips/*, solicitudes/*, feed/*`,
  `onboarding.tsx`, `style.tsx`.
- `src/components/turia` (branded components).

### GENERALIZE
- `app.config.ts`, `package.json` name (`turia_mobile`), bundle IDs, slug,
  splash/icon assets → neutral template identity.
- Leave a minimal working app: Home, an Example screen, AI Assistant placeholder,
  Profile/Settings.

---

## 4. `apps/portal` (Next.js 16)

### KEEP
- Next.js/React/TS config, `ui/*` primitives, `components/layout` shell.
- Auth proxy (`src/proxy.ts`), Rails-backed session (`lib/session*`, `lib/rails.ts`,
  `lib/auth/server.ts`), `login`, `access-denied`, `api/auth/*`.
- Generic libs: `utils, format, validations, env, api-utils, error-reporting,
  inline-markdown, useTheme, contexts/*`.
- SEO/config scaffolding.

### REMOVE (domain)
- Route areas: `(app)/admin/{tours,providers,catalog,routes,users}`,
  `(app)/provider/{tours,requests}`, and matching `api/admin/*`, `api/provider/*`.
- Components: `admin-catalog, admin-tours, admin-routes, admin-providers,
  provider-booking-requests, provider-tours, provider-profile`.
- Domain libs: `provider-profile.ts`, domain parts of `constants.ts`, `types.ts`,
  `changelog.ts` (Turia entries).

### GENERALIZE
- Landing/home → minimal "AI-First Project Template" page with basic technical example.
- `package.json` name (`turia-portal`), metadata, SEO defaults.
- Keep role-scoped shell pattern (`admin`/`member`) as a documented example.

---

## 5. Agent / Spec Kit setup

- `.claude/skills/speckit-*`, `.cursor/skills/*`, `.opencode/*`: KEEP — generic
  Spec-Driven Development tooling. Verify no Turia hardcoding.
- `.specify/memory/constitution.md`: GENERALIZE (remove Turia-specific principles).
- `.specify/templates/*`: KEEP.
- `AGENTS.md` + `CLAUDE.md`: rewrite generic; centralize stable rules in `AGENTS.md`
  with `CLAUDE.md` importing it (current pattern), stripped of tourism scope.

---

## 6. Environment & secrets

- Root `.env` (366 bytes) + app-level env: audit for real values, replace with
  placeholders. **No real secrets to be printed or committed.**
- Provide `.env.example` per app with neutral placeholders
  (`APP_NAME`, `API_BASE_URL`, `AI_PROVIDER_API_KEY=`, `DATABASE_URL=`).

---

## 7. Risks detected

1. **Rails auth coupling** — `User#role` mixes generic (`admin`) and domain
   (`traveler`, `provider_admin`) roles; portal `proxy.ts` enforces these. Must
   generalize both sides in lockstep to avoid a broken auth flow.
2. **Clean migration baseline** — squashing 28 migrations to a fresh users/sessions
   baseline requires `schema.rb` regeneration; must verify `db:create/migrate/seed`
   from zero.
3. **Portal is a heavily customized Next.js template** — removing domain areas may
   leave dangling imports in shared nav/commands (`lib/navigation.ts`,
   `lib/commands.ts`, `components/layout`). Requires careful reference cleanup.
4. **Mobile i18n/translations** carry Turia copy across many keys; must reset
   without breaking the i18n loader.
5. **Cross-stack verification cost** — full validation needs `bundle install` +
   Postgres + `pnpm install` ×2 + builds; environment may not permit all commands.
   Any command that cannot run will be documented, not marked as passed.

## 8. Unnecessary dependencies (to confirm during Stage 10)
- Any gem/package used only by removed domain code (e.g. gamification/AI-demo
  helpers, domain-specific chart/map libs in portal/mobile). Confirm zero
  references before removal; no major version bumps.

## 9. Recommended improvements (safe, low-risk)
- Per-app `.env.example` files.
- Root monorepo scripts for install/typecheck/test across apps.
- Template customization checklist (`docs/template/customization-guide.md`).
- `.gitignore` review for template hygiene.
