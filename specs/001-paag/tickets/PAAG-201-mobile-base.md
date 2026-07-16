# PAAG-201: Mobile — cliente API, mocks de contratos y navegación base

**Épica**: E09 App estudiante | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: PAAG-003 (tokens); contratos publicados | **Rama**: `feature/paag-201-mobile-base`

## Contexto

`apps/mobile` (Expo 54 + expo-router + react-native-web) será la app del estudiante y del
público general, para **móvil y web desde el mismo código**. Ya tiene: cliente Axios
(`src/lib/api/client.tsx`, `EXPO_PUBLIC_API_URL`), auth con Zustand+MMKV
(`src/features/auth/`), y soporte de mocks (`EXPO_PUBLIC_USE_MOCK_API`). **Los contratos a
consumir están en `specs/001-paag/contracts/` (`content.md`, `solving.md`,
`gamification.md`)** — implementar contra ellos aunque el backend aún no exista.

## Alcance

1. Tipos TS de los contratos en `src/features/paag/types.ts` (Subject, Topic, Exercise,
   ExerciseStep, LessonSession, Attempt, StepSubmission, GamificationProfile — camelCase,
   idéntico a los contratos).
2. Capa de API en `src/features/paag/api.ts` siguiendo el patrón existente de
   `features/auth/api.ts`: funciones por endpoint de `content.md` y `solving.md`.
3. Mocks completos (mismo mecanismo `EXPO_PUBLIC_USE_MOCK_API` ya presente): banco con 2
   subjects / 4 topics / 6 ejercicios de 4 fases (usar contenido matemático realista, ej.
   ecuaciones lineales), flujo de solving stateful en memoria (crear lección, responder
   pasos con validación simulada, pistas, dificultad siguiente).
4. Soporte de invitado: si no hay Bearer, obtener y persistir `guestToken`
   (`POST /guest_sessions`) y mandarlo como `X-Guest-Token` (interceptor en el client).
5. Rutas nuevas (expo-router, placeholders): `practice/index` (temas), `practice/[topicId]`
   (lección activa), `practice/results`. Integrarlas al tab bar existente.
6. Render de enunciados con LaTeX: los statements traen `$...$`. Elegir e integrar solución
   compatible con native **y** web (evaluar `react-native-math-view` vs render por WebView vs
   `katex` en web con fallback de texto; documentar la elección en el PR). Si ninguna
   funciona bien en ambos, texto plano estilizado es aceptable para este ticket (dejar TODO).

## Criterios de aceptación

- Con `EXPO_PUBLIC_USE_MOCK_API=true`, la app navega temas → lección → responder un paso,
  en emulador **y** en `npm run web`.
- Tests de la capa API/mocks (Jest) pasando.

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
