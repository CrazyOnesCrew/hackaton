# Architecture

## Overview

Three independent applications share one contract: the clients authenticate and
read/write through the Rails API.

```text
┌─────────────┐        ┌─────────────┐
│   mobile    │        │   portal    │
│ Expo / RN   │        │  Next.js    │
└──────┬──────┘        └──────┬──────┘
       │  HTTPS (JSON, Bearer / cookie)
       └───────────┬──────────┘
                   ▼
            ┌─────────────┐        ┌──────────────┐
            │  api (Rails)│◄──────►│  PostgreSQL  │
            │ source of   │        └──────────────┘
            │ truth       │
            └──────┬──────┘
                   │ (server-side only)
                   ▼
            ┌──────────────┐
            │ AI provider  │  (kept behind Rails)
            └──────────────┘
```

## Responsibilities

**API (`apps/api`)** — the authority. Owns business validation, persistence,
authorization, serialization, and any AI-provider calls. Rails migrations are
the source of truth for the database (`db/schema.rb` is generated, never
hand-edited).

**Mobile (`apps/mobile`)** and **Portal (`apps/portal`)** — clients. They own UI,
navigation, input, client-side usability validation, loading/error states, and
local state. They consume documented API contracts and never duplicate
authoritative backend calculations or touch the database directly.

## Authentication

Rails is the single source of truth for users and sessions (ADR-002). Auth is
email/password against `POST /api/v1/sessions`, returning a bearer token.

- **Mobile** stores the token (MMKV) and sends `Authorization: Bearer <token>`.
- **Portal** exchanges credentials via its own `/api/auth/*` route handlers,
  which set an httpOnly session cookie; `proxy.ts` role-gates protected areas and
  the `(app)` layout re-verifies the session against Rails before rendering.

Roles in the template are `admin` and `member` — extend `User::ROLES` and the
clients together when you add your own.

## API conventions

- Business endpoints live under `/api/v1`.
- JSON with `camelCase` fields in both requests and responses.
- Errors: `{ "error": { "code", "message", "details": [] } }`.
- See [`architecture/api-guidelines.md`](architecture/api-guidelines.md).

## AI integration

LLM/provider calls stay **behind Rails**. Rails selects allowed candidates,
builds structured context, calls the provider, validates every returned
identifier against the database, and falls back deterministically on
failure/timeout. See [`ai-development-workflow.md`](ai-development-workflow.md)
and ADR notes in `architecture/decisions/`.

## Decisions

Architecture Decision Records live in
[`architecture/decisions/`](architecture/decisions/):

- `001-monorepo.md` — why a monorepo of independent apps.
- `002-rails-source-of-truth.md` — Rails owns business rules and identity.

Add an ADR for any change that affects multiple apps or the overall structure.
