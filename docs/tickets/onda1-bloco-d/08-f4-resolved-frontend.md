# 08: UC-F4 — Botões resolve/reopen + badge "Resolvido"

**PRD de origem:** [`../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md`](../../prds/onda1-11-uc-a18-f4-deep-links-resolved.md) (bundle A18+F4; parte F4)

**Milestone:** Onda 1 — Bloco D

**What to build:** admin e cooperativa passam a resolver/reabrir atrasos direto da UI. `delay-detail-dialog` ganha botão "Marcar como resolvido" (visível quando pendente) ou "Reabrir" (visível quando resolvido). Para role `driver` ambos ocultos. Badge "Resolvido por {Nome} em DD/MM HH:MM" (`StatusChip` success) na linha da tabela e no dialog quando `resolved_by IS NOT NULL`.

**Blocked by:** 07

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-d`, `front`, `admin`, `cooperativa`

## Acceptance criteria

- [ ] `delay-detail-dialog` ganha botões:
  - "Marcar como resolvido" visível quando `resolved_by IS NULL`.
  - "Reabrir" visível quando `resolved_by IS NOT NULL`.
  - Role `driver`: ambos ocultos (consistente com `/driver/my-delays` read-only).
- [ ] Clique em "Marcar como resolvido" chama `PATCH /api/admin/delays/:id/resolve`; refetch; dialog mostra badge + botão vira "Reabrir".
- [ ] Clique em "Reabrir" chama `PATCH /api/admin/delays/:id/reopen`; refetch; badge some + botão vira "Marcar como resolvido".
- [ ] Badge "Resolvido por {Nome} em DD/MM HH:MM" (`StatusChip` success) renderiza:
  - Na linha da tabela em `/admin/delays`.
  - No cabeçalho do `delay-detail-dialog`.
  - Na linha em `/driver/my-delays` (read-only).
- [ ] Botões com `aria-label` completo + `aria-pressed` para estado.
- [ ] Alvos ≥44×44px.
- [ ] 403 (driver): botões não renderizam; se chamada direta: toast de erro.
- [ ] Atraso resolvido continua na listagem geral (não some) — some apenas da fila `?mine` admin (ticket 09).
- [ ] Catalogação do botão/badge em `/admin/components-preview`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
