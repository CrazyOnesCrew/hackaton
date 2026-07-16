# PAAG-205: Mobile — historial, perfil y gamificación

**Épica**: E09 | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: PAAG-201 | **Rama**: `feature/paag-205-mobile-historial`

## Contexto

US10 del `spec.md`. **Contratos: `contracts/gamification.md` y `contracts/solving.md`
(sección "Historial")**. La app ya tiene tab de perfil (`src/app/(tabs)/perfil` o similar —
respetar estructura existente). Invitados: historial **local** (MMKV), sin gamificación
remota.

## Alcance

1. Tab/pantalla de progreso:
   - Registrados: `GET /profile/gamification` → puntos (contador animado), racha actual/mejor
     (icono flama ámbar), grid de insignias (obtenidas a color, disponibles en gris) como
     cards estilo styleguide.
   - `GET /lesson_sessions` → historial de lecciones (tema, fecha, nota) como lista de cards.
2. Invitados: al completar lecciones, guardar resumen en MMKV (`localStorage` en web vía la
   misma abstracción); mostrar historial local + banner "Crea una cuenta para guardar tu
   progreso y ganar insignias" con CTA al registro existente.
3. Puntos de la sesión para invitado: contador local simple (no persiste al backend).
4. Extender mocks con el shape de gamificación.
5. Tests: render registrado vs invitado, persistencia local.

## Criterios de aceptación

- Usuario registrado ve puntos/racha/insignias del mock; invitado ve historial local y el
  banner de registro. Funciona en móvil y web.

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
