# PAAG-001: Identidad del proyecto, variables de entorno y portal en Docker Compose

**Épica**: E00 Fundaciones | **App**: raíz + `apps/api` + `apps/portal` | **Asignado**: Dev C
**Depende de**: nada (primer ticket) | **Rama**: `feature/paag-001-fundaciones`

## Contexto

El repo es un template AI-first (leer `AGENTS.md` y `docs/getting-started.md`). Hoy
`docker-compose.yml` solo levanta `db` (Postgres 17), `api` (Rails, `apps/api/Dockerfile.dev`)
y `worker` (Solid Queue). El portal corre fuera de Docker. Vamos a construir PAAG
(ver `specs/001-paag/spec.md`) y necesitamos que todo el entorno dev sea `docker compose up`.

**Neutralidad**: PAAG es una plataforma libre; nada de nombres de universidades/instituciones
en código, copy o docs.

## Alcance

1. **Identidad**: `APP_NAME=PAAG` en `apps/api/.env.example`; actualizar `README.md` raíz con
   una sección breve del proyecto PAAG que enlace a `specs/001-paag/`.
2. **Variables de entorno** (solo `.env.example`, nunca valores reales):
   - Raíz: agregar `PORTAL_PORT=3001`.
   - `apps/api/.env.example`: agregar `APP_WEB_URL=http://localhost:8081` (URL de Expo web,
     usada por el redirect LTI), `LTI_TOOL_PRIVATE_KEY_PATH=` (comentada, se usa en PAAG-161),
     `AI_FEEDBACK_ENABLED=true`.
   - `apps/portal/.env.example`: verificar `RAILS_API_URL=http://api:3000` para Docker y
     `http://localhost:3000` fuera.
3. **Servicio `portal` en `docker-compose.yml`**: build con un nuevo
   `apps/portal/Dockerfile.dev` (Node 20, `npm install`, `npm run dev`), puerto
   `${PORTAL_PORT:-3001}:3000`, `depends_on: api`, volumen del código + volumen anónimo para
   `node_modules`, env `RAILS_API_URL=http://api:3000`.
4. **Healthchecks**: `db` (pg_isready — ya existe o agregar), `api` (`/up`).
5. Actualizar `docs/getting-started.md` con el flujo `docker compose up` completo.

## Fuera de alcance

- Mobile en Docker (Expo corre en host: `npm run mobile` / `mobile:web`).
- Compose de producción (PAAG-501).

## Criterios de aceptación

- **Given** un clon limpio con `.env` copiado de `.env.example`, **When** `docker compose up
  --build`, **Then** Postgres, API (`http://localhost:3000/up` → 200), worker y portal
  (`http://localhost:3001` → página de login) levantan sin pasos manuales.
- El portal dentro de Docker se autentica contra el API (login con usuario seed funciona).
- Ningún secreto real en git.

## Verificación

```bash
docker compose up --build -d && docker compose ps
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/up   # 200
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001      # 200
```
