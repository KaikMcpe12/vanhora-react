# 03: UC-A7 — Horário temporário com motorista substituto (fullstack)

**PRD de origem:** [`../../prds/onda1-06-uc-a7-schedules-temporary-driver.md`](../../prds/onda1-06-uc-a7-schedules-temporary-driver.md)

**Milestone:** Onda 1 — Bloco S

**What to build:** cooperativa criando serviço extra via `ExceptionModal` modo "Serviço extra" passa a poder atribuir motorista **diferente do titular da rota** para aquela ocorrência específica. Campo "Motorista" no modal com hint "Se vazio, usa o titular da rota". `routes.drive_id` não muda. Backend valida que o substituto pertence à mesma cooperativa (422 se não) e tem `role = 'driver'`. Card no board mostra "Substituto" quando `driver_id != route.drive_id`. Alerta âmbar quando titular inativo + sem override.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 2d

**Labels:** `onda1`, `bloco-s`, `fullstack`, `cooperativa`

## Acceptance criteria

- [ ] Migration adiciona `schedules_temporary.driver_id uuid NULL FK users(id)`.
- [ ] Semântica: `NULL` herda `routes.drive_id`; preenchido faz override para a ocorrência.
- [ ] `POST /api/admin/schedules-temporary` aceita campo opcional `driver_id`.
- [ ] Validação backend: `driver.cooperative_id === schedule_temporary.route.cooperative_id` ou 422.
- [ ] Validação backend: `driver.role === 'driver'` ou 422.
- [ ] Response GET inclui `driver` resolvido (titular herdado ou substituto).
- [ ] `ExceptionModal` em modo "Serviço extra" ganha campo "Motorista" (`SearchableSelect`), hint "Se vazio, usa o titular da rota", default vazio.
- [ ] Card no board renderiza badge "Substituto" quando `driver_id != NULL && driver_id != route.drive_id`.
- [ ] Edge case titular `inactive` + sem override: card em tom âmbar com mensagem "Rota sem motorista — defina um substituto" + CTA para abrir modal.
- [ ] Edge case motorista escolhido com outro schedule no mesmo horário: front mostra warning amarelo antes do submit ("Esse motorista já tem um horário próximo às HH:MM — deseja continuar?"); backend não bloqueia.
- [ ] Testes de teclado passam no modal.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes + testes backend verdes.
