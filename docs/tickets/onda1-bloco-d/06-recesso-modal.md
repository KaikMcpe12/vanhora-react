# 06: UC-A2 — `RecessModal` + integração

**PRD de origem:** [`../../prds/onda1-10-uc-a2-excecao-intervalo.md`](../../prds/onda1-10-uc-a2-excecao-intervalo.md)

**Milestone:** Onda 1 — Bloco D

**What to build:** admin e cooperativa passam a ter botão "Marcar recesso" no header de `/admin/schedules` e `/cooperative/schedules` que abre o novo `RecessModal`. O modal tem `CooperativePicker` opcional (admin filtra rotas; coop é pré-filtrada pelo JWT), lista de rotas com checkboxes, `DateRangeField` (reusado do ticket 03), `ChoiceChips` type, textarea reason, preview "~X exceções". Submit chama `POST /schedules-exceptions/bulk` com `route_ids`.

**Blocked by:** 05, 03 (reusa `DateRangeField`)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-d`, `front`, `admin`, `cooperativa`

## Acceptance criteria

- [ ] Botão "Marcar recesso" no header de `/admin/schedules` (admin) e `/cooperative/schedules` (coop).
- [ ] Novo `RecessModal` contém:
  - `CooperativePicker` opcional (admin). Coop logada: campo pré-preenchido + bloqueado.
  - Lista de rotas da coop selecionada com checkboxes + "Selecionar todas".
  - `DateRangeField` (reusado do ticket 03).
  - `ChoiceChips` para `type` (`cancelled` / `suspended`).
  - Textarea para `reason`.
  - Preview em tempo real: "~X exceções serão criadas (R rotas × ~S schedules × D dias no range, descontando dias fora de active_days)".
- [ ] Submit chama `POST /api/admin/schedules-exceptions/bulk` com body `{ route_ids, date_range, type, reason }`.
- [ ] Parse response 207 + toast consolidado "X exceções criadas, Y falharam" com CTA "Ver detalhes".
- [ ] Error 400 (range > 60d): modal mostra mensagem contextual "Recesso máximo 60 dias" e mantém-se aberto.
- [ ] Modal com `aria-modal="true"`, `autoFocus`, uso de `Sheet` em mobile.
- [ ] Lista de rotas com `role="group"` + `aria-label="Rotas afetadas"`.
- [ ] Preview com `aria-live="polite"`.
- [ ] Catalogação de `RecessModal` em `/admin/components-preview`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
