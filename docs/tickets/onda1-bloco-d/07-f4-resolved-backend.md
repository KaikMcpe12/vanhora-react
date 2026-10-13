# 07: UC-F4 — Backend `delays.resolved_by/at` + endpoints resolve/reopen

**PRD de origem:** [`../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md`](../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md) (bundle A18+F4; parte F4)

**Milestone:** Onda 1 — Bloco D

**What to build:** base de backend para rastreamento de resolução de atrasos. Migration adiciona `delays.resolved_by uuid NULL FK` + `delays.resolved_at timestamp NULL`. Dois endpoints novos idempotentes: `PATCH /api/admin/delays/:id/resolve` (seta `resolved_by = jwt.sub`, `resolved_at = now()`) e `PATCH /api/admin/delays/:id/reopen` (zera ambos). Role `driver` → 403. Delay soft-deletado → 404. Filtro aditivo `?resolved=true|false|all` em `GET /admin/delays`. Index parcial para fila de triagem.

**Blocked by:** None (can start immediately; independente de UC-A1/A2 dentro do Bloco D)

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-d`, `back`

## Acceptance criteria

- [ ] Migration adiciona `delays.resolved_by uuid NULL FK users(id)` + `delays.resolved_at timestamp NULL`.
- [ ] Index parcial: `CREATE INDEX idx_delays_pending ON delays(created_at DESC) WHERE resolved_by IS NULL AND deleted_at IS NULL`.
- [ ] Endpoint `PATCH /api/admin/delays/:id/resolve`:
  - Sem body.
  - Popula `resolved_by = jwt.sub`, `resolved_at = NOW()`.
  - Idempotente: resolver 2× não erro — re-registra `resolved_at`.
  - Roles permitidos: `admin`, `cooperative`.
  - Role `driver` → 403 com `error.code = "driver_cannot_resolve"`.
  - Delay com `deleted_at IS NOT NULL` → 404.
- [ ] Endpoint `PATCH /api/admin/delays/:id/reopen`:
  - Sem body.
  - Seta `resolved_by = NULL`, `resolved_at = NULL`.
  - Idempotente: reabrir já reaberto não erro.
  - Mesmos roles permitidos.
- [ ] `GET /api/admin/delays` aceita filtro `?resolved=true|false|all` (default `all`).
- [ ] Logging INFO em cada resolve/reopen com `jwt.sub` + `delay_id`.
- [ ] Testes backend verdes (happy, idempotência, 403 driver, 404 deleted, filtros).
