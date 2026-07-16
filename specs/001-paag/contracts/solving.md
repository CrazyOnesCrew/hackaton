# Contrato: Resolución paso a paso

Auth: Bearer (registrado/LTI) **o** `X-Guest-Token` (invitado). Todos los recursos de este
contrato pertenecen a quien los creó; acceder a los de otro → 404.

## Sesión de invitado

### `POST /api/v1/guest_sessions`

Sin auth. Crea identidad anónima. Respuesta 201:

```json
{ "data": { "guestToken": "gst_abc123..." } }
```

El cliente lo guarda (MMKV/localStorage) y lo manda como `X-Guest-Token`.

## Lecciones

### `POST /api/v1/lesson_sessions`

Body: `{ "topicId": 10, "difficulty": "medium" }` (difficulty inicial opcional, default `easy`).
Crea la lección y el **primer intento** con ejercicio aleatorio. Respuesta 201:

```json
{ "data": {
  "id": 900, "origin": "public_web", "status": "active", "topicId": 10,
  "currentAttempt": {
    "id": 901, "status": "in_progress", "exercise": { /* shape de GET /exercises/:id */ },
    "currentStep": { "id": 500, "position": 1, "phase": "identification", "...": "..." },
    "score": 0, "maxScore": 40
  }
} }
```

Las lecciones LTI **no** se crean por este endpoint: las crea el launch (ver `lti.md`) y el
cliente las recibe ya creadas vía deep link `?lessonSessionId=`.

### `GET /api/v1/lesson_sessions/:id`

Estado completo (para reanudar). Mismo shape que arriba + `attempts[]` resumidos.

## Envío de pasos

### `POST /api/v1/attempts/:id/step_submissions`

Body según `answerType` del paso actual (solo se acepta el paso actual; otro → 422):

```json
{ "exerciseStepId": 500, "answer": { "selectedOptionIds": ["a"] } }
{ "exerciseStepId": 501, "answer": { "value": -4 } }
{ "exerciseStepId": 502, "answer": { "expression": "(-5-3)/2" } }
```

Respuesta 201 — el backend valida determinísticamente y adjunta feedback IA si llegó a tiempo:

```json
{ "data": {
  "id": 700, "correct": false, "score": 6, "hintsUsed": 1,
  "feedback": {
    "deterministic": "Respuesta incorrecta.",
    "ai": "Revisa la ley de signos: al pasar el 3 al otro lado cambia a -3.",
    "aiStatus": "ok"
  },
  "attempt": { "id": 901, "status": "in_progress", "score": 6, "maxScore": 40,
               "nextStep": { "id": 501, "position": 2, "phase": "planning", "...": "..." } }
} }
```

Reglas: respuesta incorrecta **no** avanza el paso (la UI permite reintentar; cada reintento
resta puntaje según reglas del backend); `aiStatus: timeout|error|skipped` significa que solo
hay feedback determinista — la UI nunca espera a la IA para habilitar el siguiente paso.
Cuando el último paso queda correcto, `attempt.status` pasa a `completed` y `nextStep` es `null`.

### `POST /api/v1/attempts/:id/hints`

Body: `{ "exerciseStepId": 500 }`. Revela la siguiente pista y aplica penalización. 200:
`{ "data": { "hint": { "content": "..." }, "penaltyApplied": 2, "hintsRemaining": 1 } }`.

## Dificultad dinámica

### `POST /api/v1/lesson_sessions/:id/attempts`

Solo si el intento actual está `completed` o `abandoned`. Body:

```json
{ "difficultyChoice": "increase" }
```

`difficultyChoice`: `keep | increase | decrease`. Respuesta 201: nuevo `attempt` (mismo shape
que `currentAttempt`), con ejercicio aleatorio no repetido en la lección. Si no hay ejercicios
en el nivel pedido, el backend usa el más cercano y lo indica:
`"difficultyApplied": "medium", "difficultyRequested": "hard", "fallback": true`.

### `POST /api/v1/lesson_sessions/:id/complete`

Cierra la lección, calcula `finalScore` (0.0–1.0). Si `origin=lti`, encola el grade passback.
200: `{ "data": { "id": 900, "status": "completed", "finalScore": 0.85,
"gradeSync": { "status": "pending" } | null } }`.

## Historial (solo registrados)

### `GET /api/v1/lesson_sessions?page=`

Lecciones del usuario autenticado, más recientes primero (invitados: 401; su historial es local).
