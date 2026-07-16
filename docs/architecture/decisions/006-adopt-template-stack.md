# ADR-006: Adopt the template stack; discard the proposal's technology choices

* Status: Accepted
* Date: 2026-07-16

## Context

The PAAG proposal document (`proyecto.md`) suggested Node.js + Express, MariaDB,
two separate React web frontends, DeepSeek and SymPy/Math.js. This repository is
an AI-first monorepo template that already ships Rails 8.1 + PostgreSQL
(`apps/api`), Next.js 16 (`apps/portal`) and Expo + react-native-web
(`apps/mobile`), with auth, roles, jobs, Docker and CI working.

## Decision

The proposal document is used **only as the functional specification** (flows,
use cases, pedagogy). All its technology choices are discarded in favor of the
repository stack:

| Proposal | Adopted instead |
|---|---|
| Node.js + Express backend | Rails 8.1 (`apps/api`) — ADR-002 |
| MariaDB | PostgreSQL 17 (already in `docker-compose.yml`) |
| Two React web frontends | `apps/mobile` (Expo + react-native-web: student app for mobile **and** web) + `apps/portal` (Next.js: content manager) |
| DeepSeek API | `anthropic` gem already present — ADR-004 |
| SymPy / Math.js validation | Deterministic Ruby validation — ADR-005 |

Additionally, the platform is **institution-neutral**: no university, faculty or
institutional system names appear in code, seeds, docs or UI copy. LMS
integration is generic LTI 1.3.

## Consequences

- No template code is thrown away; auth, sessions, roles, CI and Docker are
  reused as-is.
- The team works within one consistent rule set (AGENTS.md, constitution, ADRs)
  instead of maintaining a parallel Node stack.
