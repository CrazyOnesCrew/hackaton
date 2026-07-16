# PAAG-162: AGS grade passback asíncrono + auditoría

**Épica**: E07 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-161, PAAG-122 | **Rama**: `feature/paag-162-ags-passback`

## Contexto

Enviar la nota al LMS al completar una lección LTI. **Contrato: `contracts/lti.md` sección
"AGS"**. Modelo `GradeSync` en `data-model.md`. Usar `faraday` (ya en Gemfile) para HTTP.

## Alcance

1. Migración/modelo `GradeSync`.
2. `Lti::AccessTokenClient`: client-credentials JWT (firmado con la llave privada de la
   tool, `aud` = auth_token_url) → token con scope de scores; cachear hasta expirar.
3. `GradePassbackJob` (Solid Queue): construir el payload score según contrato, POST a
   `{line_item_url}/scores`, registrar resultado en `grade_syncs`.
   Reintentos: `retry_on` con backoff exponencial, máx 5; agotados → status `failed` +
   `last_error`.
4. Conectar el hook que dejó PAAG-122 en `POST /lesson_sessions/:id/complete`
   (solo `origin=lti` y con `line_item_url` presente; sin line item → `failed` inmediato con
   motivo "no line item", visible para contingencia CSV).
5. Tests con stubs de Faraday: éxito, 401 (token expirado → refresh), 5xx con reintento,
   agotamiento. Sin red real.

## Criterios de aceptación

- Completar una lección LTI encola el job y termina en `grade_syncs.status=sent` (stub 200).
- El estado del sync es consultable (se refleja en `complete` response según `solving.md`).

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
