# Turia Removal Report

Verification record for `chore/create-ai-first-project-template`. Confirms the
tourism product ("Turia") was removed and the repository now works as a generic
AI-first template.

**Source branch:** `master` (untouched)
**Template branch:** `chore/create-ai-first-project-template`

---

## 1. Terms searched

Case-insensitive, across source, config, tests, JSON/YAML, env files, static
assets, and file/directory names:

`turia`, `turismo`, `tourist`, `tourism`, `traveler`, `traveller`, `viaje`,
`travel`, `tour`, `agency`, `agencia`, `destination`, `destino`, `place`,
`lugar`, `itinerary`, `itinerario`, `route`, `ruta`, `Antigua Guatemala`,
`INGUAT`, `provider_admin`, `prisma`, `firebase`.

Generic words (`route`, `place`, `travel`) were reviewed **in context**: HTTP
routes, frontend routers, and Expo Router files are infrastructure and were kept;
tourism entities (`TourRoute`, `SuggestedRoute`, `Place`, `Destination`) were
removed.

## 2. Final verification

```bash
grep -ril "turia" . \
  | grep -v node_modules | grep -v '/.git/' | grep -v '/.next/'
```

**Result:** no matches in any git-tracked file.

Two intentional exceptions, both outside the shipped template:

| File | Status | Why kept |
|---|---|---|
| `.claude/settings.local.json` | **gitignored** (not shipped) | Local machine file: a historical allowlist of previously-approved shell commands. Not part of the template. |
| `docs/template/*.md` (this report + `migration-audit.md`) | tracked | These documents *are* the record of the removal; they must name what was removed. |

The root `.env` holds the user's **real** local credentials. It is gitignored,
was never committed, and was deliberately **not modified or copied** into any
documentation.

---

## 3. What was removed

### API (`apps/api`)

**Models (26 domain):** `booking_request`, `booking_request_status_event`,
`country`, `destination`, `interest`, `itinerary`, `itinerary_request`,
`itinerary_stop`, `language`, `media_asset`, `place`, `place_interest`,
`provider_destination`, `provider_language`, `provider_profile`,
`provider_specialty`, `region`, `route_interest`, `route_place`,
`suggested_route`, `tour`, `tour_checkin`, `tour_language`, `tour_participation`,
`tour_place`, `tour_review` (+ `concerns/publishable`).

**Controllers:** every `api/v1` domain controller plus the whole `admin/`,
`provider/`, `me/`, and `provider_profile/` namespaces, and all presenter
concerns (tour, itinerary, booking, media, participation, provider, user).

**Services (6):** `itinerary_selector`, `record_tour_checkin`,
`route_timeline_reorderer`, `start_tour_participation`, `submit_tour_review`,
`tour_place_reorderer`.

**Endpoints removed:** `/countries`, `/regions`, `/destinations`, `/places`,
`/interests`, `/languages`, `/suggested_routes`, `/itinerary_previews`,
`/itineraries`, `/providers`, `/tours` (+ stops/reviews/start), `/me/tours`,
`/booking_requests`, `/provider_profile/*`, all of `/admin/*` and `/provider/*`.
Verified at runtime: `GET /api/v1/tours` → **404**.

**Migrations:** all 28 tourism migrations replaced by a clean 2-migration
baseline (`create_users`, `create_sessions`). `schema.rb` regenerated.

**Seeds:** entire `db/seeds/` tree (identity, taxonomies, geography, places,
routes, providers, tours, trips, booking requests, AI demo, analytics,
gamification) replaced with two example accounts.

**Tests:** all domain model/controller/service tests and the
`catalog_test_data` / `admin_auth_test_helper` support files.

**Naming:** `module TuriaApi` → `TemplateApi`; `turia_development`/`turia_test` →
`template_*`; `turia_api` service/image → `template_api`.

### Mobile (`apps/mobile`)

**Feature modules deleted (16):** `booking-requests`, `catalog`, `destinations`,
`discover`, `explore`, `feed`, `home` (domain version), `itinerary`,
`onboarding`, `planner`, `providers`, `routes`, `saved-trips`, `style-demo`,
`tours`, `turia-ai`.

**Component library deleted:** `src/components/turia/` (28 branded components —
`tour-card`, `place-card`, `destination-card`, `route-card`, `itinerary-stop`,
`timeline-stop-card`, `interest-chip`, `turia-header`, `turia-screen`, …).

**Screens/routes deleted:** `(tabs)/explorar`, `rutas`, `planes`, `turia-ai`;
`resultado`, `tours`, `planner`, `proveedores`, `style`, `onboarding`;
`destino/[id]`, `ruta/[id]`, `tour/[id]`, `lugar/[id]`, `pais/[id]`,
`proveedor/[id]`, `itinerary/preview`, `trips/*`, `solicitudes/*`, `feed/*`.

**Rebuilt minimal app:** Home, AI Assistant (placeholder, no live model calls),
auth-aware Profile; auth and settings retained.

**Identity:** app name `turia_mobile` → `Template App`; bundle IDs/packages
`com.turia.mobile.*` → `com.example.template.*`; scheme `turia_mobile` →
`templateapp`; package `turia_mobile` → `template_mobile`. Theme tokens
(`--radius-turia*`) renamed; `AuthRole` reduced to `admin | member`.

### Portal (`apps/portal`)

**Route trees deleted:** `(app)/admin/{tours,providers,catalog,routes,users}`,
`(app)/provider/{tours,requests}`, and the matching `api/admin/*` and
`api/provider/*` handlers (≈60 files).

