# PAAG-206: Mobile — modo invitado pulido + entrada LTI web

**Épica**: E09 | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: PAAG-203; PAAG-161 mergeado para probar real | **Rama**: `feature/paag-206-mobile-lti-entry`

## Contexto

La sesión dual de PAAG (FR-005): público (invitado o registrado) y estudiante LTI. El launch
LTI (backend) redirige a `APP_WEB_URL/lti-entry?token=<bearer>&lessonSessionId=<id>` — esta
ruta **solo aplica en web** (el LMS abre un navegador). Ver `contracts/lti.md` (flujo) y
`contracts/solving.md`.

## Alcance

1. Ruta `src/app/lti-entry.tsx` (expo-router, web): lee `token` y `lessonSessionId` de los
   query params, guarda el token en el auth store existente (mismo mecanismo que login),
   **limpia los params de la URL** (replace history para no dejar el token en el historial)
   y navega directo a la lección (`practice/[topicId]` cargando `GET /lesson_sessions/:id`).
2. En sesiones LTI, ocultar acciones que no aplican (logout normal, registro); al completar
   la lección mostrar "Tu nota fue enviada a tu plataforma" según `gradeSync` de la respuesta
   de complete (con estado pending/sent).
3. Pulir modo invitado: entrada a la app sin login (botón "Practicar sin cuenta" en la
   pantalla inicial existente), creación perezosa del guest token.
4. Manejo de errores: token inválido/expirado en `lti-entry` → pantalla de error con
   indicación de relanzar desde el LMS.
5. Tests: parsing de params, limpieza de URL, flujo invitado.

## Criterios de aceptación

- Abrir `http://localhost:8081/lti-entry?token=X&lessonSessionId=Y` (mock) autentica y aterriza
  en la lección; la URL queda limpia.
- Un usuario puede practicar completo sin crear cuenta.

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
