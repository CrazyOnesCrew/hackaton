# Estado operativo — Dev C (Portal + infra)

**Actualizado**: 2026-07-16  
**Repo**: https://github.com/CrazyOnesCrew/hackaton  
**Base verificada**: `origin/master` @ `16afd25` (`git log origin/master --oneline -30`)

Este archivo es el **reporte operativo** para no omitir gaps de QA ni tickets a medias al decir “Dev C listo”.

## Tabla de tickets Dev C

| Ticket | En master | Hash aprox. | QA adversarial | Pendiente al reportar |
|---|---|---|---|---|
| PAAG-001 | Sí | `29e80f9` (merge) / `3732173` | Falló (API limit); mergeado igual | Backfill QA pendiente / en curso |
| PAAG-002 | Sí | `59fc316` (merge) / `a08c7c1` | Falló (API limit); mergeado igual | Backfill QA pendiente / en curso |
| PAAG-301 | Sí | `ab5520a` | No corrido (cola recovery) | Backfill QA pendiente / en curso |
| PAAG-302 | Sí | `e36454d` | No corrido (cola recovery) | Backfill QA pendiente / en curso |
| PAAG-303 | Sí | `dac02ca` | No documentado | Correr QA adversarial; no dar por cerrado |
| PAAG-304 | Sí | `16afd25` | No documentado | Correr QA adversarial; no dar por cerrado |
| PAAG-501 | Sí | `bdde685` (fixes) / `da824b7` (merge) / `53a9666` | **HECHO** — 2 blockers; fixes en `bdde685` | Smoke prod `up` (falta `master.key` local); `RAILS_MASTER_KEY` solo local |

### PAAG-501 — detalle QA

QA adversarial **hecho**. Encontró 2 blockers; fixes mergeados en `bdde685`:

1. `database.yml` multi-DB para Solid Cache / Queue / Cable en producción.
2. `NEXT_BASE_PATH` en `fetch`/anchors del portal.

Smoke `docker compose … up` en prod **sigue pendiente** (falta `master.key` / `RAILS_MASTER_KEY` local; nunca en git).

## % Dev C

| Métrica | Valor |
|---|---|
| Código en `master` | **7 / 7 ≈ 100%** (001, 002, 301, 302, 303, 304, 501) |
| “Hecho” con protocolo QA | **parcial** (QA 501 hecho + fixes; smoke prod 501 pendiente; backfill 001–302 pendiente / en curso; 303/304 sin QA adversarial aún) |

Usar **≈100% en master** al hablar de avance de implementación; **no** reportar Dev C como cerrado hasta el checklist de abajo.

## Protocolo

```text
implementación → QA adversarial → merge a master
```

Excepciones ya ocurridas (no repetir al reportar como “validado”):

- **001 / 002**: QA adversarial falló por límite de API; se mergearon igual → backfill pendiente o en curso (`feature/paag-qa-backfill-001-302`).
- **301 / 302**: pusheados sin QA adversarial (cola recovery) → backfill pendiente / en curso.
- **501**: QA adversarial hecho (2 blockers → fixes `bdde685`); falta smoke de producción (`master.key` local).
- **303**: en master (`dac02ca`); sin QA adversarial documentado aún.
- **304**: en master (`16afd25`); sin QA adversarial documentado aún.

## Checklist — antes de reportar como hecho

- [ ] QA backfill 001–302 (adversarial o equivalente documentado) — pendiente / en curso
- [x] QA 501 (adversarial hecho; fixes mergeados en `bdde685`)
- [x] 303 + 304 en master (`dac02ca` / `16afd25`)
- [ ] QA adversarial 303 + 304 documentado
- [ ] Smoke prod con `.env.production` local (nunca commitear; `RAILS_MASTER_KEY` fuera de git)
- [x] `tasks.md` sincronizado con lo realmente mergeado (304 marcado)
- [ ] Compañeros A/B hicieron `git pull` de `master`

## Riesgos conocidos

1. **Worktree 301 zombie**: `~/.cursor/worktrees/paag-301-portal-base-3f7a9c2e` en detached HEAD @ `6adbeeb` (base antigua, pre-merges). No usarlo para trabajo nuevo; preferir `master` actual.
2. **501 base antigua ya mergeada**: worktree `paag501-54f9ac30` / rama `feature/paag-501-despliegue` @ `53a9666` mientras `master` ya tiene el merge `da824b7`. Evitar re-merge o commits desde esa base sin rebase a `master`.
3. **Portal mock hasta Dev A**: 301–304 son mock-first contra `contracts/`; integración real depende de endpoints de gestión/import/export de Dev A. No reportar “integración API lista” solo porque el UI esté en master.
4. **Secretos**: nunca commitear `.env`, `.env.production`, `master.key` / `RAILS_MASTER_KEY`.

## Enlaces

- Tickets: [`../tasks.md`](../tasks.md)
- Guía Dev C: [`dev-c-portal-infra.md`](./dev-c-portal-infra.md)
- Coordinación equipo: [`README.md`](./README.md)
