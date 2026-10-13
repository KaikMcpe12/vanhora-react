# PRD — UC-A1 — Cancelar N horários de motorista em janela de datas

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco D — dependência sequencial com UC-A2)
> **Persona:** Admin + Cooperativa
> **Decisões relacionadas:** D26 (PRD separado de UC-A2, embora compartilhem o endpoint `/bulk`).

## 1. Resumo

Admin ou cooperativa precisa cancelar todos os horários de um motorista específico em uma faixa de datas (ex: motorista em cirurgia por 1 semana). Hoje: filtro não aceita `driver_id` arbitrário, não há bulk action, cada exceção é criada 1 por vez. Este PRD introduz:
- Query param `driver_id` em `GET /api/admin/schedules`.
- Endpoint novo `POST /api/admin/schedules-exceptions/bulk` (reusado por UC-A2 por D26).
- `AdminBulkBar` novo + `BulkExceptionModal` novo + checkbox nas linhas da tabela.

## 2. Problema real + usuário impactado

**Persona:** admin coordenando plataforma; cooperativa gerenciando motoristas da própria frota.

**Problema:** motorista entra em cirurgia / férias / afastamento. Admin precisa cancelar 7 dias × 3 horários/dia = 21 exceções. Hoje: 21 modais. Fluxo frágil, cansativo, propenso a erro humano.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.2 "UC-A1 — Cancelar N horários de motorista em janela de datas" (linhas ~438–473) + Status v1.1.0 por D26 (linha ~467).
- **Doc base — Endpoints:** §7.3 itens 1 e 2 (linhas ~1118–1119).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco D" linha UC-A1 + §6.1 R5 + §6.2 R12.

## 4. User stories

1. **Como** admin com motorista em cirurgia por 7 dias, **quero** filtrar `/admin/schedules` por `driver_id`, selecionar todos os horários dele e cancelar com date-range + motivo único, **para** 1 ação cobrir 21 exceções.
2. **Como** cooperativa afastando motorista próprio, **quero** mesma capacidade restrita à minha coop, **para** autonomia operacional.
3. **Como** admin vendo o response 207 após o bulk, **quero** ver quais exceções falharam individualmente, **para** retry pontual sem refazer tudo.
4. **Como** admin tentando bulk com range > 90 dias, **quero** erro 400 claro, **para** não quebrar o sistema por acidente.
5. **Como** admin selecionando horários do motorista + confirmando o modal, **quero** audit trail: cada exceção carrega `created_by = <admin.id>`, **para** rastreabilidade.
6. **Como** admin que executou bulk em schedule que já está cancelado para alguma data no range, **quero** o backend ser idempotente (ignorar silenciosamente), **para** não dar falso erro.
7. **Como** admin cancelando range que inclui dias fora do `active_days` do schedule, **quero** o backend pular esses dias, **para** não gerar exceções inúteis.

## 5. Requisitos funcionais

- **RF1** — Backend: adicionar `driver_id` como query param (aditivo) em `GET /api/admin/schedules`:
  - Filtra schedules cuja `route.drive_id = $driver_id`.
  - Combina com filtros existentes (`cooperative_id`, `route_id`, etc).
- **RF2** — Backend: novo endpoint `POST /api/admin/schedules-exceptions/bulk`:
  - Body: `{ schedule_ids: UUID[], date_range: { from: date, to: date }, type: "cancelled"|"suspended", reason: string }`.
  - Servidor itera: 1 linha em `schedules_exceptions` por (schedule × data no range aplicável — pulando dias fora de `active_days`).
  - Response 207 (multi-status): `{ created: UUID[], failed: [{ schedule_id, date, error }] }`.
  - Transação única (BEGIN...COMMIT). Falhas individuais não abortam o lote inteiro.
- **RF3** — Audit: todas as exceções criadas carregam `created_by = <jwt.sub>`.
- **RF4** — Validações no backend:
  - `date_range.from <= date_range.to` → 400 se violado.
  - `range > 90 dias` → 400 (proteção; ver R5 roadmap sobre diferença vs A2 60d).
  - `schedule_ids` não vazio → 400 se vazio.
  - `type` ∈ {`cancelled`, `suspended`} → 400 se inválido.
  - `reason` 1–500 chars → 422 se violado.
- **RF5** — Idempotência: se já existe exceção para `(schedule_id, date)` com mesmo `type`, pular silenciosamente (não erro).
- **RF6** — Front: filtro "Motorista" (`Combobox` reusando padrão `SearchableSelect`) em `SchedulesPage`.
- **RF7** — Front: coluna de checkbox em cada linha da tabela de `/admin/schedules`.
- **RF8** — Front: novo componente `AdminBulkBar` (barra flutuante no fundo da tabela) que aparece quando ≥1 checkbox marcado:
  - Mostra "N selecionados".
  - Botão "Cancelar selecionados em janela…" abre `BulkExceptionModal`.
  - Botão "Limpar seleção".
- **RF9** — Front: novo `BulkExceptionModal`:
  - `DateRangeField` (novo componente baseado em `react-imask` — reusado por UC-A2).
  - `ChoiceChips` para `type` (`cancelled` / `suspended`).
  - Textarea para `reason`.
  - Preview "N exceções serão criadas em M dias".
- **RF10** — Response 207 → front mostra toast consolidado: "X exceções criadas, Y falharam. [Ver detalhes]".
- **RF11** — Catalogação de `AdminBulkBar`, `BulkExceptionModal`, `DateRangeField` em `/admin/components-preview`.

