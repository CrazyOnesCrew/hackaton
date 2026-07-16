# PAAG-004: Rol `auxiliary` en User

**Épica**: E00 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: nada | **Rama**: `feature/paag-004-rol-auxiliary`

## Contexto

`User` (`apps/api/app/models/user.rb`) tiene enum `role` con `admin` y `member`. PAAG
introduce el rol **auxiliar**: gestiona el banco de ejercicios y exporta notas, pero no
administra usuarios ni plataformas LTI (eso es de `admin`). Ver actores en
`specs/001-paag/spec.md`.

## Alcance

1. Migración + enum: agregar `auxiliary` al enum `role` (nuevo valor entero, no reordenar los
   existentes).
2. Helper de autorización reutilizable para los controladores `/management/*` que vienen en
   E01+: `require_content_manager!` (permite `auxiliary` y `admin`, 403 al resto) en el
   concern `Authenticatable` o un nuevo concern `Authorizable`.
3. Seeds: agregar un usuario auxiliar (`auxiliary@example.com`, password de `SEED_PASSWORD`).
4. Tests del modelo y del helper (usuario `member` → 403 en un controlador dummy o en el
   primero que lo use).

## Criterios de aceptación

- `User.roles` incluye `auxiliary`; usuarios existentes no cambian.
- Seeds crean admin, member y auxiliary.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
