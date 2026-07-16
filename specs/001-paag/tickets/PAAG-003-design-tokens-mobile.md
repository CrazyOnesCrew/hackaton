# PAAG-003: Design tokens del styleguide en mobile (Uniwind + fuentes)

**Épica**: E00 | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: nada | **Rama**: `feature/paag-003-design-tokens-mobile`

## Contexto

`styleguide.md` (raíz — leerlo completo) define la identidad visual: paleta pastel lavanda/
ámbar, pills, cards radius 24–30px, flat design, tipografía redondeada. `apps/mobile` usa
Expo 54 + Uniwind (Tailwind 4 para RN) + `tailwind-variants`, con fuente Lato configurada hoy.
La app debe verse igual de bien en iOS/Android y **web** (react-native-web).

## Alcance

1. Tokens de color en la config de Uniwind/Tailwind del proyecto (mismos valores que
   PAAG-002: primary lavanda, accent ámbar, surface, ink, ink-muted — coordinarlos con Dev C
   para que ambas apps queden idénticas).
2. Reemplazar Lato por **Nunito** (`expo-font` / `@expo-google-fonts/nunito`), pesos 400/600/700/800.
3. Componentes base en `src/components/ui/` (respetar convenciones existentes):
   `Button` (pill), `Chip` (variantes activo/inactivo/dark), `Card` (radius 24, sin sombra),
   `ScreenHeader` (flecha atrás izquierda, título centrado, acción derecha — según styleguide §3).
4. Pantalla demo `src/app/styleguide.tsx` (solo dev) mostrando los componentes.

## Criterios de aceptación

- Los componentes se ven correctos en móvil (Expo Go o emulador) **y** en web (`npm run web`).
- Las pantallas existentes (login/register/tabs) siguen funcionando con la nueva fuente.

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
