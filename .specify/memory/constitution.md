<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Reason: Generalized from a specific product PoC into the reusable AI-First
Project Template. Domain-specific principles and scope boundaries were replaced
with template-neutral equivalents.
Principles:
  - I. Spec-Driven Development (retained, generalized)
  - II. Vertical Slices (retained, de-scoped from "mobile-first PoC")
  - III. Rails as Source of Truth (retained)
  - IV. Architectural Simplicity (retained, de-scoped from PoC)
  - V. Test Gate (retained)
Sections:
  - Scope Discipline (was "PoC Scope Boundaries")
  - Data & Content Integrity (generalized)
Templates reviewed:
  - .specify/templates/plan-template.md ✅
  - .specify/templates/spec-template.md ✅
  - .specify/templates/tasks-template.md ✅
-->

# Project Constitution

> This is the template's default constitution. When you start a real project
> from this template, adapt these principles to your product and re-version.

## Core Principles

### I. Spec-Driven Development

Every feature MUST begin with an approved `spec.md` before any code is written.
The Spec Kit workflow (`specify → clarify → plan → tasks → implement`) is the
default. Scope MUST NOT expand without updating the spec first. Meaningful
ambiguities MUST trigger a decision — do not resolve them unilaterally. No
endpoint, model, or UI component may contradict an approved contract.

**Rationale**: Spec-first prevents wasted cycles and keeps the API and its
clients in sync.

#### New branches
If the current branch is `master`/`main`, create and switch to a new branch per
feature, named after the specification. Open a pull request when the feature is
complete.

### II. Vertical Slices

Every milestone SHOULD produce a thin vertical slice: **client → API contract →
backend → data → tests**. When the backend for a feature does not yet exist,
clients use a mock adapter behind an interface so the real API can be swapped in
without restructuring calling code. Breadth MUST NOT be pursued at the cost of
completable, demonstrable flows.

### III. Rails as Source of Truth

`apps/api` (Rails) is the single source of truth for business logic and database
schema (ADR-002). Clients consume only documented API contracts and MUST NOT
duplicate business rules or assume an undocumented model/endpoint exists.

### IV. Architectural Simplicity

Complexity MUST be justified against real, current needs. Do not add
microservices, event-driven architecture, vector search, document ingestion, or
custom-trained models until a feature actually requires them. New production
dependencies require written justification. No ADR — no architecture change.

### V. Test Gate (Non-Negotiable)

A task is NOT complete until formatting, linting, type-checks, and relevant tests
pass:

- `apps/api`: `bin/rails test` + `bin/rubocop` + `bin/brakeman`
- `apps/mobile`: `pnpm check-all` (lint + type-check + test)
- `apps/portal`: `npx tsc --noEmit` + `npm run lint` + `npm run test` + `npm run build`

No task is done without running the appropriate gate. No hook bypass
(`--no-verify`, `--no-gpg-sign`) unless the user explicitly requests it with a
stated reason.

## Scope Discipline

Build only what the active spec requires. Do not implement future roadmap items
while completing the current feature. Every demonstrative value MUST be clearly
marked as example/seed data; never present fabricated data as real.

## Data & Content Integrity

Secrets, tokens, API keys, and credentials MUST NEVER be committed. Use
environment variables and gitignored `.env` files. Never place secrets in Expo
`EXPO_PUBLIC_*` variables. Collect the minimum personal data necessary.

The portal tracks a semantic version: bump `package.json`, prepend to
`src/lib/changelog.ts`, and mirror in `CHANGELOG.md` for every deployed change.

## Governance

This constitution supersedes other practices documented in the repository. Where
a conflict exists between this document and a README, comment, or convention,
this document wins.

**Amendment procedure**: A change to a Core Principle requires (1) updating this
file with an incremented version, (2) updating the Sync Impact Report comment,
and (3) verifying `.specify/templates/` artifacts stay consistent.

**Versioning policy**:
- MAJOR: Removal or incompatible redefinition of a Core Principle
- MINOR: New principle/section or materially expanded guidance
- PATCH: Clarification or wording fix

Runtime development guidance lives in `AGENTS.md` (canonical), `CLAUDE.md`
(root), and per-app files (`apps/*/AGENTS.md`, `apps/*/CLAUDE.md`,
`apps/api/README.md`).

**Version**: 2.0.0 | **Ratified**: 2026-07-01 | **Last Amended**: 2026-07-13
