# PAAG-303: Portal — carga XML con reporte de importación

**Épica**: E10 | **App**: `apps/portal` | **Asignado**: Dev C
**Depende de**: PAAG-301 | **Rama**: `feature/paag-303-portal-import`

## Contexto

US5/CDU005: el auxiliar puebla el banco subiendo XML. **Contratos:
`contracts/imports-exports.md` (sección Import) y `contracts/exercise-bank.xsd`** (el
esquema que debe cumplir el archivo — enlazarlo en la UI para descarga).

## Alcance

1. `/content/imports`: dropzone de archivo (validación cliente: extensión .xml, ≤5 MB) +
   historial de imports (tabla: archivo, fecha, estado como chip, creados/rechazados).
2. Subida → `POST /management/exercise_imports` (multipart vía BFF) → fila `pending`;
   polling de `GET .../:id` cada 2s hasta `completed|failed` (con indicador animado).
3. Detalle del reporte: panel con `created` y tabla de `rejected` (índice, título, errores);
   422 inmediato (XSD inválido) → mostrar `details` sin crear fila de historial.
4. Ayuda integrada: card con enlace de descarga del XSD y un XML de ejemplo mínimo
   (colocar `public/examples/exercise-bank-example.xml` con 2 ejercicios válidos conforme
   al XSD).
5. Tests: subida feliz (mock), reporte con rechazados, XSD inválido.

## Criterios de aceptación

- Flujo completo con backend real (una vez PAAG-112 esté en main): subir el XML de ejemplo →
  ver reporte con creados → los ejercicios aparecen en `/content/exercises` como drafts.

## Verificación

```bash
cd apps/portal
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
