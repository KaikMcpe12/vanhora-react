# 05: Higiene mock — auto-filtro `cooperative_id` em páginas compartilhadas

**PRD de origem:** [`../../prds/fase1-03-higiene-mock-cooperative-filter.md`](../../prds/fase1-03-higiene-mock-cooperative-filter.md)

**Milestone:** Fase 1 — Pré-backend

**What to build:** usuário role `cooperative` em `/cooperative/routes` e `/cooperative/schedules` passa a ver apenas rotas/schedules da própria cooperativa, replicando no mock o comportamento que o backend vai enforçar via JWT (`api-spec.md §3.3`/3.4/3.7). Admin não é afetado. `cooperative_id` NÃO aparece na URL (é inferido do contexto, não ajustável).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 0.5d

**Labels:** `fase1`, `front`, `cooperativa`

## Acceptance criteria

- [ ] Em `RoutesPage` compartilhada, role `cooperative` só vê rotas com `cooperativeId === user.cooperativeId`.
- [ ] Em `SchedulesPage` compartilhada, role `cooperative` só vê schedules escopados.
- [ ] Admin continua vendo tudo (filtro `CooperativePicker` manual preservado).
- [ ] `cooperative_id` NÃO aparece na URL para role `cooperative`.
- [ ] Filtro é aplicado **antes** do consumo por `useTableFilters`.
- [ ] Comentário inline no código: `// Backend enforça via JWT (api-spec.md §3.3/3.4/3.7). Mock replica para alinhar comportamento em dev.`
- [ ] Zero regressão nos testes de teclado Tab/Enter/Space das páginas tocadas.
- [ ] Nenhum breaking change em consumidores de `useTableFilters`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
