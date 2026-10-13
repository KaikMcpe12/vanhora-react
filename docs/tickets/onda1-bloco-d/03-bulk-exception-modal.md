# 03: UC-A1 — `BulkExceptionModal` + `DateRangeField`

**PRD de origem:** [`../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md`](../../prds/onda1-09-uc-a1-cancelar-horarios-bulk.md)

**Milestone:** Onda 1 — Bloco D

**What to build:** novo componente `DateRangeField` encapsulando `react-imask` (reusado por UC-A2 ticket 06). Novo modal `BulkExceptionModal` para cancelamento em lote: `DateRangeField` + `ChoiceChips` para type (cancelled / suspended) + textarea para reason + preview "N exceções serão criadas em M dias". Submit stub para integração no ticket 04.

**Blocked by:** None (paralelo a 01 e 02)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-d`, `front`, `admin`, `cooperativa`

## Acceptance criteria

- [ ] Novo componente `DateRangeField` encapsula `react-imask` existente:
  - Dois campos date com validação `from <= to`.
  - Suporte a formatos locais pt-BR.
  - API reusável para `RecessModal` do ticket 06.
- [ ] Novo modal `BulkExceptionModal` com:
  - `DateRangeField`.
  - `ChoiceChips` para `type` (`cancelled` / `suspended`).
  - Textarea para `reason` (1–500 chars, contador).
  - Preview em tempo real: "~N exceções serão criadas em M dias".
- [ ] Modal com `aria-modal="true"`, `autoFocus` no primeiro campo.
- [ ] Mobile: modal usa `Sheet` em viewports pequenos.
- [ ] Submit é stub (chama callback injetado — integração no ticket 04).
- [ ] Catalogação de `BulkExceptionModal` e `DateRangeField` em `/admin/components-preview`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
