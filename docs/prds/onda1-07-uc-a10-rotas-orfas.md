# PRD — UC-A10 — Sinalizar rotas órfãs (motorista inativo)

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco S — contrato aditivo independente)
> **Persona:** Admin + Cooperativa
> **Decisões relacionadas:** acoplamento recomendado (não bloqueante) com UC-A8 na Onda 2.

## 1. Resumo

Ao desativar/suspender motorista, suas rotas (`drive_id = <inactive>`) continuam atribuídas tacitamente. Admin descobre o problema só ao abrir cada rota. Este UC puxa a visibilidade para o dashboard: KPI novo "Rotas sem motorista ativo" + filtro `?driver_status=inactive` + badge âmbar no `RouteCard`.

## 2. Problema real + usuário impactado

**Persona:** admin coordenando toda a plataforma; cooperativa gerenciando própria frota (7–30 motoristas, 27 vans/coop — §1.3).

**Problema:** quando motorista fica inativo/suspenso, suas rotas viram "órfãs" silenciosamente. Hoje admin precisa auditar manualmente. Pior: rotas com `drive_id = NULL` são igualmente órfãs mas invisíveis até alguém abrir a rota.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.3 "UC-A10 — Sinalizar rotas órfãs (motorista inativo)" (linhas ~810–836).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco S" linha UC-A10 + §6.1 R10.

## 4. User stories

1. **Como** admin abrindo o dashboard, **quero** ver KPI "Rotas sem motorista ativo" com breakdown por cooperativa, **para** triagem rápida.
2. **Como** cooperativa abrindo seu dashboard, **quero** ver o mesmo KPI escopado à minha coop, **para** agir sem passar pelo admin.
3. **Como** admin filtrando listagem de rotas por `?driver_status=inactive`, **quero** ver só rotas órfãs, **para** campanha de resolução em bloco.
4. **Como** cooperativa vendo rota com motorista inativo no `RouteCard`, **quero** badge âmbar "Motorista afastado — reatribuir", **para** reconhecer o problema sem abrir o card.
5. **Como** admin clicando no badge, **quero** ir direto para `/admin/users?user=<driver_id>`, **para** investigar (na Onda 1) OU abrir `DriverReassignmentModal` direto (quando UC-A8 entrar na Onda 2).
6. **Como** admin reativando motorista, **quero** o badge sumir no próximo refetch, **para** consistência imediata.
7. **Como** admin com rota apontando para motorista soft-deletado, **quero** a rota aparecer na lista de órfãs, **para** não escapar do radar.

## 5. Requisitos funcionais

- **RF1** — Backend adiciona filtro `?driver_status=inactive` em `GET /api/admin/routes`:
  - `WHERE drive_id IS NULL OR drive_id IN (SELECT id FROM users WHERE status = 'inactive')`.
  - Também inclui `users.deleted_at IS NOT NULL` (soft-delete) como órfã.
- **RF2** — Endpoint de dashboard inclui campo novo `orphan_routes_count`:
  - Admin: contagem total + breakdown `{ cooperative_id, cooperative_name, count }[]`.
  - Cooperativa: contagem escopada à própria coop (filtro via JWT).
- **RF3** — Novo `AdminKPICard` nos dashboards:
  - Admin: card "Rotas sem motorista ativo" com breakdown clicável por cooperativa.
  - Cooperativa: card "Rotas sem motorista ativo" (só o número + CTA "Ver rotas").
- **RF4** — Badge âmbar no `RouteCard` quando `driver.status === 'inactive'` OU `driver.deleted_at IS NOT NULL` OU `drive_id IS NULL`.
  - Texto: "Motorista afastado — reatribuir".
  - Tone: `warning` via `StatusChip`.
- **RF5** — Clique no badge:
  - **Onda 1:** navega para `/admin/users?user=<driver_id>` (ou `/admin/routes` com filtro se `drive_id IS NULL`).
  - **Onda 2 (quando UC-A8 entrar):** abre `DriverReassignmentModal` direto. Comportamento é transparente para o PRD — basta o CTA ser pluggable.
