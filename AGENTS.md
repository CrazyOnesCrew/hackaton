# AI-First Project Template — Agent Instructions

This is the **canonical** set of rules for AI coding agents (Claude Code,
Cursor, Codex, opencode, etc.) working in this repository. Agent-specific files
(`CLAUDE.md`, `.cursor/`, `.opencode/`) import or reference this file — keep the
stable rules here and do not duplicate them.

## 1. What this is

A reusable **AI-first monorepo template**. It ships three independent
applications and the tooling to build on them with spec-driven, AI-assisted
development. It has **no business domain** of its own — you add yours.

```text
.
├── apps/
│   ├── api/        # Ruby on Rails 8.1 API (source of truth for business rules)
│   ├── mobile/     # Expo / React Native app
│   └── portal/     # Next.js 16 web portal
├── docs/           # Architecture, getting started, AI workflow, customization
├── specs/          # Spec-Driven Development artifacts (Spec Kit)
├── .specify/       # Spec Kit templates + constitution
├── AGENTS.md       # This file (canonical rules)
└── CLAUDE.md       # Claude Code entry point (imports this file)
```

Each app is independent: its own runtime, dependencies, lockfile, tests, and
build. There is no root workspace or root build. Run app commands from the app
directory. Treat the repo root as the project root; do not create nested git
repositories.

## 2. Session startup

Before making changes:

1. Inspect the working directory and `git status`.
2. Identify which app(s) the task touches.
3. Read the active spec under `specs/<feature>/` if one exists.
4. Read only the relevant docs (see §4), not the whole tree.
5. Inspect existing code before proposing changes.

The repository is the source of truth for the current state — do not assume a
directory or file exists because documentation mentions it.

## 3. Architecture rules

- **Rails (`apps/api`) is the source of truth** for business rules, validation,
  persistence, authorization, and any AI-provider calls (ADR-002).
- Mobile and portal are **clients**: they consume documented API contracts and
  never duplicate authoritative backend calculations or talk to the database
  directly.
- **Rails migrations are the source of truth** for the implemented database.
  Never hand-edit `db/schema.rb`.
- Keep provider/LLM calls **behind Rails** with structured inputs and outputs;
  validate every identifier the model returns (see
  `docs/ai-development-workflow.md`).
- Architectural changes get an ADR under `docs/architecture/decisions/`.

## 4. Context-loading policy

Do not load the whole `docs/` tree for every task. Read what the task needs:

| Task | Read |
|---|---|
| Any feature work | `AGENTS.md`, `.specify/memory/constitution.md`, active `specs/<feature>/*` |
| Architecture | `docs/architecture.md`, `docs/architecture/system-context.md`, ADRs |
| API work | `docs/architecture/api-guidelines.md`, `apps/api/` |
| Database work | `apps/api/db/schema.rb`, `apps/api/db/migrate/` |
| AI features | `docs/ai-development-workflow.md` |
| First run / setup | `docs/getting-started.md` |
| Starting a new project from this template | `docs/template/customization-guide.md` |

## 5. Spec-Driven Development workflow

This template uses **Spec Kit**. The workflow (slash commands where available,
otherwise the same artifacts by hand):

```text
/speckit.specify → /speckit.clarify → /speckit.plan → /speckit.checklist
→ /speckit.tasks → /speckit.analyze → /speckit.implement
```

A feature directory (`specs/<number>-<name>/`) may contain `spec.md`, `plan.md`,
`tasks.md`, `data-model.md`, `contracts/`, `quickstart.md`. At minimum a feature
defines: objective, user, main flow, business rules, error/alternate states,
acceptance criteria, and explicit exclusions.

- No new feature implementation without an approved spec.
- Keep the *what/why* in `specify`, technology choices in `plan`.
- Do not run `implement` automatically after generating specs unless asked.
- `specs/example/` is a template scaffold — copy it, don't build from it.

## 6. Working rules

**Specification**
- Read `spec.md`, `plan.md`, `tasks.md` before editing code.
- Implement only the assigned scope; do not expand scope without updating the spec.
- One main feature per branch.

**Change discipline**
- Inspect existing code first; make small, reviewable changes; prefer minimal diffs.
- Match the surrounding code's conventions.
- Do not refactor unrelated code, rename files without need, or edit generated
  files / lockfiles by hand (use the package manager).
- Establish the API contract first for cross-app changes, then implement Rails
  behavior, then the client, then tests on both sides.

**Dependencies**
- Inspect existing dependencies before adding one. Justify new production deps
  (why the stack can't solve it, maintenance/security implications, alternative).
- Use each app's established package manager and lockfile.

**Security**
- Never commit secrets, tokens, or keys. Never put secrets in Expo
  `EXPO_PUBLIC_*` vars. Do not log credentials or sensitive data.
- Do not expose Rails stack traces through the API.

**Ambiguity**
- Don't invent behavior. State the ambiguity, propose a default, say whether it
  blocks, and continue with unaffected work.

## 7. Testing & definition of done

Run focused checks after focused changes; run the broader app checks before
declaring done.

| App | Commands |
|---|---|
| `apps/api` | `bin/rails test`, `bin/rubocop`, `bin/brakeman` |
| `apps/mobile` | `pnpm type-check`, `pnpm lint`, `pnpm test` (or `pnpm check-all`) |
| `apps/portal` | `npx tsc --noEmit`, `npm run lint`, `npm run test`, `npm run build` |

A task is done only when: the scope is implemented, acceptance criteria are met,
focused tests pass, required checks pass, contracts are updated for behavior
changes, DB changes use migrations, clients stay contract-compatible, loading/
error states are handled, no unrelated files changed, no secrets introduced, and
remaining limitations are reported. **Do not claim a check passed unless it was
actually run.**

## 8. AI feature rules

Every AI feature must define: input schema, candidate data, output schema,
validation, timeout behavior, error behavior, deterministic fallback, logging/
privacy behavior, and a test strategy that does **not** call a live model.
Automated tests must not depend on live AI responses. AI may select/order/explain
allowed entities; it may not authoritatively create records, prices, or
identifiers — Rails validates everything. See `docs/ai-development-workflow.md`.

## 9. Language & naming

Use **English** for code identifiers, DB names, API fields, classes, and file
names. User-facing copy can be localized per app. Commit messages in English
unless the repo adopts otherwise.

## 10. Git safety

Do not commit, push, rewrite history, force-push, or run destructive git/DB
commands without explicit instruction. Do not discard uncommitted user changes.
Report pre-existing uncommitted changes before touching overlapping files.

Suggested branch names: `feature/<name>`, `fix/<name>`, `docs/<name>`,
`chore/<name>`.

## 11. Keeping agent files in sync

When a stable rule changes, edit **this file** — not the per-agent copies.
`CLAUDE.md` and the other agent configs should reference this file so every agent
reads the same rules. Nested `AGENTS.md`/`CLAUDE.md` in an app may add
app-specific conventions but must not contradict this file, the constitution, or
accepted ADRs; report conflicts before implementing.
