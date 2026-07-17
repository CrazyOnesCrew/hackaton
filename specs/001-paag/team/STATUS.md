# Estado operativo — Dev C (Portal + infra)

**Actualizado**: 2026-07-16  
**Repo**: https://github.com/CrazyOnesCrew/hackaton  
**Base verificada**: `origin/master` @ `da824b7` (`git log origin/master --oneline -30`)

Este archivo es el **reporte operativo** para no omitir gaps de QA ni tickets a medias al decir “Dev C listo”.

## Tabla de tickets Dev C

| Ticket | En master | Hash aprox. | QA adversarial | Pendiente al reportar |
|---|---|---|---|---|
| PAAG-001 | Sí | `29e80f9` (merge) / `3732173` | Falló (API limit); mergeado igual | Backfill QA |
| PAAG-002 | Sí | `59fc316` (merge) / `a08c7c1` | Falló (API limit); mergeado igual | Backfill QA |
| PAAG-301 | Sí | `ab5520a` | No corrido (cola recovery) | Backfill QA |
| PAAG-302 | Sí | `e36454d` | No corrido (cola recovery) | Backfill QA |
| PAAG-303 | Sí | `dac02ca` | No documentado | Documentar/correr QA; no dar por cerrado |
| PAAG-304 | **No** | — (rama local `feature/paag-304-portal-export`) | — | Implementar → QA → merge |
| PAAG-501 | Sí | `da824b7` (merge) / `53a9666` | Config/builds OK; no es QA adversarial completo | Smoke prod `up` + QA; `RAILS_MASTER_KEY` solo local |

## % Dev C

| Métrica | Valor |
|---|---|
| Código en `master` | **6 / 7 ≈ 86%** (falta 304) |
| “Hecho” con protocolo QA | **~0%** de cierre formal (backfill 001–302 pendiente; 303 sin QA documentado; 501 sin smoke prod; 304 ausente) |

Usar **86% en master** al hablar de avance de implementación; **no** reportar Dev C como cerrado hasta el checklist de abajo.

## Protocolo

```text
implementación → QA adversarial → merge a master
```

Excepciones ya ocurridas (no repetir al reportar como “validado”):

- **001 / 002**: QA adversarial falló por límite de API; se mergearon igual → backfill en curso o pendiente (`feature/paag-qa-backfill-001-302`).
- **301 / 302**: pusheados sin QA adversarial (cola recovery) → backfill pendiente / en curso.
- **501**: mergeado con config/builds OK; falta smoke de producción.
- **303**: ya en master; QA no documentado en este reporte.
- **304**: no en master.

## Checklist — antes de reportar como hecho

- [ ] QA backfill 001–302 (adversarial o equivalente documentado)
- [ ] QA 501 (más allá de config/builds)
- [ ] 303 con QA documentado (código ya en master) **y** 304 en master + QA
- [ ] Smoke prod con `.env.production` local (nunca commitear; `RAILS_MASTER_KEY` fuera de git)
- [ ] `tasks.md` sincronizado con lo realmente mergeado
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
