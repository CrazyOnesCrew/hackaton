# Changelog

All notable changes to the portal are documented here (Keep a Changelog format).
The in-app "What's new" modal is driven by `src/lib/changelog.ts`; keep both in
sync with `package.json`'s version.

## [1.4.1] - 2026-07-16

### Added
- Cobertura Vitest adversarial (QA backfill PAAG-001–302): mock `paag-api`, filtros/archivar/reordenar del banco, preview con pistas, Input styleguide y rutas anidadas `/content`.

## [1.4.0] - 2026-07-16

### Added
- Exportación CSV de notas por contexto LTI (`/content/grades`) con mock/BFF.

## [1.3.1] - 2026-07-16

### Fixed
- Client `fetch`/anchors respect `NEXT_BASE_PATH` so auth and content APIs work under `/portal`.

## [1.3.0] - 2026-07-16

### Added
- Importación XML con dropzone, polling de estado y reporte de creados/rechazados.

## [1.2.0] - 2026-07-16

### Added
- Banco de ejercicios: tabla con filtros, publicar/archivar, reordenar y preview con KaTeX.

## [1.1.0] - 2026-07-16

### Added
- Rol `auxiliary` y gestor de contenidos (`/content`) con dashboard mock/real
  conmutable vía `NEXT_PUBLIC_USE_MOCK_API`.

## [1.0.0] - 2026-07-13

### Added
- Initial version of the AI-First Project Template portal: Next.js 16, React 19,
  Rails-backed authentication, and a role-scoped shell (`/dashboard` for any
  authenticated user, `/admin` for the `admin` role).
