# PAAG-501: Despliegue de producción con Docker

**Épica**: E12 | **App**: raíz + todas | **Asignado**: Dev C
**Depende de**: PAAG-001; el resto mergeado para el smoke test final | **Rama**: `feature/paag-501-despliegue`

## Contexto

PAAG debe desplegarse agnósticamente (On-Premise o Cloud) con Docker (NFR-001). Ya existen
imágenes de producción: `apps/api/Dockerfile` (Rails+Thruster) y `apps/portal/Dockerfile`.
Expo web se exporta estático (`npx expo export --platform web`).

## Alcance

1. `docker-compose.prod.yml` en la raíz:
   - `db` (Postgres 17 + volumen), `api` (Dockerfile prod, `RAILS_MASTER_KEY` por env),
     `worker`, `portal` (Dockerfile prod).
   - `web`: nginx sirviendo el export estático de Expo web (build multi-stage:
     `apps/mobile/Dockerfile.web` nuevo — stage Node que corre `expo export`, stage nginx).
   - `proxy`: reverse proxy (Caddy recomendado por TLS automático) ruteando:
     `/` → web (app estudiante), `/portal` → portal, `/api` y `/lti` → api. Documentar la
     alternativa de subdominios.
2. `.env.production.example` con todas las variables (sin valores reales): DB, master key,
   `ANTHROPIC_API_KEY`, `APP_WEB_URL`, `LTI_TOOL_PRIVATE_KEY_PATH`, dominios.
3. Healthchecks y `restart: unless-stopped` en todos los servicios; volúmenes con nombre
   para datos y llaves LTI.
4. `docs/deployment.md`: guía On-Premise (servidor propio, requisitos ~4GB RAM) y Cloud
   (una VM cualquiera), pasos de arranque, migraciones (`db:prepare` en entrypoint),
   backups de Postgres, rotación de llaves LTI. **Sin referencias institucionales.**
5. Smoke test documentado: `docker compose -f docker-compose.prod.yml up` en local con
   builds de prod → los 3 frontends responden y el API pasa `/up`.

## Criterios de aceptación

- Un servidor limpio con Docker puede levantar PAAG completo siguiendo `docs/deployment.md`
  sin pasos no documentados.

## Verificación

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d && docker compose -f docker-compose.prod.yml ps
curl -s -o /dev/null -w "%{http_code}" http://localhost/up
```
