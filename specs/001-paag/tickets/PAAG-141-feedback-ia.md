# PAAG-141: Servicio de feedback semántico con IA

**Épica**: E05 IA | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-122, PAAG-131 | **Rama**: `feature/paag-141-feedback-ia`

## Contexto

Feedback tipo "te equivocaste en la ley de signos" cuando el estudiante falla un paso.
**Leer ADR-004** (`docs/architecture/decisions/004-ai-feedback-behind-rails.md`) y
`docs/ai-development-workflow.md` (reglas de features IA del repo). La gema `anthropic` ya
está en el `Gemfile`; `ANTHROPIC_API_KEY` ya está prevista en `apps/api/.env.example`.

## Alcance

1. `Ai::FeedbackService.call(step_submission:)` en `app/services/ai/`:
   - Input al modelo: enunciado del ejercicio, prompt del paso, respuesta esperada (shape,
     no necesariamente la solución literal en choice), respuesta del estudiante, veredicto
     determinista.
   - Prompt del sistema: tutor de matemática, responde SOLO JSON
     `{"verdictAgrees": bool, "feedback": "<=280 chars, español, tono amable>", "errorTag": "sign_error|arithmetic|concept|format|other|null"}`.
   - Parsear y **validar el schema** del output; JSON inválido → `ai_status: error`.
2. Adapter: `Ai::Providers::Anthropic` implementa `#complete(system:, user:, max_tokens:)`;
   `FeedbackService` no conoce la gema directamente (permite swap de proveedor).
3. Reglas duras: timeout 8s (envolver la llamada), sin reintentos, **la IA nunca cambia
   `correct`** — si `verdictAgrees=false`, loguear warning con ids (sin PII) y descartar.
4. Kill switch: `AI_FEEDBACK_ENABLED=false` → `ai_status: skipped` sin tocar la red.
5. Integrar en el punto único que dejó PAAG-122 (persistir `ai_feedback`/`ai_status`).
6. Tests **exclusivamente con dobles** (stub del adapter): éxito, timeout, JSON inválido,
   disabled. Ningún test toca la red (guard: sin API key en test env).

## Criterios de aceptación

- Con la API key ausente o `AI_FEEDBACK_ENABLED=false`, todo el flujo de solving funciona
  (SC-004 del spec).
- La respuesta del endpoint incluye `feedback.ai` y `aiStatus` según contrato `solving.md`.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
