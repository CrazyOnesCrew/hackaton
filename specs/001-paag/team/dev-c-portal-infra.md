# Dev C — Portal auxiliares (`apps/portal`) + Docker/infra

## Tu rol

Dos sombreros: (1) el **gestor de contenidos** en Next.js para auxiliares/admins (banco de
ejercicios, carga XML, export de notas) y (2) la **infraestructura compartida**: Docker
Compose, variables de entorno y despliegue. Los archivos compartidos de la raíz
(`docker-compose.yml`, `.env.example`, `docs/`) son tuyos; coordina si alguien más los
necesita.

## Lectura inicial (una vez)

1. `AGENTS.md`, `styleguide.md` y `docs/getting-started.md`
2. `specs/001-paag/spec.md` (US5, US6, US9) y `contracts/`: `content.md` (Gestión),
   `imports-exports.md`, `exercise-bank.xsd`
3. Código existente: `apps/portal/src/app/` (rutas y BFF auth), `src/lib/rails.ts`,
   `src/proxy.ts` (roles), `src/components/ui/`
4. `docker-compose.yml` actual y `apps/api/README_DOCKER.md`

## Tus tickets (en orden)

| # | Ticket | Qué es |
|---|---|---|
| 1 | PAAG-001 | Fundaciones: envs + portal en compose (bloquea a todos: hazlo primero) |
| 2 | PAAG-002 | Design tokens Tailwind + componentes base |
| 3 | PAAG-301 | Rol auxiliary + navegación del gestor |
| 4 | PAAG-302 | Listado y preview del banco |
| 5 | PAAG-303 | Carga XML con reporte |
| 6 | PAAG-304 | Export CSV |
| 7 | PAAG-501 | Despliegue de producción |

## Entorno

```bash
cp .env.example .env
docker compose up --build          # tras PAAG-001 incluye el portal
# o fuera de docker:
cd apps/portal && npm install && npm run dev   # puerto 3001
npx tsc --noEmit && npm run lint && npm run test && npm run build
```

## Reglas que más te aplican

- El portal habla con Rails **solo vía su BFF** (cookies httpOnly → Bearer), patrón ya
  implementado en `src/app/api/auth/` — extiéndelo, no lo dupliques.
- Mock-first: usa el fetcher conmutable (PAAG-301) hasta que el backend de cada épica esté
  en main.
- Nunca valores reales en `.env.example`; nunca secretos en git.
- En PAAG-501, cero referencias institucionales en docs de despliegue (plataforma libre).
