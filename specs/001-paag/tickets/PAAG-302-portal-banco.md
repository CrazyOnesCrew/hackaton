# PAAG-302: Portal — listado y preview del banco de ejercicios

**Épica**: E10 | **App**: `apps/portal` | **Asignado**: Dev C
**Depende de**: PAAG-301 | **Rama**: `feature/paag-302-portal-banco`

## Contexto

Vista de gestión del banco (US5 parcial / FR-004). **Contrato:
`contracts/content.md` sección "Gestión"** (shapes con respuestas y pistas incluidas).
El portal ya usa `@tanstack/react-table` — aprovecharla.

## Alcance

1. `/content/exercises`: tabla paginada (título, topic, dificultad como chip de color,
   estado como chip, fuente, fecha) con filtros por topic/estado/dificultad
   (`GET /management/exercises` vía BFF).
2. Acciones por fila: publicar/despublicar (`PATCH`, con manejo del 422 de `publishable?` —
   mostrar los `details`), archivar (soft-delete con confirmación).
3. Preview de ejercicio (drawer o página `/content/exercises/[id]`): enunciado renderizado
   (markdown + LaTeX con `katex` — dependencia nueva justificada: render matemático, sin
   alternativa en el stack), pasos por fase con opciones marcando la correcta, respuestas
   esperadas, tolerancias y pistas con penalización. Es la herramienta del auxiliar para
   revisar antes de publicar.
4. Reordenar ejercicios dentro de un topic (`PATCH /management/topics/:id/reorder`) —
   botones subir/bajar es suficiente (no drag & drop).
5. Estados loading/error/vacío; estilos PAAG-002.
6. Tests: tabla con mock, flujo publicar con error 422, preview.

## Criterios de aceptación

- Un auxiliar puede encontrar un draft, previsualizarlo completo y publicarlo; los errores
  de publicación se muestran legibles.

## Verificación

```bash
cd apps/portal
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
