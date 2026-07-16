# API Guidelines

Conventions for the Rails API (`apps/api`). Follow these when adding endpoints so
mobile and portal can consume them consistently.

## Versioning

- Business endpoints live under `/api/v1`.
- Breaking changes require a new version (`/api/v2`) or a documented migration
  plan with updated clients and tests.

## Requests

- JSON bodies with `camelCase` field names.
- Authenticated requests send `Authorization: Bearer <session token>`.
- Validate the request in Rails regardless of any client-side validation.

## Responses

- Success wraps data in a `data` envelope:

  ```json
  { "data": { "id": "1", "displayName": "Alex" } }
  ```

- Field names are `camelCase`. Dates are ISO 8601 (UTC). Money, when present,
  is represented with an explicit amount and currency — never a bare number.

## Errors

- A single, predictable shape:

  ```json
  { "error": { "code": "validation_error", "message": "…", "details": [
      { "field": "email", "message": "is invalid" }
  ] } }
  ```

- `code` is a stable machine string; `message` is human-readable; `details` is
  optional per-field validation info.
- Never expose Rails stack traces or internal messages through the API.

## Status codes

| Code | Use |
|---|---|
| 200 | Successful read/update |
| 201 | Resource created |
| 204 | Successful with no body (e.g. delete, logout) |
| 401 | Missing/invalid authentication |
| 403 | Authenticated but not allowed |
| 404 | Not found |
| 422 | Validation error |
| 5xx | Server error (no internal details leaked) |

## Contracts

Every endpoint added or changed documents: HTTP method, path, request shape,
success response, validation errors, business errors, authorization
requirements, and example payloads. Put contracts under the active feature:

```text
specs/<feature>/contracts/
```

Clients must not depend on undocumented response fields.

## Example endpoints (template baseline)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/up` | no | Health check |
| `GET` | `/api/v1/info` | no | API metadata |
| `POST` | `/api/v1/registrations` | no | Create an account |
| `POST` | `/api/v1/sessions` | no | Log in |
| `DELETE` | `/api/v1/sessions/current` | yes | Log out |
| `GET`/`PATCH` | `/api/v1/profile` | yes | Read/update current user |
