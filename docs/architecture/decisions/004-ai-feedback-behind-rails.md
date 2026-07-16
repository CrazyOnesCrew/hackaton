# ADR-004: AI semantic feedback via the existing Anthropic gem, behind Rails

* Status: Accepted
* Date: 2026-07-16

## Context

The original proposal suggested calling the DeepSeek API for semantic feedback.
This repository already ships the `anthropic` gem and an `ANTHROPIC_API_KEY`
convention, and ADR-002 requires all provider calls to live behind Rails.

## Decision

- Use the **`anthropic` gem already in the Gemfile** as the AI provider. No new
  provider dependency is introduced.
- All calls go through `Ai::FeedbackService` with a provider **adapter**
  (`Ai::Providers::Anthropic`), so swapping providers means implementing one class.
- Structured contract: the model receives the exercise statement, the step, the
  student answer and the deterministic verdict; it returns JSON
  (`verdictAgrees`, `feedback`, `errorTag`). Output is schema-validated.
- Hard rules: 8s timeout, no synchronous retries, the model can **never**
  override the deterministic verdict (disagreements are only logged).
- Deterministic fallback: if AI fails/times out, the deterministic feedback is
  the complete answer; no flow blocks on AI.
- Tests use doubles exclusively; no live model calls in the test suite.

## Consequences

- The platform is fully functional with AI disabled (spec SC-004).
- Provider costs and latency are isolated to one service object, easy to
  measure and cap.
