# PAAG-002: Design tokens del styleguide en el portal (Tailwind 4)

**Épica**: E00 | **App**: `apps/portal` | **Asignado**: Dev C
**Depende de**: nada | **Rama**: `feature/paag-002-design-tokens-portal`

## Contexto

`styleguide.md` (raíz del repo — leerlo completo) define la identidad visual de PAAG:
paleta pastel (lavanda primario, ámbar acento), fondos blanco/gris muy claro, tipografía
sans redondeada (Nunito), elementos pill full-rounded, cards con radius 24–30px, flat design
sin sombras. El portal usa Tailwind CSS 4 (tokens vía `@theme` en CSS) con primitivos propios
en `apps/portal/src/components/ui/`.

## Alcance

1. Definir tokens en el CSS global del portal (`@theme`):
   - Colores: `--color-primary` (lavanda ~`#B9A5F5`), `--color-primary-soft` (~`#EDE8FB`),
     `--color-accent` (ámbar ~`#F5A623`), `--color-accent-soft`, `--color-surface`
     (~`#F5F6FA`), texto `--color-ink` (~`#1F2430`) y `--color-ink-muted` (~`#6B7280`).
     Ajustar tonos exactos al criterio del styleguide (pastel, bajo contraste de saturación).
   - Radios: `--radius-card: 1.5rem`, `--radius-pill: 9999px`.
2. Fuente **Nunito** vía `next/font/google` en el layout raíz.
3. Actualizar/crear primitivos en `src/components/ui/` respetando los existentes:
   `Button` (pill, variantes primary/secondary/ghost), `Chip` (activo lavanda / inactivo gris
   / destacado dark), `Card` (radius 24px, fondo surface, sin sombra), `Input` (pill, fondo
   gris claro). Sin dependencias nuevas.
4. Página demo interna `/(app)/styleguide` que muestre todos los primitivos (sirve de
   referencia visual para los demás tickets del portal).

## Criterios de aceptación

- Los primitivos existentes que usa el login/dashboard adoptan la nueva paleta sin romper
  las páginas actuales.
- `/(app)/styleguide` renderiza botones, chips, cards e inputs conforme al styleguide.

## Verificación

```bash
cd apps/portal
npx tsc --noEmit && npm run lint && npm run test && npm run build
```
