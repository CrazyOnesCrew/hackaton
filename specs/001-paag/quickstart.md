# Quickstart: PAAG en desarrollo

## Requisitos

- Docker Desktop (o engine + compose v2)
- Node 20+ y pnpm (solo para `apps/mobile`, que corre fuera de Docker)

## Levantar el entorno

```bash
git clone <repo> && cd <repo>
cp .env.example .env                       # puertos y credenciales de Postgres dev
cp apps/portal/.env.example apps/portal/.env.local
cp apps/mobile/.env.example apps/mobile/.env

docker compose up --build                  # db + api + worker (+ portal tras PAAG-001)
```

Verificación:

| Servicio | URL | Esperado |
|---|---|---|
| API Rails | `http://localhost:3000/up` | 200 |
| Portal (auxiliares) | `http://localhost:3001` | login |
| App estudiante (web) | `http://localhost:8081` | tras `pnpm web` (abajo) |

## App estudiante (Expo)

```bash
cd apps/mobile && pnpm install
pnpm start        # móvil: QR con Expo Go, o emulador
pnpm web          # versión web (react-native-web) en :8081
```

Sin backend listo: `EXPO_PUBLIC_USE_MOCK_API=true`.
Con backend: `EXPO_PUBLIC_API_URL=http://localhost:3000` (emulador Android:
`http://10.0.2.2:3000`).

## Datos de prueba

`docker compose exec api bin/rails db:seed` crea (passwords en `SEED_PASSWORD`):

- `admin@example.com` (admin), `member@example.com` (member),
  `auxiliary@example.com` (auxiliar — entra al gestor del portal)
- Banco seed: 2 materias, 4 temas, ~10 ejercicios publicados (desde PAAG-101)

## Variables clave

| Var | Dónde | Para qué |
|---|---|---|
| `ANTHROPIC_API_KEY` | `apps/api/.env` | Feedback IA (opcional: sin ella, `aiStatus=skipped`) |
| `AI_FEEDBACK_ENABLED` | `apps/api/.env` | Kill switch de IA |
| `APP_WEB_URL` | `apps/api/.env` | Redirect del launch LTI a la app web |
| `LTI_TOOL_PRIVATE_KEY_PATH` | `apps/api/.env` | Llave RSA de la tool (generar con `bin/rails lti:generate_keys`) |

## Tests por app (antes de cada PR)

```bash
cd apps/api    && bin/rails test && bin/rubocop && bin/brakeman
cd apps/portal && npx tsc --noEmit && npm run lint && npm run test && npm run build
cd apps/mobile && pnpm type-check && pnpm lint && pnpm test
```

## Producción

Ver ticket PAAG-501 y (cuando exista) `docs/deployment.md`.
