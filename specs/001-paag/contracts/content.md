# Contrato: Contenido (banco de ejercicios)

## Lectura (pública — sin auth, solo contenido `published`)

### `GET /api/v1/subjects`

```json
{ "data": [{ "id": 1, "name": "Álgebra básica", "slug": "algebra-basica", "position": 1,
             "topicsCount": 4 }] }
```

### `GET /api/v1/subjects/:slug/topics`

```json
{ "data": [{ "id": 10, "name": "Ecuaciones lineales", "slug": "ecuaciones-lineales",
             "position": 1, "exerciseCounts": { "easy": 5, "medium": 3, "hard": 2 } }] }
```

### `GET /api/v1/exercises/:id`

Devuelve el ejercicio **sin** respuestas correctas ni pistas completas (solo conteo).

```json
{ "data": {
  "id": 100, "title": "Ecuación con signos", "statement": "Resuelve $2x + 3 = -5$",
  "difficulty": "medium", "topicId": 10,
  "steps": [{
    "id": 500, "phase": "identification", "position": 1,
    "prompt": "¿Qué tipo de expresión estás viendo?",
    "answerType": "single_choice",
    "options": [{ "id": "a", "label": "Ecuación lineal" }, { "id": "b", "label": "Ecuación cuadrática" }],
    "hintsAvailable": 2, "maxScore": 10
  }]
} }
```

`answerType`: `single_choice | multi_choice | numeric | expression`.
Para `numeric`/`expression` no hay `options`; la UI muestra input libre (teclado matemático).

## Gestión (rol `auxiliary` o `admin` — Bearer requerido; 403 si `member`)

### `GET /api/v1/management/exercises?topicId=&status=&difficulty=&page=`

Listado paginado **con** respuestas correctas y pistas (para preview del portal).
Respuesta: `{ "data": [...], "meta": { "page": 1, "totalPages": 5, "totalCount": 92 } }`.

### `POST /api/v1/management/exercises`

Body: mismo shape que el elemento `<exercise>` del XSD pero en JSON (title, statement,
topicId, difficulty, variables, steps[] con prompt/answerType/options/correctAnswer/
tolerance/maxScore/hints[]). Crea en `draft`. 201 con el ejercicio completo.

### `PATCH /api/v1/management/exercises/:id`

Actualización parcial. Cambiar `status` a `published` valida completitud (≥1 paso por fase
`procedure`, respuestas correctas presentes). 422 con `details` si no.

### `DELETE /api/v1/management/exercises/:id`

Soft-delete (discard). 204.

### `PATCH /api/v1/management/topics/:id/reorder`

Body: `{ "exerciseIds": [3, 1, 2] }` → reordena `position`. 200.

## Errores comunes

- 404 `not_found`: ejercicio inexistente o no publicado (en endpoints públicos).
- 403 `forbidden`: rol insuficiente en `/management/*`.
- 422 `validation_failed`: `details` lista errores por campo.
