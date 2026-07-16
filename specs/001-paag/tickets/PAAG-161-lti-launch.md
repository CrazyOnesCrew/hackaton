# PAAG-161: LTI 1.3 — plataformas, OIDC login/launch, JWKS

**Épica**: E07 LTI | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-121, PAAG-004 | **Rama**: `feature/paag-161-lti-launch`

## Contexto

Integración con cualquier LMS LTI 1.3 (ej. Moodle). **Leer completo
`specs/001-paag/contracts/lti.md`** (flujo, validaciones y endpoints exactos) y ADR-003.
Modelos en `data-model.md` sección "LTI". Dependencia nueva permitida: gema `jwt`
(justificación en ADR-003) — agregar con bundler, no a mano.

## Alcance

1. Migraciones/modelos: `LtiPlatform`, `LtiResourceLink`, `LtiUserIdentity` (+ FK de
   `lesson_sessions.lti_resource_link_id` pendiente de PAAG-121).
2. Llaves de la tool: generar par RSA (rake task `lti:generate_keys` → escribe PEM al path de
   `LTI_TOOL_PRIVATE_KEY_PATH`; en dev, `storage/`; nunca commitear llaves). `GET /lti/jwks`
   sirve la pública (kid estable).
3. `GET|POST /lti/login`: OIDC initiation según contrato (state+nonce en `solid_cache` o
   tabla, TTL 5 min).
4. `POST /lti/launch`: validación completa del id_token (firma vía JWKS de la plataforma con
   cache, iss/aud/exp/nonce anti-replay, message_type, claims). Efectos: upsert identidad y
   usuario, upsert resource link (captura `line_item_url` si viene el claim AGS), crear
   `Session` Bearer + `LessonSession(origin: :lti)` del topic asociado, redirect 302 a
   `#{APP_WEB_URL}/lti-entry?token=...&lessonSessionId=...`.
   - Resource link sin topic → respuesta HTML mínima "actividad pendiente de configurar"
     (y endpoint management para asociar topic, punto 5).
5. Management (rol `admin`): CRUD `/api/v1/management/lti_platforms` según contrato +
   `PATCH /api/v1/management/lti_resource_links/:id` para asociar `topicId`.
6. CSRF: los endpoints `/lti/*` reciben POSTs cross-site del LMS — eximir de forgery
   protection solo esos controladores, documentando por qué.
7. Tests: launch feliz (JWT firmado con llave de test + JWKS stub), firma inválida, nonce
   reusado, state expirado, plataforma desconocida, resource link sin topic. Sin red real.

## Criterios de aceptación

- Un launch simulado end-to-end (test de request) termina en redirect con token válido y
  `LessonSession` LTI creada.
- Replay del mismo id_token → 401.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
