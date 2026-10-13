# PRD — UC-A2 — Exceção em intervalo de datas (recesso)

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco D — depende de UC-A1)
> **Persona:** Admin + Cooperativa
> **Decisões relacionadas:** D26 (PRD separado de UC-A1 — reusam `/bulk`).

## 1. Resumo

Marcar recesso (ex: 24/12 a 02/01) para uma ou várias rotas em um fluxo único. Hoje: `ExceptionModal` aceita 1 data por horário — 10 dias × 5 horários = 50 modais. Este UC reusa o endpoint `POST /api/admin/schedules-exceptions/bulk` introduzido por UC-A1 (discriminando por `route_ids` em vez de `schedule_ids`) + novo `RecessModal` com `CooperativePicker` + lista de rotas.

## 2. Problema real + usuário impactado

**Persona:** admin planejando recesso de fim de ano; cooperativa definindo recesso próprio em feriado prolongado.

**Problema:** recesso natalino típico cobre 7–14 dias × todas as rotas da cooperativa × todos os horários dessas rotas = centenas de exceções manuais. Hoje: inviável fazer manualmente, abrindo porta para "esquecer de cancelar" e passageiros aparecerem no ponto.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.2 "UC-A2 — Exceção em intervalo de datas (recesso)" (linhas ~477–505) + Status v1.1.0 por D26 (linha ~508).
- **Doc base — Endpoints:** §7.3 item 1 (reusado — linha ~1118).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco D" linha UC-A2 + §6.1 R5.

## 4. User stories

1. **Como** admin planejando recesso de Natal, **quero** selecionar múltiplas rotas + date-range 24/12 a 02/01 + motivo único, **para** criar todas as exceções em 1 ação.
2. **Como** cooperativa marcando recesso só do próprio escopo, **quero** o `CooperativePicker` já pré-filtrado para minha coop, **para** não arriscar afetar outra coop.
3. **Como** admin tentando range > 60 dias (recesso típico máximo), **quero** erro claro, **para** não gerar centenas de exceções por engano.
4. **Como** admin cancelando rotas com `active_days = seg-sex` em range que inclui sábado/domingo, **quero** o backend pular esses dias, **para** não criar exceção inútil.
5. **Como** admin executando recesso em rota que já tem exceção para alguma data no range, **quero** idempotência, **para** não duplicar nem falhar.
6. **Como** admin executando recesso em range que cruza horário temporário já cadastrado, **quero** o temporário permanecer intocado, **para** não quebrar programação especial pontual.

## 5. Requisitos funcionais

- **RF1** — Reusar endpoint `POST /api/admin/schedules-exceptions/bulk` (introduzido por UC-A1). Discriminação por body:
  - UC-A1: `schedule_ids: UUID[]` + limite 90 dias.
  - **UC-A2: `route_ids: UUID[]` + limite 60 dias.**
  - Servidor resolve `route_ids` para todos os `schedule_ids` filhos antes de materializar.
- **RF2** — Novo componente `DateRangeField` (compartilhado com UC-A1) encapsulando `react-imask` existente.
- **RF3** — Novo `RecessModal`:
  - `CooperativePicker` (opcional — se preenchido, filtra lista de rotas).
  - Lista de rotas com checkboxes (todas da coop selecionada OU todas da plataforma se admin não filtrou).
  - `DateRangeField`.
  - Textarea para `reason`.
  - `ChoiceChips` para `type` (`cancelled` / `suspended`).
  - Preview "N exceções serão criadas em M dias × R rotas".
- **RF4** — Validações no backend (reusadas de UC-A1):
  - `date_range.from <= date_range.to` → 400.
  - **Específico UC-A2:** `range > 60 dias` → 400.
  - `route_ids` não vazio → 400.
  - Resto igual UC-A1.
- **RF5** — Pular silenciosamente dias fora de `active_days` de cada schedule filho.
- **RF6** — Pular silenciosamente (schedule, date) idempotentes (já tem exceção).
- **RF7** — `schedules_temporary` **NÃO é afetado** por este bulk (só grade recorrente via `schedules`).
- **RF8** — Response 207 (igual UC-A1): `{ created, failed }`.
- **RF9** — Audit: `created_by = <jwt.sub>` em cada linha criada.
- **RF10** — Acesso ao `RecessModal` via:
  - Botão no header de `/admin/schedules` (admin): "Marcar recesso".
  - Botão no header de `/cooperative/schedules` (coop): "Marcar recesso".

## 6. Requisitos não-funcionais

