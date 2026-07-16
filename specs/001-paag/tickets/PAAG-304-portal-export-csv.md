# PAAG-304: Portal — export CSV de notas

**Épica**: E10 | **App**: `apps/portal` | **Asignado**: Dev C
**Depende de**: PAAG-301 | **Rama**: `feature/paag-304-portal-export`

## Contexto

Contingencia del grade passback (ADR-003, US9). **Contrato:
`contracts/imports-exports.md` sección "Export CSV"**.

## Alcance

1. `/content/grades`: selector de contexto (`GET /management/lti_contexts` — nombre de
   plataforma, título del curso, conteo de lecciones) como cards seleccionables.
2. Botón "Descargar CSV" → `GET /management/grade_exports?contextId=` vía BFF (proxear el
   stream con headers de attachment intactos).
3. Card informativa: cuándo usar esto (passback bloqueado/fallido) y cómo importarlo en
   Moodle (texto breve, genérico).
4. Estado vacío (sin contextos LTI aún) con explicación.
5. Tests: selector con mock, descarga (mock del BFF).

## Criterios de aceptación

- Con backend real: seleccionar contexto y descargar un CSV válido con el nombre
  `grades-<contextId>-<fecha>.csv`.

## Verificación

```bash
cd apps/portal
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
