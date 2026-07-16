# AI-Assisted Development Workflow

This template is designed to be built with AI coding agents and to host AI
product features safely. Two separate concerns:

1. **Working with agents** — how you and the agents build the software.
2. **Building AI features** — how the product calls an LLM at runtime.

---

## 1. Working with agents

### Agent configuration

- `AGENTS.md` (repo root) holds the **canonical** rules for every agent.
- `CLAUDE.md` imports `AGENTS.md`; `.cursor/` and `.opencode/` reference the same
  rules. When a stable rule changes, edit `AGENTS.md` only.
- Apps may add nested `AGENTS.md`/`CLAUDE.md` with app-specific conventions that
  must not contradict the root rules.

### Spec-Driven Development (Spec Kit)

Build features as artifacts before code:

```text
/speckit.specify   → what & why (spec.md)
/speckit.clarify   → resolve ambiguity
/speckit.plan      → how / tech choices (plan.md)
/speckit.checklist → quality gates
/speckit.tasks     → small, verifiable tasks (tasks.md)
/speckit.analyze   → cross-artifact consistency
/speckit.implement → execute the tasks
```

When slash commands aren't available, produce the same artifacts by hand under
`specs/<number>-<name>/`. `specs/example/` is a scaffold to copy.

### Suggested model split

Use the right model for each phase (any capable model works; these are defaults):

| Phase | Goal | Model choice |
|---|---|---|
| Planning / spec | Breadth, trade-offs, architecture | A strong reasoning model |
| Implementation | Correct, minimal diffs | A fast capable coding model |
| Review | Find bugs / regressions | A separate model or fresh context |

Keeping planning, implementation, and review in **different contexts (or models)**
reduces the chance an agent rubber-stamps its own work.

### Verify before "done"

Run the focused checks for the touched app (see `AGENTS.md` §7). Report what ran
and its result honestly — never claim an unrun check passed. Do not commit or
push unless asked.

### Avoid coupling domain to infrastructure

- Keep reusable infrastructure (auth, HTTP client, UI primitives, config)
  separate from your domain code, so future features and future templates stay
  clean.
- Shared code that both clients need belongs behind the **API contract**, not
  duplicated in each client.

---

## 2. Building AI product features

**All provider/LLM calls stay behind Rails.** The controlled flow:

```text
validated input
   → Rails selects permitted candidates from the database
   → Rails builds a structured context
   → provider returns structured output
   → Rails validates every identifier / constraint
   → valid result, or deterministic fallback
```

The AI base ships in `apps/api` (`anthropic`, `faraday` gems). It may
select/order/explain/summarize allowed entities; it may **not** authoritatively
create records, prices, schedules, or database identifiers.

Every AI feature must define:

- Input schema and candidate data
- Output schema and validation
- Timeout and error behavior
- A **deterministic fallback**
- Logging/privacy behavior (store the minimum necessary)
- A test strategy that uses **deterministic doubles** — automated tests must not
  call a live model

Do not add embeddings, vector search, or document ingestion until a feature
actually needs them; dependencies don't define scope.
