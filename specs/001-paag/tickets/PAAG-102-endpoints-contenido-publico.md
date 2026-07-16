# PAAG-102: Endpoints públicos de lectura de contenido

**Épica**: E01 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-101 | **Rama**: `feature/paag-102-contenido-publico`

## Contexto

Los clientes (mobile y portal) leen el banco publicado. **El contrato exacto está en
`specs/001-paag/contracts/content.md` (sección "Lectura")** — respetar shapes, camelCase y
envelope `{data}` según `docs/architecture/api-guidelines.md`. Seguir el estilo de los
controladores existentes en `apps/api/app/controllers/api/v1/` (JSON manual, sin gemas de
serialización).

## Alcance

1. `GET /api/v1/subjects` — solo subjects con ≥1 topic con ejercicios publicados;
   incluye `topicsCount`.
2. `GET /api/v1/subjects/:slug/topics` — con `exerciseCounts` por dificultad (solo published).
3. `GET /api/v1/exercises/:id` — solo `published`; **sin** `correct_answer`, sin contenido de
   hints (solo `hintsAvailable`), sin `options[].correct`. Este endpoint lo consume la UI del
   estudiante: cuidado con filtrar todo lo que revele respuestas.
4. Sin autenticación (contenido público). Sin N+1 (includes).
5. Tests de controlador: shapes, filtrado de published, ausencia de campos sensibles
   (asserts explícitos de que `correctAnswer` no aparece).

## Criterios de aceptación

- Con los seeds de PAAG-101, los 3 endpoints devuelven exactamente los shapes del contrato.
- Un ejercicio `draft` da 404 en `GET /exercises/:id`.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
