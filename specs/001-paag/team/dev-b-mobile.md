# Dev B — App estudiante (`apps/mobile`, móvil + web)

## Tu rol

Construyes la experiencia del estudiante y del público general con Expo + react-native-web:
**el mismo código produce la app de celular (iOS/Android) y la versión web**. Trabajas
mock-first: no esperas al backend, implementas contra `specs/001-paag/contracts/` con los
mocks del proyecto y cambias a integración real cuando Dev A mergea cada épica.

## Lectura inicial (una vez)

1. `AGENTS.md` y `styleguide.md` (raíz) — el styleguide es tu norte visual
2. `specs/001-paag/spec.md` (historias US1–US4, US8, US10) y `contracts/`:
   `content.md`, `solving.md`, `gamification.md`, `lti.md` (solo el flujo de redirect)
3. Código existente: `apps/mobile/src/lib/api/client.tsx`, `src/features/auth/`,
   `src/app/` (rutas expo-router), config de Uniwind

## Tus tickets (en orden)

| # | Ticket | Qué es |
|---|---|---|
| 1 | PAAG-003 | Design tokens + Nunito + componentes base |
| 2 | PAAG-201 | Tipos, capa API, mocks, navegación, LaTeX |
| 3 | PAAG-202 | Home: temas y dificultad |
| 4 | PAAG-203 | Flujo paso a paso (la pantalla núcleo) |
| 5 | PAAG-204 | Feedback, resultados, dificultad siguiente |
| 6 | PAAG-205 | Historial y gamificación |
| 7 | PAAG-206 | Invitado pulido + entrada LTI web |

## Entorno

```bash
cd apps/mobile
pnpm install
EXPO_PUBLIC_USE_MOCK_API=true pnpm start   # móvil (Expo Go / emulador)
pnpm web                                    # versión web
pnpm type-check && pnpm lint && pnpm test
```

Cuando el backend esté en main: `docker compose up` en la raíz y
`EXPO_PUBLIC_API_URL=http://localhost:3000` sin mocks.

## Reglas que más te aplican

- **Todo se prueba en móvil Y en web** antes de abrir PR (react-native-web tiene diferencias:
  gestos, teclados, storage — MMKV en native, localStorage en web).
- Nada de lógica autoritativa en el cliente (ADR-002): validas formato para UX, el veredicto
  siempre viene del API.
- La UI nunca se bloquea esperando feedback IA (`aiStatus` puede ser timeout/error/skipped).
- Copy de UI en español; identificadores de código en inglés.
- Sigue los patrones existentes de `features/auth/` para API y stores.
