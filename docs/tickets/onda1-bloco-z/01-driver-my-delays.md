# 01: Página `/driver/my-delays` (UC-A13)

**PRD de origem:** [`../../prds/onda1-03-uc-a13-driver-my-delays.md`](../../prds/onda1-03-uc-a13-driver-my-delays.md)

**Milestone:** Onda 1 — Bloco Z

**What to build:** motorista passa a ter página própria `/driver/my-delays` listando seus atrasos dos últimos 30d. Filtros por severidade, causa e período. Clique em linha abre `delay-detail-dialog` em modo read-only. Item novo no menu lateral do driver com badge de contagem dos últimos 7d. Empty state positivo para motorista sem atrasos. D23 aplicada: nenhuma coluna "passageiros" na tabela.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-z`, `front`, `motorista`

## Acceptance criteria

- [ ] Nova rota `/driver/my-delays` registrada em `src/routes.tsx` sob o prefixo driver.
- [ ] Hook consome `GET /api/admin/delays?reported_by=<self>` (JWT impõe `self`).
- [ ] Default: últimos 30 dias.
- [ ] Filtros via `useTableFilters` sobre `nuqs`: severidade (ChoiceChips), causa (ChoiceChips), período (7d/30d/90d).
- [ ] Reusa `AdminTable`, `AdminPagination`, `SeverityBadge`, `StatusChip`.
- [ ] Clique na linha abre `delay-detail-dialog` em modo read-only (sem botões de edit/delete; sem resolver/reabrir — este fluxo é apenas admin/coop via UC-F4).
- [ ] Linha mostra badge "Resolvido" (`StatusChip` success) quando `resolved_by IS NOT NULL` (campo chega da UC-F4 — se este ticket subir antes, badge renderiza como "pendente").
- [ ] Item novo no menu lateral do driver: "Meus Atrasos" com ícone `AlertTriangle` + badge count 7d.
- [ ] Empty state positivo quando 0 atrasos: "Nenhum atraso reportado — ótimo trabalho ✓" via `AdminEmptyState`.
- [ ] **D23:** nenhuma coluna/referência a "passageiros" nesta página; grep `18/22` ou `passengers` em arquivos tocados retorna 0.
- [ ] Linhas clicáveis seguem padrão PR7 (`role="button"`, `tabIndex={0}`, Enter/Space, `focus-visible:ring-2`, `aria-label`).
- [ ] Mobile: tabela responsiva ou stack vertical em <640px.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
