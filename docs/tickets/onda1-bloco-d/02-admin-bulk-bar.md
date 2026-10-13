# 02: UC-A1 — `AdminBulkBar` + checkbox nas rows

**PRD de origem:** [`../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md`](../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md)

**Milestone:** Onda 1 — Bloco D

**What to build:** `/admin/schedules` passa a ter checkbox em cada linha da tabela. Quando ≥1 linha marcada, aparece barra flutuante `AdminBulkBar` no fundo da tabela com "N selecionados", botão "Cancelar selecionados em janela…" (abre o modal do ticket 03 — stub por enquanto; integração final no ticket 04) e botão "Limpar seleção". Pode usar mock enquanto o backend do ticket 01 não está pronto.

**Blocked by:** None (can start immediately; não bloqueia por 01)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-d`, `front`, `admin`, `cooperativa`

## Acceptance criteria

- [ ] Coluna de checkbox adicionada em cada linha de `/admin/schedules`.
- [ ] Checkbox com `aria-label="Selecionar horário <descrição curta>"`.
- [ ] Novo componente `AdminBulkBar` renderiza quando ≥1 checkbox marcado:
  - "N selecionados".
  - Botão "Cancelar selecionados em janela…" (stub de callback; integração final no ticket 04).
  - Botão "Limpar seleção" (desmarca todos e esconde a barra).
- [ ] `AdminBulkBar` com `role="toolbar"` + `aria-label="Ações em lote"`.
- [ ] Mobile: barra é sticky bottom.
- [ ] Alvos ≥44×44px.
- [ ] Catalogação de `AdminBulkBar` em `/admin/components-preview`.
- [ ] Testes de teclado (Tab navegando por checkbox + barra).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
