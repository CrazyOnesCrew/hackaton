# ADR-005: Deterministic math validation in Ruby, inside Rails

* Status: Accepted
* Date: 2026-07-16

## Context

The original proposal mixed SymPy (Python) and Math.js (JavaScript) for
validating open math answers. SymPy would require a second runtime/container;
Math.js would put authoritative logic in the clients, violating ADR-002.

## Decision

Validation is implemented **in Ruby, inside `apps/api`**, with typed answers:

- `single_choice` / `multi_choice`: exact comparison of option ids.
- `numeric`: absolute difference within a per-step tolerance.
- `expression`: **numeric equivalence sampling** — both the expected and the
  submitted expression are evaluated at N random points inside the domain
  declared by the exercise (`variables` with min/max); expressions are
  equivalent if all samples match within tolerance.
- Expressions are parsed by a small whitelist-based parser (arithmetic
  operators, declared variables, functions: `sin cos tan log ln sqrt abs exp`).
  Ruby `eval` is forbidden.

Clients may pre-validate formatting for UX, never authoritatively.

## Consequences

- Zero new runtimes or containers; the whole validation is cheap, deterministic
  and unit-testable.
- Symbolic simplification proofs (CAS-grade) are out of scope; numeric sampling
  is sufficient for the exercise bank's answer formats. If a future need for
  symbolic validation is proven, it requires a new ADR.
