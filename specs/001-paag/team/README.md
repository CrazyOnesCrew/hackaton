# Trabajo colaborativo PAAG — 3 desarrolladores con Cursor

Cada dev trabaja **solo en su ámbito** para minimizar conflictos (cada app tiene sus propias
dependencias, tests y lint — ver `AGENTS.md` §1):

| Dev | Ámbito | Guía |
|---|---|---|
| **A** | Backend `apps/api` + contratos | [dev-a-backend.md](./dev-a-backend.md) |
| **B** | App estudiante `apps/mobile` (móvil + web) | [dev-b-mobile.md](./dev-b-mobile.md) |
| **C** | Portal `apps/portal` + Docker/infra | [dev-c-portal-infra.md](./dev-c-portal-infra.md) |

## Cómo trabajar un ticket con el agente de Cursor

1. `git checkout main && git pull`, luego crear la rama del ticket
   (`feature/paag-xxx-<slug>`, indicada en cada ticket).
2. Prompt al agente (el repo ya tiene `AGENTS.md`/`CLAUDE.md`, Cursor los lee solo):

   > Implementa el ticket `@specs/001-paag/tickets/PAAG-XXX-....md`. Lee primero los
   > documentos que el ticket referencia (contratos, data-model, ADRs). No te salgas del
   > alcance del ticket. Al terminar, corre los comandos de verificación del ticket y
   > reporta los resultados.

3. Revisar el diff, correr la verificación, abrir PR pequeño contra `main`.
4. Marcar el checkbox del ticket en `tasks.md` dentro del mismo PR.

## Reglas de sincronización

- **Contrato primero**: `specs/001-paag/contracts/` es la fuente de verdad entre apps.
  Solo Dev A los modifica (por PR, avisando a B y C). Nadie asume endpoints no documentados.
- **Mock-first**: B y C no esperan al backend — implementan contra los contratos con mocks
  (`EXPO_PUBLIC_USE_MOCK_API` en mobile, fetcher mock en portal) y cambian a integración
  real cuando la épica de backend llega a `main`.
- **Archivos compartidos** (`docker-compose.yml`, `.env.example` raíz, `docs/`): los
  administra Dev C, excepto `contracts/` (Dev A). Si otro dev los necesita tocar, coordinar.
- **PRs**: uno por ticket, pequeño; revisión cruzada (A revisa el uso de contratos de B/C).
- **Puntos de sync**: (1) fin de fase E00 — todos; (2) merge de E01 — B y C prueban contra
  API real; (3) merge de E03+E04 — B integra el flujo de solving real; (4) merge de E07 —
  prueba LTI end-to-end con un Moodle de prueba.
- **Nunca**: commitear secretos, editar `db/schema.rb` a mano, mergear con checks fallando
  (constitución, principio V).

## Orden sugerido por dev (ver dependencias en `tasks.md`)

| Semana* | Dev A | Dev B | Dev C |
|---|---|---|---|
| 1 | PAAG-004 → 101 | PAAG-003 → 201 | PAAG-001 → 002 |
| 2 | 102 → 103 → 111 | 202 → 203 | 301 → 302 |
| 3 | 112 → 121 → 131 | 203 → 204 | 302 → 303 |
| 4 | 122 → 141 → 151 | 205 → integración real | 304 → integración real |
| 5 | 161 → 162 → 171 | 206 | 501 (inicio) |
| 6 | 401 + estabilización | integración LTI + pulido | 501 + docs |

*Ritmo referencial; ajustar en las dailies.
