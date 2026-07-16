# PAAG-401: Gamificación backend — puntos, rachas e insignias

**Épica**: E11 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-122 | **Rama**: `feature/paag-401-gamificacion`

## Contexto

US10 del `spec.md`. **Contrato y reglas exactas: `contracts/gamification.md`**. Modelos en
`data-model.md` sección "Gamificación". Solo usuarios con cuenta (invitados no persisten).

## Alcance

1. Migraciones/modelos: `GamificationProfile` (1:1 User, creado lazy), `Badge`,
   `EarnedBadge`. Seeds de las 5 insignias del contrato.
2. `Gamification::Tracker.record_attempt_completed(attempt)` — invocado desde
   `Attempt#complete!` (solo si hay user): suma `score` a points, actualiza racha
   (días consecutivos UTC con actividad; hueco → reset a 1), evalúa insignias.
3. `Gamification::BadgeAwarder`: reglas de `first_lesson`, `streak_7`, `hard_solver`,
   `perfect_lesson`, `persistent` — idempotentes (unique index protege duplicados).
4. `GET /api/v1/profile/gamification` según contrato (earned + available).
5. Tests: rachas (continuidad, reset, mismo día no duplica), cada insignia, endpoint,
   invitado no genera perfil.

## Criterios de aceptación

- Completar attempts en días consecutivos incrementa la racha; el perfil refleja puntos e
  insignias según las reglas del contrato.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
