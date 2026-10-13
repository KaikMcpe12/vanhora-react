# 01: UC-A1 — Backend `POST /schedules-exceptions/bulk` + query param `driver_id`

**PRD de origem:** [`../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md`](../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md)

**Milestone:** Onda 1 — Bloco D

**What to build:** endpoint novo `POST /api/admin/schedules-exceptions/bulk` que recebe `{ schedule_ids, date_range, type, reason }`, materializa exceções em transação única e retorna 207 com `{ created, failed }`. Pula silenciosamente dias fora de `active_days` e pares `(schedule_id, date)` idempotentes. Também adiciona query param aditivo `driver_id` em `GET /api/admin/schedules` para filtrar por motorista. Este endpoint é reusado por UC-A2 (via `route_ids` em vez de `schedule_ids`).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 2d

**Labels:** `onda1`, `bloco-d`, `back`

## Acceptance criteria

- [ ] Endpoint `POST /api/admin/schedules-exceptions/bulk` criado.
- [ ] Body aceito: `{ schedule_ids: UUID[], date_range: { from: date, to: date }, type: "cancelled"|"suspended", reason: string }`.
- [ ] Transação SQL única (BEGIN...COMMIT) garante atomicidade do lote.
- [ ] Server itera: 1 linha em `schedules_exceptions` por (schedule × data no range) **pulando dias fora de `active_days`**.
- [ ] Idempotência: se já existe exceção para `(schedule_id, date)` com mesmo `type`, pula silenciosamente (não erro).
- [ ] Response 207 com `{ created: UUID[], failed: [{ schedule_id, date, error }] }`.
- [ ] Validações: `from <= to`, range ≤ 90 dias, `schedule_ids` não vazio, `type` ∈ {cancelled, suspended}, `reason` 1–500 chars.
- [ ] Audit: cada exceção criada carrega `created_by = jwt.sub`.
- [ ] `GET /api/admin/schedules` aceita query param `driver_id` (filtra schedules cuja `route.drive_id = $driver_id`), combina com outros filtros.
- [ ] Logging INFO: cada bulk com `jwt.sub`, `schedule_ids.length`, `range`, `created.length`, `failed.length`.
- [ ] Testes backend verdes (happy path, idempotência, validações, autorização).
