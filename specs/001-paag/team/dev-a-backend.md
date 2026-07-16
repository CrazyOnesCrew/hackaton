# Dev A — Backend (`apps/api`) y contratos

## Tu rol

Eres la autoridad del dominio: modelos, reglas de negocio, validación matemática, IA, LTI y
scoring viven **solo** en `apps/api` (ADR-002). También eres el dueño de
`specs/001-paag/contracts/`: B y C construyen contra esos documentos, así que cualquier
cambio de contrato lo haces tú por PR y les avisas.

## Lectura inicial (una vez)

1. `AGENTS.md` y `.specify/memory/constitution.md`
2. `specs/001-paag/spec.md`, `plan.md`, `data-model.md` y **todos** los `contracts/`
3. ADRs 002–006 en `docs/architecture/decisions/`
4. Código existente: `apps/api/app/models/user.rb`, `session.rb`,
   `app/controllers/api/v1/` (estilo de controladores y auth), `db/schema.rb`

## Tus tickets (en orden)

| # | Ticket | Qué es |
|---|---|---|
| 1 | PAAG-004 | Rol `auxiliary` |
| 2 | PAAG-101 | Modelos del banco + seeds |
| 3 | PAAG-102 | Endpoints públicos de contenido |
| 4 | PAAG-103 | Endpoints de gestión |
| 5 | PAAG-111 | Parser XML |
| 6 | PAAG-112 | Job de import |
| 7 | PAAG-121 | Modelos de resolución + invitados |
| 8 | PAAG-131 | Validación matemática determinista |
| 9 | PAAG-122 | Endpoints de resolución (necesita 131) |
| 10 | PAAG-141 | Feedback IA |
| 11 | PAAG-151 | Dificultad dinámica |
| 12 | PAAG-161 | LTI login/launch |
| 13 | PAAG-162 | AGS grade passback |
| 14 | PAAG-171 | Export CSV |
| 15 | PAAG-401 | Gamificación |

## Entorno

```bash
cp .env.example .env
docker compose up --build      # db + api + worker
# tests dentro del contenedor o local:
cd apps/api && bin/rails test && bin/rubocop && bin/brakeman
```

## Reglas que más te aplican

- Migraciones = única fuente de verdad del schema; jamás editar `schema.rb` a mano.
- API: envelope `{data}`/`{error}`, camelCase, `/api/v1` (`docs/architecture/api-guidelines.md`).
- IA: nunca en tests en vivo, siempre timeout + fallback (`docs/ai-development-workflow.md`).
- Prohibido `eval` sobre input del usuario (ADR-005).
- Prioriza mergear rápido E01 (101–103): desbloquea la integración real de B y C.
