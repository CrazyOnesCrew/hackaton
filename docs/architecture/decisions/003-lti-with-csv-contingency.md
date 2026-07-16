# ADR-003: LTI 1.3 + AGS as LMS integration, with CSV export contingency

* Status: Accepted
* Date: 2026-07-16

## Context

PAAG must integrate with external LMS platforms (e.g. Moodle) for SSO and grade
synchronization, while remaining institution-agnostic. LMS-side network or admin
restrictions may block deep integration (grade passback) in some deployments.

## Decision

- Implement **LTI 1.3** (OIDC third-party login, resource link launch, tool JWKS)
  and **AGS 2.0** score publishing, entirely in Rails (`apps/api`).
- Grade passback runs asynchronously via Solid Queue with retries and an audit
  table (`grade_syncs`).
- Ship a **CSV grade export** (Moodle-compatible columns) in the portal from day
  one as the documented contingency path, not as an afterthought.
- Platform registration is data (`lti_platforms` table managed by admins), not
  configuration files, so any LTI 1.3 LMS can be connected without code changes.

## Consequences

- PAAG works fully without any LMS (public mode); LTI is additive.
- If AGS fails or is blocked, auxiliaries export grades via CSV; no user-facing
  flow depends on the LMS being reachable.
- We own the LTI implementation surface (JWT validation, JWKS, nonce handling);
  the `jwt` gem is an accepted new dependency for this.
