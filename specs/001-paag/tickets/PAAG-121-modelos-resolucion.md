# PAAG-121: Modelos de resolución + sesión de invitado

**Épica**: E03 Motor | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-101 | **Rama**: `feature/paag-121-modelos-resolucion`

## Contexto

Estado de la práctica de un usuario. Leer `specs/001-paag/data-model.md` (sección
"Resolución") para columnas/enums exactos y `contracts/solving.md` para la semántica.

## Alcance

1. Migraciones y modelos: `LessonSession`, `Attempt`, `StepSubmission`.
   - `LessonSession`: check constraint `user_id` o `guest_token` presente; `origin` enum;
     `lti_resource_link_id` FK nullable (la tabla LTI llega en PAAG-161 — dejar la columna
     como bigint nullable sin FK por ahora y anotar TODO, o crear una migración de FK en
     PAAG-161; decidirlo ahí, no bloquear).
   - `Attempt`: único `in_progress` por lesson_session (índice parcial).
   - `StepSubmission`: shape de `answer` validado contra el `answer_type` del step.
2. Sesión de invitado: `POST /api/v1/guest_sessions` (sin auth) → genera `guestToken`
   (`gst_` + `SecureRandom`, único). Concern `GuestAuthenticatable` que resuelve "el actor"
   desde Bearer **o** `X-Guest-Token` para los endpoints de solving.
3. Lógica de dominio en los modelos:
   - `Attempt#current_step` (primer step sin submission correcta, por position).
   - `Attempt#completed?` / `#complete!` (todos los steps con submission correcta).
   - `LessonSession#compute_final_score` (promedio ponderado score/max_score de attempts
     completados) — se invoca desde PAAG-122.
4. Tests de modelos y del concern (Bearer, guest token, ninguno → 401).

## Fuera de alcance

- Endpoints del flujo (PAAG-122), validación de respuestas (PAAG-131).

## Criterios de aceptación

- No pueden existir dos attempts `in_progress` en la misma lección.
- Una `LessonSession` sin user ni guest_token es inválida a nivel DB y modelo.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
