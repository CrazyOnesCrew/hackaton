# PAAG-122: Endpoints del flujo paso a paso + pistas + scoring

**Épica**: E03 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-121, PAAG-131 | **Rama**: `feature/paag-122-endpoints-resolucion`

## Contexto

El corazón de PAAG: resolver ejercicios por fases con feedback inmediato. **Contrato exacto:
`specs/001-paag/contracts/solving.md`** — shapes, códigos y reglas están ahí; no inventar
campos. La validación de respuestas la provee PAAG-131 (`Validation::AnswerValidator`).

## Alcance

1. `POST /api/v1/lesson_sessions` — crea lección + primer attempt con ejercicio aleatorio
   publicado del topic en la dificultad pedida (selección simple; la lógica completa de
   dificultad es PAAG-151, aquí basta `Exercise.published.by_difficulty(d).order("RANDOM()")`).
2. `GET /api/v1/lesson_sessions/:id` — estado completo para reanudar.
3. `POST /api/v1/attempts/:id/step_submissions`:
   - Solo el step actual (422 si no); valida con `AnswerValidator` → `correct`.
   - Scoring: `max_score` − 2 por cada submission incorrecta previa del step − penalizaciones
     de pistas usadas; mínimo 0. Guardar score solo en la submission correcta.
   - Feedback IA: si `AI_FEEDBACK_ENABLED` y la respuesta fue incorrecta, invocar
     `Ai::FeedbackService` (PAAG-141). **Hasta que PAAG-141 exista, devolver
     `aiStatus: "skipped"`** — diseñar el punto de integración como una llamada única.
   - Si era el último step y quedó correcto → `attempt.complete!`.
4. `POST /api/v1/attempts/:id/hints` — revela siguiente hint, incrementa `hints_used`.
5. `POST /api/v1/lesson_sessions/:id/complete` — cierra, calcula `finalScore`; si
   `origin=lti` encola grade passback (integración real en PAAG-162; dejar el hook).
6. `GET /api/v1/lesson_sessions` — historial paginado, solo Bearer (invitado → 401).
7. Ownership: acceder a recursos de otro actor → 404. Tests de request de todo el flujo
   (feliz + errores), incluyendo flujo completo como invitado.

## Criterios de aceptación

- Con seeds, un test de request recorre: crear lección → responder mal → pista → responder
  bien × N pasos → attempt completed → complete lección → finalScore correcto.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
