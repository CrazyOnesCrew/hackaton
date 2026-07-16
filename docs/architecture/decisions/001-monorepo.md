# ADR-001: Use a monorepo

* Status: Accepted
* Date: 2026-07-01

## Context

The project needs a mobile app, an API, and a web portal. These applications
share product contracts, documentation, and development cycles even though they
use different technologies.

## Decision

Keep mobile, API, and portal in a single Git repository:

```text
apps/mobile
apps/api
apps/portal
```

Each app keeps its own runtime, dependencies, lockfile, tests, and build. There
is no root workspace or root build.

## Consequences

Positive:

- Centralized documentation and shared specs.
- Coordinated changes between clients and the API in one commit/PR.
- A single context for AI coding assistants.
- Easier to keep contracts in sync.

Trade-offs:

- Different package managers and runtimes per app.
- CI must scope builds/tests per app.
- App-specific rules must not leak between apps.

## Rules

- Each app keeps its own dependencies and may have local agent instructions.
- Specs live at the repo root under `specs/`.
- Architecture decisions live in `docs/architecture/decisions/`.
- No executable modules are shared between Rails and JavaScript.
- Do not create nested Git repositories; report a nested `.git` before touching it.
