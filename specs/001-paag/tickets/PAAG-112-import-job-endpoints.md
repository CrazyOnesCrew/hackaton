# PAAG-112: Job de importación XML + endpoints + reporte

**Épica**: E02 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-111 | **Rama**: `feature/paag-112-import-job`

## Contexto

Flujo asíncrono de importación con Solid Queue (el servicio `worker` del compose ya lo corre).
**Contrato: `specs/001-paag/contracts/imports-exports.md` (sección "Import XML")**. Modelo
`ExerciseImport` ya creado en PAAG-101 (ver `data-model.md`).

## Alcance

1. `POST /api/v1/management/exercise_imports` — multipart `file`, máx 5 MB, content-type
   XML. Si el XSD no valida → 422 inmediato con `details` (usar `Parser.validate_schema`).
   Si valida → crea `ExerciseImport` (status `pending`, guarda `raw_xml` y `filename`) y
   encola `ExerciseImportJob`. 202.
2. `ExerciseImportJob`: status `processing` → por cada ejercicio parseado, transacción
   individual (`create!` de exercise+steps+hints en `draft`, `source: xml_import`,
   `exercise_import_id`); acumula `report` (`created`, `rejected[{index,title,errors}]`);
   status final `completed` (o `failed` si error inesperado, con log).
3. `GET /api/v1/management/exercise_imports/:id` y listado paginado.
4. Autorización `require_content_manager!` en todo.
5. Tests: import feliz, import mixto (válidos+rechazados), XSD inválido, límite de tamaño,
   403 para member. Job testeado con `perform_enqueued_jobs`.

## Criterios de aceptación

- Un XML con 3 ejercicios (1 con topic inexistente) termina `completed` con
  `report.created=2` y un rechazado con motivo claro.
- Los ejercicios creados quedan en `draft` y son visibles en `/management/exercises`.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