**Components deleted:** `admin-catalog`, `admin-providers`, `admin-routes`,
`admin-tours`, `provider-booking-requests`, `provider-profile`,
`provider-tours`.

**Libs:** `rails.ts` trimmed from 929 → ~103 lines (auth/profile client only);
`provider-profile.ts` and the domain `validations.ts` deleted.

**Rebuilt:** minimal landing, `/dashboard` (any authenticated user) and `/admin`
(admin-only) as the role-scoping example.

**Identity:** package `turia-portal` → `portal-template` (version reset to
1.0.0); metadata, landing, login, sidebar brand text; CSS tokens
`--color-turia-*` → `--color-app-*`; cookies `turia_session_*` →
`portal_session_*`; storage keys `turia-theme`/`turia-layout` → `template-*`.

### Docs & specs

Deleted: `docs/product/*` (vision, PoC scope/blueprint, glossary),
`docs/planning/roadmap.md`, `docs/archive/original-project-brief.md`,
`docs/design/*` (brand, design system, Stitch mockups, mobile navigation),
`docs/architecture/data/conceptual-model.md`, ADR-003 (AI itinerary) and ADR-004
(portal template), **all 17 feature specs** (`specs/001`–`017`), the
`turia-dbdiagram-dbml.txt` data model, root `STYLE.md`, and the stale portal
`docs/` tree.

Rewritten generic: root `AGENTS.md`, `CLAUDE.md`, `README.md`, the constitution,
`system-context.md`, `api-guidelines.md`, ADR-001/002, and the portal's
`AGENTS.md`/`CLAUDE.md`/`README.md`/`CHANGELOG.md`.

Added: `docs/getting-started.md`, `docs/architecture.md`,
`docs/ai-development-workflow.md`, `docs/template/customization-guide.md`.

---

## 4. Dependencies removed

| App | Package | Reason |
|---|---|---|
| api | `neighbor` (pgvector) | Unused; premature per the project's own scope rules |
| api | `pdf-reader` | Unused; premature |
| portal | `recharts` | Zero references after domain charts were removed |
| mobile | `@expo-google-fonts/inter` | Unused (app loads Lato) |
| mobile | `@tanstack/zod-form-adapter` | Zero references |

Kept deliberately: `anthropic` + `faraday` (the AI base the template advertises),
`@tanstack/react-table` (used by the generic `ui/data-table`), `zod`,
`L2` (structured logging), and all Expo/React Native runtime peers (removing them
would break the app even though they show zero direct imports).

No major version upgrades were performed.

---

## 5. Kept infrastructure (no Turia coupling)

Monorepo layout; Rails runtime/config (Solid Queue/Cache/Cable, CORS, health
check); generic auth (User/Session, bearer tokens, soft delete); Expo Router
shell, theming, i18n, HTTP client, MMKV storage, `components/ui` primitives;
Next.js App Router shell, `ui/*` primitives, design tokens, Rails-backed session
+ edge role gating; Spec Kit (`.specify/`, `specs/example/`) and the Claude /
Cursor / opencode agent configs.

---

## 6. Validation performed

Postgres was not initially available; a **throwaway container** was started for
validation and removed afterwards (the unrelated `digixim` Postgres on :5432 was
never touched).

| Check | Result |
|---|---|
| API `db:create` + `db:migrate` from zero + `db:seed` | ✅ 2 migrations up; tables = `users`, `sessions` only |
| API `bin/rails test` | ✅ 37 runs, 74 assertions, **0 failures** |
| API `bin/rubocop` | ✅ 37 files, 0 offenses |
| API `bin/brakeman` | ✅ 0 errors, 0 security warnings |
| API `zeitwerk:check` | ✅ eager-load clean (no dangling constants) |
| API runtime | ✅ `/up` 200 · `/api/v1/info` 200 · login 201 · `/profile` 200 · unauth 401 · `/tours` **404** |
| Mobile `pnpm type-check` | ✅ clean |
| Mobile `pnpm test` | ✅ 11 suites, **56 tests**, 0 failures |
| Mobile `pnpm lint` | ✅ 0 errors (32 pre-existing warnings) |
| Portal `npx tsc --noEmit` | ✅ clean |
| Portal `npm run test` | ✅ 5 files, **27 tests**, 0 failures |
| Portal `npm run lint` | ✅ 0 problems |
| Portal `npm run build` | ✅ compiled; routes: `/`, `/login`, `/access-denied`, `/dashboard`, `/admin`, `/api/auth/*` |

---

## 7. Remaining risks / open tasks

1. **Expo runtime not booted.** `pnpm start` (Metro/simulator) was not launched;
   type-check, lint, and unit tests pass, but the app was not run on a device or
   simulator. Verify with `pnpm start` locally.
2. **Mobile lint warnings (32).** Pre-existing and non-blocking: mostly
   `no-unknown-classes` for the custom `font-lato*` utilities (defined via
   `@layer utilities`, which the plugin can't see) and one `use`-prefix warning.
3. **Local `.env` files remain on disk** (gitignored, untouched) and still hold
   Turia-era values, including real keys in the root `.env`. Rotate/clean them
   manually if this working copy is reused; they are not part of the template.
4. **`ios/` and `android/` native folders** (if present locally) were not
   inspected; they are generated by Expo prebuild. Regenerate them after the
   bundle-ID change rather than editing by hand.
5. **No CI/CD pipeline exists** in the repo to generalize — nothing was found to
   migrate, so nothing was added.
6. **Deploy configs** (`apps/api/config/deploy.yml`, Dockerfiles) were renamed to
   `template_api` but were **not** exercised (no Kamal/Docker deploy was run).
