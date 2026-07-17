# Estado operativo — Dev C (Portal + infra)

**Actualizado**: 2026-07-16  
**Repo**: https://github.com/CrazyOnesCrew/hackaton  
**Base verificada**: `origin/master` @ post-QA-303/304 (ver hashes abajo)

Este archivo es el **reporte operativo** para no omitir gaps de QA ni tickets a medias al decir “Dev C listo”.

## Tabla de tickets Dev C

| Ticket | En master | Hash aprox. | QA adversarial | Pendiente al reportar |
|---|---|---|---|---|
| PAAG-001 | Sí | `29e80f9` (merge) / `3732173` | **HECHO** backfill 2026-07-16 — APROBADO (`e65b4ac`) | — |
| PAAG-002 | Sí | `59fc316` (merge) / `a08c7c1` | **HECHO** backfill 2026-07-16 — APROBADO (`e65b4ac`) | — |
| PAAG-301 | Sí | `ab5520a` | **HECHO** backfill 2026-07-16 — APROBADO CON OBS. (`e65b4ac`) | Login real `auxiliary` espera PAAG-004 |
| PAAG-302 | Sí | `e36454d` | **HECHO** backfill 2026-07-16 — APROBADO CON OBS. (`e65b4ac`) | Mock-first hasta endpoints Dev A |
| PAAG-303 | Sí | `dac02ca` | **HECHO** 2026-07-16 — APROBADO (blocker BOM + tests) | Mock-first hasta PAAG-112 |
| PAAG-304 | Sí | `16afd25` | **HECHO** 2026-07-16 — APROBADO (blocker BOM + tests) | Mock-first hasta PAAG-171 |
| PAAG-501 | Sí | `bdde685` (fixes) / `da824b7` (merge) / `53a9666` | **HECHO** — 2 blockers; fixes en `bdde685` | Smoke prod `up` (falta `master.key` local); `RAILS_MASTER_KEY` solo local |

### PAAG-303 / PAAG-304 — detalle QA

QA adversarial **hecho** en `feature/paag-qa-303-304`:

1. **Blocker**: UTF-8 BOM en `apps/portal/package.json` rompía PostCSS / Vitest (`ExercisesBank`) / `next build` → fixed (portal `1.4.2`).
2. Criterios cubiertos con Vitest: import XML (upload mock, reporte rechazados, 422 XSD, validación `.xml`/5MB, ayuda XSD/ejemplo, historial vacío); export CSV (selector, descarga mock, empty state, help card, error BFF); roles `/content/imports` + `/content/grades` (ya en proxy tests del backfill).
3. Verificación: `npx tsc --noEmit`, `npm run lint`, `npm run test` (93), `npm run build` — OK.

### PAAG-501 — detalle QA

QA adversarial **hecho**. Encontró 2 blockers; fixes mergeados en `bdde685`:

1. `database.yml` multi-DB para Solid Cache / Queue / Cable en producción.
2. `NEXT_BASE_PATH` en `fetch`/anchors del portal.

Smoke `docker compose … up` en prod **sigue pendiente** (falta `master.key` / `RAILS_MASTER_KEY` local; nunca en git).

## % Dev C

| Métrica | Valor |
|---|---|
| Código en `master` | **7 / 7 ≈ 100%** (001, 002, 301, 302, 303, 304, 501) |
| “Hecho” con protocolo QA | **casi cerrado** (QA adversarial 001–304 + 501 hecho; falta solo smoke prod 501) |

Usar **≈100% en master** al hablar de avance de implementación; **no** reportar Dev C 100% “cerrado con smoke” hasta el checklist de abajo.

## Protocolo

```text
implementación → QA adversarial → merge a master
```

Excepciones ya ocurridas (no repetir al reportar como “validado”):

- **001 / 002**: QA adversarial falló por límite de API; mergeados igual → **backfill HECHO** 2026-07-16 (`e65b4ac`).
- **301 / 302**: pusheados sin QA adversarial (cola recovery) → **backfill HECHO** 2026-07-16 (OBS: `User::ROLES` aún sin `auxiliary` hasta PAAG-004).
- **501**: QA adversarial hecho (2 blockers → fixes `bdde685`); falta smoke de producción (`master.key` local).
- **303 / 304**: en master; QA adversarial **HECHO** 2026-07-16 (BOM fix + tests en rama `feature/paag-qa-303-304`).

## Checklist — antes de reportar como hecho

- [x] QA backfill 001–302 (adversarial o equivalente documentado) — 2026-07-16 (`e65b4ac`)
- [x] QA 501 (adversarial hecho; fixes mergeados en `bdde685`)
- [x] 303 + 304 en master (`dac02ca` / `16afd25`)
- [x] QA adversarial 303 + 304 documentado — 2026-07-16 (APROBADO; blocker BOM fixed)
- [ ] Smoke prod con `.env.production` local (nunca commitear; `RAILS_MASTER_KEY` fuera de git)
- [x] `tasks.md` sincronizado con lo realmente mergeado (304 marcado)
- [ ] Compañeros A/B hicieron `git pull` de `master`

## Riesgos conocidos

1. **Worktree 301 zombie**: `~/.cursor/worktrees/paag-301-base-3f7a9c2e` en detached HEAD @ `6adbeeb` (base antigua, pre-merges). No usarlo para trabajo nuevo; preferir `master` actual.
2. **501 base antigua ya mergeada**: worktree `paag501-54f9ac30` / rama `feature/paag-501-despliegue` @ `53a9666` mientras `master` ya tiene el merge `da824b7`. Evitar re-merge o commits desde esa base sin rebase a `master`.
3. **Portal mock hasta Dev A**: 301–304 son mock-first contra `contracts/`; integración real depende de endpoints de gestión/import/export de Dev A. No reportar “integración API lista” solo porque el UI esté en master.
4. **Secretos**: nunca commitear `.env`, `.env.production`, `master.key` / `RAILS_MASTER_KEY`.
5. **BOM en `package.json`**: no reintroducir UTF-8 BOM (rompe PostCSS/Vitest/build en Windows).

## Enlaces

- Tickets: [`../tasks.md`](../tasks.md)
- Guía Dev C: [`dev-c-portal-infra.md`](./dev-c-portal-infra.md)
- Coordinación equipo: [`README.md`](./README.md)