- **Performance:** reusa transação única de UC-A1. Lote pode ser grande (ex: 50 rotas × 10 dias × 3 horários = 1500 exceções). Backend deve suportar sem timeout — se necessário, chunk interno de 500.
- **Acessibilidade:** lista de rotas tem `role="group"` + `aria-label="Rotas afetadas"`. Preview tem `aria-live="polite"`.
- **Mobile-first:** `RecessModal` usa `Sheet` em viewports pequenos. Lista de rotas vira stack scrollable.

## 7. Fluxo UX detalhado

1. Admin clica "Marcar recesso" no header de `/admin/schedules`.
2. `RecessModal` abre.
3. (Opcional) Admin seleciona cooperativa no `CooperativePicker` → lista de rotas filtra.
4. Admin marca rotas desejadas via checkboxes (ou "Selecionar todas").
5. Preenche `DateRangeField` (ex: 24/12 a 02/01).
6. Type = `cancelled`. Reason = "Recesso de fim de ano".
7. Preview: "~450 exceções serão criadas (15 rotas × ~30 schedules/rota × ~10 dias no range, descontando dias fora de active_days)".
8. Admin confirma → `POST /schedules-exceptions/bulk` com body `{ route_ids: [...], date_range, type, reason }`.
9. Backend: resolve `route_ids` → `schedule_ids` → materializa em transação.
10. Response 207: `{ created, failed }`.
11. Toast consolidado + opção "Ver detalhes".
12. Edge case — range cruza horário temporário já cadastrado: temporário NÃO é afetado (só grade recorrente). Verificação: backend NÃO consulta `schedules_temporary` para este bulk.
13. Edge case — rota com `active_days: []` (nenhum dia): nenhum schedule afetado, logado em `failed` com error `no_schedules_in_range`.

## 8. Mudanças de API/schema

- **Endpoint:** reusa `POST /api/admin/schedules-exceptions/bulk` introduzido por UC-A1.
- **Body:** `{ route_ids: UUID[], date_range: { from, to }, type, reason }`. Backend discrimina de UC-A1 pela presença de `route_ids` vs `schedule_ids`.
- **Schema:** zero mudança.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: admin marca recesso 24/12 a 02/01 em 10 rotas**
```
Dado que a cooperativa Alpha tem 10 rotas, cada uma com 3 schedules (seg-sex)
Quando o admin abre RecessModal e seleciona:
  - CooperativePicker = Alpha
  - 10 rotas marcadas
  - range 24/12 a 02/01 (10 dias)
  - type = cancelled, reason = "Recesso de fim de ano"
E confirma
Então o backend recebe POST /bulk com route_ids = [10 UUIDs] e range de 10 dias
  E resolve para ~30 schedules (3 por rota)
  E materializa exceções pulando sábados/domingos (active_days = seg-sex)
  E retorna 207 com created ~210 (30 schedules × 7 dias úteis no range) e failed []
```

**Cenário 2 — Edge case: schedules_temporary não é afetado**
```
Dado que a R-204 tem schedule_temporary para 25/12 (serviço extra planejado)
  E o admin executa recesso 24/12 a 02/01 em R-204
Quando o backend processa o bulk
Então apenas schedules recorrentes recebem exceções
  E schedules_temporary para 25/12 permanece ativo intocado
  E o passageiro continua vendo o serviço extra em /schedules para 25/12
```

**Cenário 3 — Erro: range > 60 dias (específico A2)**
```
Dado que o admin preenche range 15/11 a 20/01 (66 dias)
Quando ele confirma
Então o backend retorna 400 com error.code = "range_too_long_for_recess"
  E a mensagem explica que recesso máximo é 60 dias
  E nenhuma exceção é criada
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.2 UC-A2 "Escopo Negativo":

- **NÃO** criar entidade "recesso" ou "feriado" separada — tudo entra como `schedules_exceptions`.
- **NÃO** sugerir feriados nacionais automaticamente.
- **NÃO** reatribuir motoristas.
- **NÃO** criar notificação para passageiros com favoritos afetados automaticamente — eles vão ver via UC-PA1 quando entrarem.

Reforço §6.3: sem feriado automático, sem notificação externa.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco D:
- **Pré-requisito duro:** UC-A1 (reusa `/bulk`). UI pode ser desenhada em paralelo (`RecessModal`, `CooperativePicker` já existe de PR8). **Integração + testes só após UC-A1 estabilizar.**
- **D26:** PRDs separados de UC-A1.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6.1:
- **R5:** limites divergentes de range (A1 90d, A2 60d) coabitando no mesmo endpoint. Mitigação: backend discrimina por presença de `route_ids` vs `schedule_ids`. Documentar explicitamente no PRD de A1 também (já feito).

## Perguntas residuais

Nenhuma.
