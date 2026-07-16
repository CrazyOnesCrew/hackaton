# PAAG-171: Export CSV de notas compatible Moodle

**Épica**: E08 Contingencia | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-161, PAAG-122 | **Rama**: `feature/paag-171-export-csv`

## Contexto

Plan de contingencia cuando el grade passback está bloqueado (ADR-003). **Contrato:
`contracts/imports-exports.md` sección "Export CSV"**. La stdlib `csv` de Ruby es suficiente.

## Alcance

1. `GET /api/v1/management/lti_contexts` — contextos distintos de `lti_resource_links` con
   conteo de lecciones completadas.
2. `GET /api/v1/management/grade_exports?contextId=` — CSV según contrato:
   columnas `username,email,fullname,grade,lesson,completedat`; mayor nota por estudiante;
   `grade = finalScore*100` con 2 decimales; `Content-Disposition: attachment` con nombre
   `grades-<contextId>-<fecha>.csv`.
3. Autorización `require_content_manager!`. Sin N+1.
4. Tests: contexto con múltiples lecciones del mismo user (gana la mayor), contexto vacío,
   contexto inexistente (404), 403 para member, formato exacto del CSV.

## Criterios de aceptación

- El CSV descargado abre en un spreadsheet con columnas correctas y es aceptado por el
  formato de importación de calificaciones de Moodle.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
