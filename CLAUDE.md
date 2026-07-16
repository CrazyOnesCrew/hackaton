# CLAUDE.md

@AGENTS.md

This file is the Claude Code entry point. The **canonical** rules live in
`AGENTS.md` (imported above) and are shared by every agent. Do not duplicate
them here — when a stable rule changes, edit `AGENTS.md`.

## Claude-specific notes

- **Session startup:** inspect `git status`, confirm which apps exist, read the
  active spec (if any) and only the docs relevant to the task (see the
  context-loading policy in `AGENTS.md`). The repository is the source of truth.
- **Planning:** for multi-file / multi-app / migration / architectural changes,
  summarize the outcome, identify affected apps and contracts, inspect existing
  code, then edit. Skip heavy planning for trivial isolated changes.
- **Spec Kit:** use the dot commands (`/speckit.specify`, `/speckit.plan`,
  `/speckit.tasks`, `/speckit.implement`, …). Do not run `implement`
  automatically after generating specs unless implementation was requested.
- **Editing discipline:** read the relevant section first, search for related
  usage, preserve conventions, prefer minimal diffs, don't rewrite whole files
  when a focused edit suffices, and don't overwrite uncommitted user changes.
- **Verification:** run the focused tests/linters/type-checks for the app you
  touched (see the table in `AGENTS.md` §7) before declaring work done. Report
  what you ran and its result honestly; never claim an unrun check passed.
- **Tool safety:** ask before committing, pushing, deleting unrelated files,
  rewriting history, or running destructive DB commands. Safe inspection is fine.
- **Nested instructions:** apps may have their own `AGENTS.md`/`CLAUDE.md`
  (e.g. `apps/portal/`). Apply them inside that subtree; report conflicts with
  root rules before implementing.

## Final report after code changes

Report: **Summary** (what changed / new behavior), **Files changed**,
**Validation** (commands run + results), **Acceptance criteria** met, and
**Remaining issues**. Keep it factual; do not claim done while checks remain
unmet.
