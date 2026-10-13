# 04: UC-A1 — Integração end-to-end (filtro Motorista + 207 handling + toasts)

**PRD de origem:** [`../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md`](../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md)

**Milestone:** Onda 1 — Bloco D

**What to build:** fecha o laço de UC-A1. Adiciona filtro "Motorista" (`Combobox` usando `SearchableSelect`) em `/admin/schedules`. Conecta `AdminBulkBar` → `BulkExceptionModal` → `POST /schedules-exceptions/bulk`. Parseia response 207, mostra toast consolidado "X criadas, Y falharam" com CTA "Ver detalhes" (modal secundário com breakdown por par schedule/data).

**Blocked by:** 01, 02, 03

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-d`, `fullstack`, `admin`, `cooperativa`

## Acceptance criteria

- [ ] Filtro "Motorista" (`Combobox`) em `/admin/schedules` consumindo o novo query param `driver_id` do backend.
- [ ] Botão "Cancelar selecionados em janela…" do `AdminBulkBar` abre `BulkExceptionModal`.
- [ ] Submit do modal chama `POST /api/admin/schedules-exceptions/bulk`.
- [ ] Response 207 é parseado em `{ created: UUID[], failed: [{ schedule_id, date, error }] }`.
- [ ] Toast consolidado: "X exceções criadas, Y falharam" com CTA "Ver detalhes".
- [ ] CTA abre modal secundário listando os pares falhados com motivo.
- [ ] Após submit bem-sucedido: tabela refetch, seleção limpa, `AdminBulkBar` some.
- [ ] Erro 400 (range > 90d, from > to, etc): modal mantém-se aberto com mensagem contextual.
- [ ] Edge case response com 0 criadas e todas falhadas: toast de aviso, modal mantém-se aberto.
- [ ] Testes de teclado: Tab por filtro, checkboxes, bulk bar, modal.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
