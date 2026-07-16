# PAAG-301: Portal — rol auxiliary y navegación del gestor de contenidos

**Épica**: E10 Portal | **App**: `apps/portal` | **Asignado**: Dev C
**Depende de**: PAAG-002; PAAG-004 mergeado para probar real | **Rama**: `feature/paag-301-portal-base`

## Contexto

`apps/portal` (Next.js 16) ya tiene: BFF auth con cookies httpOnly (`src/app/api/auth/`),
protección por roles en `src/proxy.ts` y layout `(app)` (hoy `admin`/`member`). El gestor de
contenidos PAAG es para roles `auxiliary` y `admin` (ver actores en `spec.md`).

## Alcance

1. Extender el manejo de roles del portal para reconocer `auxiliary` (tipos, sesión, guards).
2. Rutas nuevas bajo `(app)`: `/content` (dashboard del gestor), `/content/exercises`,
   `/content/imports`, `/content/grades` (placeholders con layout; se llenan en 302–304).
   Accesibles para `auxiliary|admin`; `member` → `/access-denied`.
3. Navegación lateral/superior del gestor con los estilos de PAAG-002 (chips/pills, cards).
4. Dashboard `/content`: cards de resumen (total ejercicios por estado, últimos imports) —
   datos de `GET /api/v1/management/exercises` vía BFF; **si el backend aún no está, usar un
   fetcher mock detrás de la misma interfaz** (patrón: módulo `src/lib/paag-api.ts` con
   implementación real + mock conmutable por env `NEXT_PUBLIC_USE_MOCK_API`).
5. Tests (Vitest): guards de rol, render del dashboard con mock.

## Criterios de aceptación

- Login como auxiliary → ve `/content`; como member → denegado; como admin → ve todo.
- El fetcher mock/real es intercambiable sin tocar componentes.

## Verificación

```bash
cd apps/portal
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