- **RF6** — Motorista reativado → badge some automaticamente no próximo refetch.
- **RF7** — Catalogação do `AdminKPICard` novo em `/admin/components-preview`.

## 6. Requisitos não-funcionais

- **Performance:** KPI pode ser cacheado por 1min no backend (não precisa ser real-time). Query usa índice em `users.status`.
- **Acessibilidade:** badge âmbar comunica via cor + ícone (`AlertTriangle`) + texto (regra §1.2 doc base). Alvo ≥44×44px.
- **Mobile-first:** card KPI responsivo. Em mobile, breakdown pode virar accordion.

## 7. Fluxo UX detalhado

1. Admin abre `/admin/dashboard`.
2. Hook de dashboard retorna `orphan_routes_count: { total: 12, breakdown: [{ coop: Alpha, count: 7 }, { coop: Beta, count: 5 }] }`.
3. Card KPI "Rotas sem motorista ativo" renderiza "12" + breakdown clicável.
4. Admin clica em "Alpha (7)" → navega para `/admin/routes?driver_status=inactive&cooperative=<alpha-id>`.
5. Listagem de rotas aparece com 7 rotas órfãs, cada uma com badge âmbar.
6. Admin clica no badge de uma rota → (Onda 1) navega para `/admin/users?user=<driver_id>`.
7. Admin reativa o motorista (via página de usuários).
8. Volta ao dashboard: refetch → `orphan_routes_count` cai em 1.
9. Edge case — motorista reativado + badge ainda visível por cache: aceitável até refetch. Fator ×60s do React Query.
10. Edge case — rota com `drive_id = NULL` desde criação: badge aparece com mensagem "Sem motorista — atribuir" (variação do âmbar).

## 8. Mudanças de API/schema

- **Schema:** nenhuma mudança (zero coluna nova).
- **Endpoint:** `GET /api/admin/routes` ganha query param `driver_status=inactive` (§7.3 item 8 doc base).
- **Response:** endpoint de dashboard inclui campo `orphan_routes_count` (shape por role).

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: admin vê KPI com breakdown**
```
Dado que existem 12 rotas órfãs (7 Alpha, 5 Beta)
Quando o admin abre /admin/dashboard
Então o KPI "Rotas sem motorista ativo" mostra "12"
  E o breakdown lista "Alpha (7)" e "Beta (5)" clicáveis
Quando o admin clica em "Alpha (7)"
Então a URL muda para /admin/routes?driver_status=inactive&cooperative=<alpha-id>
  E a listagem renderiza 7 rotas, todas com badge âmbar
```

**Cenário 2 — Edge case: rota com drive_id = NULL**
```
Dado que a rota R-999 tem drive_id = NULL desde criação
Quando o admin filtra /admin/routes?driver_status=inactive
Então R-999 aparece na listagem
  E o badge âmbar diz "Sem motorista — atribuir"
```

**Cenário 3 — Erro / consistência: motorista reativado**
```
Dado que a rota R-204 tem motorista com status "inactive"
  E o badge âmbar está visível
Quando o admin reativa o motorista (via /admin/users)
  E volta para /admin/routes
  E aguarda refetch (ou força via ação de atualizar)
Então o badge âmbar some de R-204
  E o KPI "Rotas sem motorista ativo" diminui em 1
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.3 UC-A10 "Escopo Negativo":

- **NÃO** auto-desatribuir ao desativar motorista. Mantém referência; admin decide.
- **NÃO** criar alerta por email/push (D6).
- **NÃO** adicionar sugestão de substituto automática (D-globais §6.3).

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2:
- **Nenhuma dependência interna** no Bloco S.
- **A10 ~> A8 (Onda 2):** quando UC-A8 entrar, badge passa a abrir `DriverReassignmentModal` direto em vez de navegar para `/admin/users`. CTA pluggable antecipa.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6.1 R10:
- **R10 (médio — temporário):** entre Onda 1 e Onda 2, badge "Motorista afastado — reatribuir" aponta para `/admin/users` (ação manual indireta). Quando A8 chegar, badge abre modal direto. Mitigação: implementar o CTA do badge como componente/handler pluggable, documentado no PRD de A8 que troca o comportamento.

## Perguntas residuais

Nenhuma.
