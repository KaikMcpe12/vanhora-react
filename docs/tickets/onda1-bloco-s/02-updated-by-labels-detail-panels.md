# 02: UC-A6 — Labels "Última alteração por X" nos 5 detail panels

**PRD de origem:** [`../../prds/onda1-05-uc-a6-updated-by.md`](../../prds/onda1-05-uc-a6-updated-by.md)

**Milestone:** Onda 1 — Bloco S

**What to build:** admin/coop passa a ver no detalhe de cada rota, horário, usuário, cooperativa e cidade uma linha "Última alteração por {Nome} em {DD/MM/AAAA HH:MM}". Entidade nunca editada mostra "sem alterações registradas". Autor soft-deletado mostra "por usuário removido".

**Blocked by:** 01

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-s`, `front`, `admin`

## Acceptance criteria

- [ ] Label renderiza em `cooperative-detail-panel.tsx`, `route-detail.tsx` e equivalentes para `schedules`, `users`, `cities`.
- [ ] Formato: *"Última alteração por {Nome do Usuário} em {DD/MM/AAAA HH:MM}"* (locale pt-BR).
- [ ] Se `updated_by IS NULL`: *"sem alterações registradas"*.
- [ ] Se `updated_by.deleted: true`: *"Última alteração por usuário removido em DD/MM/AAAA HH:MM"*; nome não é link.
- [ ] Edge case `updated_at < created_at` (defensivo): usa `created_at` como fallback.
- [ ] Label **nunca** revela o campo alterado (sem diff).
- [ ] `aria-label` completo (ex: "Última alteração por Fulano em 15 de outubro de 2026 às 14:30").
- [ ] `created_at` continua visível em outra área do detalhe (não substituído).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
