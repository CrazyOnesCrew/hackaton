# Contrato: Import XML y Export CSV

Ambos requieren rol `auxiliary` o `admin` (Bearer vía BFF del portal).

## Import XML

### `POST /api/v1/management/exercise_imports`

`multipart/form-data` con campo `file` (XML conforme a [exercise-bank.xsd](./exercise-bank.xsd),
máx 5 MB). Respuesta 202 (procesa en background con Solid Queue):

```json
{ "data": { "id": 55, "status": "pending", "filename": "algebra-batch-1.xml" } }
```

XML malformado (no parseable / no valida contra XSD) → 422 inmediato con `details`.

### `GET /api/v1/management/exercise_imports/:id`

Polling del portal (cada 2s hasta `completed|failed`):

```json
{ "data": {
  "id": 55, "status": "completed", "filename": "algebra-batch-1.xml",
  "report": {
    "created": 12,
    "rejected": [{ "index": 3, "title": "Ejercicio X", "errors": ["topic slug 'foo' no existe"] }]
  }
} }
```

Semántica: transaccional **por ejercicio** — los válidos se crean (en `draft`), los inválidos
se reportan; un archivo nunca queda a medias dentro de un mismo ejercicio.

### `GET /api/v1/management/exercise_imports?page=`

Historial de imports del equipo.

## Export CSV (contingencia grade passback)

### `GET /api/v1/management/grade_exports?contextId=<lti_context_id>`

Respuesta 200, `Content-Type: text/csv`, columnas compatibles con la importación de
calificaciones de Moodle:

```csv
username,email,fullname,grade,lesson,completedat
jperez,jperez@example.com,Juan Pérez,85.00,ecuaciones-lineales,2026-07-16T18:30:00Z
```

- `grade`: `finalScore * 100`, dos decimales.
- Una fila por `lesson_session` completada del contexto; si un estudiante tiene varias, se
  exporta la de mayor nota.
- `contextId` inexistente → 404.

### `GET /api/v1/management/lti_contexts`

Para poblar el selector del portal:
`{ "data": [{ "contextId": "ctx-1", "contextTitle": "Curso Álgebra 2026", "platformName": "Moodle",
"lessonSessionsCount": 42 }] }`.
