# Contrato: Gamificación

Solo usuarios autenticados (Bearer). Invitados: la app muestra puntos de la sesión localmente,
sin persistencia remota.

## `GET /api/v1/profile/gamification`

```json
{ "data": {
  "points": 1250,
  "currentStreak": 5, "bestStreak": 12, "lastActivityOn": "2026-07-16",
  "badges": [
    { "key": "first_lesson", "name": "Primera lección", "description": "Completaste tu primera lección",
      "icon": "trophy", "earnedAt": "2026-07-01T10:00:00Z" }
  ],
  "availableBadges": [
    { "key": "streak_7", "name": "Racha de 7", "description": "Practica 7 días seguidos", "icon": "flame" }
  ]
} }
```

## Reglas (viven en Rails, ticket PAAG-401)

- Puntos: suma de `score` de cada `attempt` completado.
- Racha: días calendario consecutivos con ≥1 attempt completado (zona horaria UTC).
- Insignias seed: `first_lesson`, `streak_7`, `hard_solver` (5 ejercicios hard),
  `perfect_lesson` (lección con 100%), `persistent` (25 attempts completados).
- La asignación ocurre en el backend al completar attempts/lecciones; los clientes solo leen.
