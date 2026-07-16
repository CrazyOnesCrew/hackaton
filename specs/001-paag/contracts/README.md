# Contratos PAAG

Fuente de verdad para los clientes (`apps/mobile`, `apps/portal`). Reglas generales según
`docs/architecture/api-guidelines.md`:

- Base: `/api/v1`. JSON con campos `camelCase`. Fechas ISO 8601 UTC.
- Éxito: envelope `{ "data": ... }`. Error: `{ "error": { "code", "message", "details": [] } }`.
- Auth: `Authorization: Bearer <token>` (sesiones del template). El portal usa su BFF con
  cookies httpOnly que reenvía el Bearer a Rails.
- Invitados: header `X-Guest-Token` (emitido por `POST /api/v1/guest_sessions`).

| Archivo | Contenido |
|---|---|
| [content.md](./content.md) | Subjects, topics, exercises (lectura pública + CRUD auxiliar) |
| [solving.md](./solving.md) | Lecciones, intentos, envío de pasos, feedback, dificultad |
| [imports-exports.md](./imports-exports.md) | Import XML del banco + export CSV Moodle |
| [exercise-bank.xsd](./exercise-bank.xsd) | Esquema del XML de ejercicios |
| [lti.md](./lti.md) | Endpoints LTI 1.3 (OIDC, launch, JWKS, AGS) |
| [gamification.md](./gamification.md) | Perfil de gamificación |

**Cambios**: cualquier modificación a un contrato pasa por PR de Dev A y aviso a B y C.
Los clientes no asumen endpoints no documentados aquí.
