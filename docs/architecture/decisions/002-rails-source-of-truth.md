# ADR-002: Rails is the source of truth

* Status: Accepted
* Date: 2026-07-01

## Context

Mobile and web clients need to consume the same business rules. Duplicating
rules across clients causes divergence in validation, permissions, and computed
results.

## Decision

Rails (`apps/api`) is the source of truth for:

- Business rules and validation
- Persistence
- Authorization and identity (users and sessions)
- Serialization and API contracts
- External integrations, including AI-provider calls

## Consequences

Mobile and portal may perform client-side usability validation, but they are not
authoritative. Every meaningful operation is re-validated in Rails.

### Example

A client can prevent the user from submitting an obviously invalid value, but
Rails must also reject it — even if the request was crafted manually.

## Rule

Do not duplicate core business logic in the clients. Shared logic belongs behind
the API contract.
