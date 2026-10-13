# 04: UC-A10 — Rotas órfãs (fullstack)

**PRD de origem:** [`../../prds/onda1-07-uc-a10-rotas-orfas.md`](../../prds/onda1-07-uc-a10-rotas-orfas.md)

**Milestone:** Onda 1 — Bloco S

**What to build:** admin e cooperativa passam a ver no dashboard um KPI novo "Rotas sem motorista ativo" + um filtro `?driver_status=inactive` em `GET /admin/routes` + um badge âmbar "Motorista afastado — reatribuir" no `RouteCard` sempre que `driver.status === 'inactive'` OU `driver.deleted_at IS NOT NULL` OU `drive_id IS NULL`. Admin vê breakdown por cooperativa. Cooperativa vê só o escopo próprio.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-s`, `fullstack`, `admin`, `cooperativa`

## Acceptance criteria

- [ ] Query param `?driver_status=inactive` adicionado em `GET /api/admin/routes` com `WHERE drive_id IS NULL OR drive_id IN (SELECT id FROM users WHERE status = 'inactive' OR deleted_at IS NOT NULL)`.
- [ ] Endpoint de dashboard inclui novo campo `orphan_routes_count`:
  - Admin: `{ total, breakdown: [{ cooperative_id, cooperative_name, count }] }`.
  - Cooperativa: `{ total }` escopado via JWT.
- [ ] `AdminKPICard` novo no dashboard admin: "Rotas sem motorista ativo" + breakdown clicável por cooperativa.
- [ ] `AdminKPICard` novo no dashboard cooperativa: contagem + CTA "Ver rotas" linkando para `/cooperative/routes?driver_status=inactive`.
- [ ] Badge âmbar no `RouteCard` quando órfã, usando `StatusChip` tone `warning` + ícone `AlertTriangle` + texto "Motorista afastado — reatribuir" (ou "Sem motorista — atribuir" quando `drive_id IS NULL`).
- [ ] Clique no badge (Onda 1): navega para `/admin/users?user=<driver_id>` ou `/admin/routes?driver_status=inactive` quando `drive_id IS NULL`. Comportamento pluggable (Onda 2 vai trocar para `DriverReassignmentModal` via UC-A8).
- [ ] Motorista reativado → badge some no próximo refetch.
- [ ] `AdminKPICard` novo catalogado em `/admin/components-preview`.
- [ ] Alvo do badge ≥44×44px; comunica via cor + ícone + texto.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes + testes backend verdes.
