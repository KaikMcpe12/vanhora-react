# 05: UC-A2 — Backend aceita `route_ids` no `/bulk` + limite 60d

**PRD de origem:** [`../../prds/onda1-10-uc-a2-excecao-intervalo.md`](../../prds/onda1-10-uc-a2-excecao-intervalo.md)

**Milestone:** Onda 1 — Bloco D

**What to build:** o mesmo endpoint `POST /api/admin/schedules-exceptions/bulk` do UC-A1 passa a aceitar body alternativo `{ route_ids: UUID[], date_range, type, reason }`. Server resolve `route_ids` para todos os `schedule_ids` filhos antes de materializar as exceções. Limite de range diferente de A1: **60 dias** (vs 90d). `schedules_temporary` **não é afetado** (só grade recorrente). Idempotência preservada.

**Blocked by:** 01

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-d`, `back`

## Acceptance criteria

- [ ] Endpoint `POST /api/admin/schedules-exceptions/bulk` discrimina por body:
  - `schedule_ids` presente → modo UC-A1 (limite 90d).
  - `route_ids` presente → modo UC-A2 (limite 60d).
  - Ambos presentes → erro 400 (ambíguo).
  - Nenhum → erro 400 (vazio).
- [ ] Server resolve `route_ids` → `schedule_ids` filhos antes de materializar.
- [ ] Validação específica UC-A2: `range > 60 dias` → 400 com `error.code = "range_too_long_for_recess"`.
- [ ] `schedules_temporary` **NÃO é consultado** nem afetado (só grade recorrente via `schedules`).
- [ ] Idempotência: pula silenciosamente `(schedule_id, date)` já com exceção do mesmo type.
- [ ] Pula dias fora de `active_days` de cada schedule filho.
- [ ] Response 207 mesmo formato: `{ created, failed }`.
- [ ] Audit: `created_by = jwt.sub` em cada linha.
- [ ] Logging INFO: cada bulk com modo (A1 ou A2), route_ids.length (ou schedule_ids.length), resolved_schedule_count.
- [ ] Testes backend verdes (modo A1 continua funcional; modo A2 cobre happy, idempotência, limite 60d, pular temporários).