## 6. Requisitos não-funcionais

- **Performance:** transação SQL única (atomicidade do lote). Index composto `(schedule_id, exception_date)` sugerido em `schedules_exceptions`.
- **Acessibilidade:**
  - Checkbox em cada row com `aria-label="Selecionar horário X"`.
  - `AdminBulkBar` com `role="toolbar"` + `aria-label="Ações em lote"`.
  - Modal com `aria-modal="true"` + autoFocus no primeiro campo.
  - Alvos ≥44×44px (regra §9.1).
- **Mobile-first:** `AdminBulkBar` em mobile vira sticky bottom. Modal usa `Sheet` em viewports pequenos.
- **Observability:** backend loga cada bulk (INFO level) com `jwt.sub`, `schedule_ids.length`, `range`, `created.length`, `failed.length`.

## 7. Fluxo UX detalhado

1. Admin abre `/admin/schedules`.
2. Filtra por "Motorista = João" via novo filtro `Combobox` → tabela mostra schedules da R-204 (todos atribuídos a João).
3. Marca checkbox em 3 schedules da tabela.
4. `AdminBulkBar` aparece: "3 selecionados" + botão "Cancelar selecionados em janela…".
5. Admin clica → `BulkExceptionModal` abre.
6. Preenche `DateRangeField` (ex: 20/10 a 26/10 = 7 dias). Type = `cancelled`. Reason = "Cirurgia programada".
7. Preview: "21 exceções serão criadas (3 schedules × 7 dias) — pulando dias fora de `active_days`".
8. Admin clica "Confirmar".
9. Front → `POST /api/admin/schedules-exceptions/bulk`.
10. Backend itera (transação): materializa linhas em `schedules_exceptions`. Pula dias fora de `active_days`. Pula (schedule, date) idempotentes.
11. Response 207: `{ created: [...], failed: [...] }`.
12. Toast: "19 exceções criadas, 2 falharam (fora do active_days)". Com `[Ver detalhes]` → modal secundário com breakdown.
13. Tabela refetch → status visual dos schedules atualizado.
14. Edge case — range inclui dias que schedule não opera: ignorar silenciosamente (vai para `failed` com error `out_of_active_days` OU é descontado antes de materializar — decisão do backend desde que resultado seja consistente).
15. Edge case — range > 90 dias: 400 antes de iterar.

## 8. Mudanças de API/schema

- **Endpoint novo:** `POST /api/admin/schedules-exceptions/bulk` (§7.3 item 1 doc base).
- **Endpoint existente alterado:** `GET /api/admin/schedules` ganha query param `driver_id` (§7.3 item 2 doc base).
- **Schema:** nenhum aditivo. Linhas vão para `schedules_exceptions` existente.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: admin cancela 3 schedules em 7 dias**
```
Dado que o admin filtrou /admin/schedules por driver = João
  E a tabela mostra 3 schedules do João
Quando o admin marca os 3 checkboxes
  E clica "Cancelar selecionados em janela"
  E preenche range 20/10 a 26/10, type = cancelled, reason = "Cirurgia programada"
  E confirma
Então o backend recebe POST /schedules-exceptions/bulk com 3 schedule_ids e 7 dias
  E cria exceções em schedules_exceptions respeitando active_days
  E retorna 207 com { created: [...], failed: [...] }
  E o toast consolidado mostra "N exceções criadas, M falharam"
```

**Cenário 2 — Edge case: idempotência em exceção já existente**
```
Dado que o admin executa bulk de cancelamento
  E para 1 par (schedule_id, date), já existe exceção cancelled
Quando o backend processa esse par
Então ele PULA silenciosamente (não gera erro)
  E esse par NÃO aparece em failed
  E NÃO duplica a exceção
```

**Cenário 3 — Erro: range > 90 dias**
```
Dado que o admin preenche range 20/10 a 20/02 (123 dias)
Quando ele clica "Confirmar"
Então o backend retorna 400 com error.code = "range_too_long"
  E o modal mostra mensagem contextual "Range máximo 90 dias"
  E nenhuma exceção é criada
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.2 UC-A1 "Escopo Negativo":

- **NÃO** reatribuir motoristas automaticamente (admin usa UC-A8 depois na Onda 2).
- **NÃO** notificar passageiros afetados (D6).
- **NÃO** adicionar sugestão IA "melhor motorista substituto".
- **NÃO** criar `AdminBulkBar` com export CSV — bulk aqui é só cancelamento/exceção.

Reforço §6.3: sem IA, sem notificação externa.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco D:
- **Pré-requisito de UC-A2 (D26):** UC-A2 reusa `POST /schedules-exceptions/bulk`. UI de UC-A2 pode ser desenhada em paralelo, mas integração só após UC-A1 estabilizar.
- **~> UC-A6:** PUT/PATCH subsequentes ao bulk passam pelo middleware de A6 (recomendação cedo na onda).
- **Independente de outros UCs do Bloco D (UC-A18+F4).**

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- **R5 (produto):** limite de range difere entre A1 (90d) e A2 (60d) coabitando no mesmo endpoint `/bulk`. Mitigação: backend discrimina por presença de `schedule_ids` (A1, 90d) vs `route_ids` (A2, 60d).
- **R12 (técnico):** A1 é 25% do esforço da onda. Começar na Semana 1 (recomendação §4.3 roadmap). Design de `AdminBulkBar` + `BulkExceptionModal` pode começar com mock antes do endpoint estar pronto.

## Perguntas residuais

Nenhuma.
