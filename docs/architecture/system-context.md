# System Context

This template is a monorepo of three independent applications that share one
contract: the clients talk to the API.

## Actors and systems

| System | Role |
|---|---|
| `apps/mobile` (Expo / RN) | Client. UI, navigation, local state; consumes the API. |
| `apps/portal` (Next.js) | Client. Web admin/member portal; consumes the API. |
| `apps/api` (Rails) | Authority. Business rules, persistence, authorization, serialization, AI-provider calls. |
| PostgreSQL | Database owned exclusively by the API. |
| AI provider | External LLM/service, called only from Rails. |

## Boundaries

- Clients never access the database directly and never duplicate authoritative
  backend logic. They consume documented `/api/v1` contracts.
- The API is the only component that touches PostgreSQL and the only one that
  calls the AI provider.
- Identity (users and sessions) lives in Rails (see ADR-002).

## Communication

- Clients ↔ API: HTTPS, JSON, `camelCase` fields. Auth via bearer token
  (mobile) or httpOnly session cookie (portal). See
  [`api-guidelines.md`](api-guidelines.md).
- API ↔ database: Active Record; migrations are the source of truth.
- API ↔ AI provider: server-side only, with validation and deterministic
  fallback (see [`../ai-development-workflow.md`](../ai-development-workflow.md)).

For a diagram and responsibilities, see [`../architecture.md`](../architecture.md).
