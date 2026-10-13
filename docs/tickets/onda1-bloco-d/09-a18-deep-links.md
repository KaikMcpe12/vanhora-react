# 09: UC-A18 — Deep-links nomeados (`?today`/`?mine`) + itens de menu

**PRD de origem:** [`../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md`](../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md) (bundle A18+F4; parte A18)

**Milestone:** Onda 1 — Bloco D

**What to build:** URLs nomeadas acessíveis via menu lateral ou atalhos: `/admin/schedules?today` (= hoje) e `/admin/delays?mine` (filtros compostos por role). Reader de `?today` reescreve para `?date=<ISO today>` via `nuqs` sem recarregar. Reader de `?mine` em `/admin/delays` aplica:
- Role `cooperative`: `cooperativeId = user.cooperativeId` (redundante com JWT, explícito na UI).
- Role `admin`: `resolved_by IS NULL AND severity = 'high'` (triagem alta prioridade).
- Role `driver`: `reported_by = user.id`.

Items novos no menu lateral: "Hoje" e "Minha fila".

**Blocked by:** 07 (para `?mine` admin funcionar precisa `resolved_by` disponível)

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-d`, `front`, `transversal`

## Acceptance criteria

- [ ] Reader de `?today` nas páginas consumidoras (`/admin/schedules`, `/cooperative/schedules`):
  - `useEffect` intercepta `?today` → `nuqs` reescreve URL para `?date=<ISO today>` sem recarregar.
  - `?today` + `?date=<outra>` juntos → `?date` tem prioridade (specific wins); `?today` descartado.
- [ ] Reader de `?mine` em `/admin/delays`:
  - Role `cooperative`: aplica `cooperativeId = <user.cooperativeId>`.
  - Role `admin`: aplica `resolved=false, severity=high`.
  - Role `driver`: aplica `reported_by = <user.id>`.
- [ ] `?mine` em contexto não-aplicável (ex: `/admin/users?mine`): ignorar silenciosamente.
- [ ] Menu lateral ganha itens:
  - "Hoje" (admin + coop em `/schedules`) com ícone `Calendar`.
  - "Minha fila" (todas as personas em `/delays`) com ícone `Inbox` ou `ListChecks`.
- [ ] Items de menu com `aria-label` descritivo.
- [ ] Atraso resolvido some da fila `?mine` admin (filtro `resolved=false`), mas continua visível na listagem geral com badge.
- [ ] Catalogação dos itens de menu + comportamento de `?today`/`?mine` em `/admin/components-preview`.
- [ ] **D25 soft:** se o command palette (UC-A17) opcionalmente listou os atalhos como comandos, verificar paridade de comportamento.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
