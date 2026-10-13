# 01: Destravar filtro `date` / `dayOfWeek` no mock

**PRD de origem:** [`../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md`](../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md) (UC-P4+PA2 — absorve UC-P3 por D22)

**Milestone:** Fase 1 — Pré-backend

**What to build:** o filtro `date` e `dayOfWeek` em `/schedules`, que hoje aparece na UI mas não aplica (TODOs em `mock-schedules-api.ts:71,111`), passa a filtrar schedules no mock. Pré-requisito para o ticket 02 (tabs temporais) poder renderizar o filtro ativo e para o backend inicial honrar a mesma semântica em `GET /api/schedules` (`api-spec.md §2.1`).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 0.5d

**Labels:** `fase1`, `front`, `passageiro`

## Acceptance criteria

- [ ] Zero ocorrência de `TODO` em `src/lib/api/mock-schedules-api.ts` relacionado a `date` ou `dayOfWeek`.
- [ ] Filtro `date` recebe `YYYY-MM-DD`, deriva `day_of_week` (seg/ter/.../dom) e aplica em `schedules.day_of_week`.
- [ ] Filtro `dayOfWeek` recebe array comma-separated (ex: `seg,ter,qua`) e aplica como OR.
- [ ] Se `date` e `dayOfWeek` vêm juntos, `date` tem prioridade (derivação ignora `dayOfWeek` manual).
- [ ] `date` muito futura (>1 ano) retorna erro `INVALID_PARAM`.
- [ ] Nenhuma regressão em outras partes do `/schedules` que já consumiam o mock.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
