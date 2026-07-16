# PAAG-103: Endpoints de gestión del banco (`/management/exercises`)

**Épica**: E01 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-101, PAAG-004 | **Rama**: `feature/paag-103-endpoints-gestion`

## Contexto

CRUD para auxiliares/admins desde el portal. **Contrato: `specs/001-paag/contracts/content.md`
(sección "Gestión")**. Autorización con el helper `require_content_manager!` de PAAG-004.
Namespace nuevo: `Api::V1::Management`.

## Alcance

1. `GET /api/v1/management/exercises` — filtros `topicId/status/difficulty`, paginación
   (`page`, 25 por página, meta `{page,totalPages,totalCount}`), **con** respuestas correctas
   y pistas completas (es la vista de gestión).
2. `POST /api/v1/management/exercises` — crea exercise + steps + hints anidados en una
   transacción; estado `draft`; 422 con `details` por campo si algo falla.
3. `PATCH /api/v1/management/exercises/:id` — parcial; publicar exige `publishable?` (422 si no).
4. `DELETE .../:id` — discard (soft-delete), 204.
5. `PATCH /api/v1/management/topics/:id/reorder` — body `{exerciseIds: []}`, valida que
   pertenezcan al topic.
6. Tests: 403 para `member`, 200 para `auxiliary` y `admin`, validaciones de publish, reorder.

## Criterios de aceptación

- Flujo completo por API: crear draft → editar → publicar → aparece en endpoints públicos.
- `member` recibe 403 en todos los endpoints de management.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
