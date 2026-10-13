# PRD — UC-A13 — Histórico próprio de atrasos (`/driver/my-delays`)

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco Z — zero contrato novo)
> **Persona:** Motorista
> **Decisões relacionadas:** D23 (campo "passageiros" NÃO exibido no front).

## 1. Resumo

Motorista reporta atraso e nunca mais o vê. Este PRD adiciona a página `/driver/my-delays` com histórico dos últimos 30 dias (`reported_by = self`) usando a infra existente (`AdminTable`, `useTableFilters`, `SeverityBadge`). Zero mudança de backend — endpoint `GET /api/admin/delays?reported_by=<self>` já é suportado via escopo driver (`api-spec.md §3.7`).

## 2. Problema real + usuário impactado

**Persona:** motorista (persona 4.4 do doc base). Opera 1 van, reporta da rua em rede instável, quer transparência pessoal mínima.

**Problema:** depois de reportar atraso via wizard adaptativo (PR1), o motorista perde visibilidade do que foi registrado. Transparência pessoal é zero. Também não vê quando admin/coop marcou o atraso como "Resolvido" (UC-F4 na Onda 1).

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.4 "UC-A13 — Histórico próprio de atrasos (`/driver/my-delays`)" (linhas ~886–918).
- **Doc base — D23:** §3.7 (linha ~180) + §3.5 "Dívidas Técnicas" (linha ~159).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco Z" linha UC-A13.
- **API-spec:** `api-spec.md §3.7` (escopo driver já garante filtro).

## 4. User stories

1. **Como** motorista que reportou atraso ontem, **quero** ver o atraso listado no meu histórico, **para** confirmar que o report chegou.
2. **Como** motorista revisando a semana, **quero** filtrar por severidade (chips), **para** ver padrões (ex: sempre atrasos "high" na segunda).
3. **Como** motorista com atraso resolvido pelo admin via UC-F4, **quero** ver badge "Resolvido" na linha, **para** saber que a cooperativa cuidou.
4. **Como** motorista sem atrasos recentes, **quero** empty state positivo ("Nenhum atraso reportado — ótimo trabalho ✓"), **para** reforço motivacional.
5. **Como** motorista navegando o menu lateral, **quero** item "Meus Atrasos" com badge de contagem dos últimos 7 dias, **para** acesso rápido.
6. **Como** motorista clicando numa linha, **quero** abrir o `delay-detail-dialog` existente em modo read-only, **para** ver detalhes sem risco de editar.

## 5. Requisitos funcionais

- **RF1** — Nova rota `/driver/my-delays` registrada em `src/routes.tsx` sob o prefixo driver.
- **RF2** — Página consome `GET /api/admin/delays?reported_by=<self>` (JWT impõe o `self` — ver §3.7 api-spec).
- **RF3** — Default: últimos 30 dias.
- **RF4** — Filtros disponíveis via `useTableFilters` sobre `nuqs`:
  - Severidade (`ChoiceChips` — low/medium/high).
  - Causa (`ChoiceChips` com causas existentes — `mechanical`, `traffic`, `weather`, `other`).
  - Período (7d / 30d / 90d).
- **RF5** — Reusa `AdminTable` + `AdminPagination` + `SeverityBadge` + `StatusChip` (convenções §9.1).
- **RF6** — Clique na linha abre `delay-detail-dialog` em modo **read-only** (motorista não edita nem deleta).
- **RF7** — Linha mostra badge "Resolvido" (`StatusChip` tone `success`) quando `resolved_by IS NOT NULL` (UC-F4 fornece esses campos — ver dep).
- **RF8** — Item no menu lateral driver: "Meus Atrasos" com ícone `AlertTriangle` + badge count = atrasos dos últimos 7 dias.
- **RF9** — Empty state positivo quando contagem = 0 ("Nenhum atraso reportado — ótimo trabalho ✓") usando `AdminEmptyState`.
- **RF10** — **D23 aplicada:** nenhuma coluna de "passageiros" na tabela. Nenhuma referência a `18/22` no mock desta página.

## 6. Requisitos não-funcionais

- **Performance:** paginação zero-indexed (`page=0, limit=12` — exceção §9.2). Cache React Query 5min.
- **Acessibilidade:** linhas clicáveis seguem padrão PR7 (`role="button"`, `tabIndex={0}`, Enter/Space, `focus-visible:ring-2`, `aria-label`).
- **Mobile-first:** motorista normalmente usa celular. Tabela responsiva ou stack vertical em viewports <640px.

## 7. Fluxo UX detalhado

1. Motorista clica em "Meus Atrasos" no menu lateral.
2. Rota `/driver/my-delays` monta.
3. Hook `useDelays({ reported_by: 'self', days: 30 })` dispara.
4. Loading: skeleton table.
5. Response 200 com atrasos: `AdminTable` renderiza. Cada linha: data, horário, severidade (`SeverityBadge`), causa (`ChoiceChip`), status (resolvido? → `StatusChip` success; pendente → nenhum badge).
6. Filtros via `useTableFilters` persistem em URL (`?severity=high&period=7d`).
7. Clique em linha abre `delay-detail-dialog` read-only.
8. Response 200 com 0 atrasos: `AdminEmptyState` com mensagem positiva + ilustração neutra (sem ícone de erro).
9. Edge case — API falhando: `AdminEmptyState` com mensagem "Não conseguimos carregar o histórico agora" + retry.
10. Edge case — atraso deletado (soft-delete) via admin: não aparece na lista.

## 8. Mudanças de API/schema

**Nenhuma mudança própria.** `api-spec.md §3.7` já garante filtro `reported_by=<self>` para role driver. Campos `resolved_by`/`resolved_at` lidos por este UC são **aditivos do UC-F4** (ver §7.2 item 15 do doc base).

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: motorista com 3 atrasos no mês**
```
Dado que o motorista tem 3 atrasos reportados nos últimos 30 dias (1 high, 2 medium)
  E 1 deles foi resolvido pelo admin via UC-F4
Quando o motorista abre /driver/my-delays
Então a tabela renderiza 3 linhas
  E o atraso resolvido mostra badge "Resolvido" tone success
  E o menu lateral mostra "Meus Atrasos" com badge "3"
```

**Cenário 2 — Edge case: motorista sem atrasos**
```
Dado que o motorista tem 0 atrasos reportados nos últimos 30 dias
Quando ele abre /driver/my-delays
Então AdminEmptyState renderiza "Nenhum atraso reportado — ótimo trabalho ✓"
  E o menu lateral mostra "Meus Atrasos" sem badge
```

**Cenário 3 — Erro: motorista tenta editar atraso**
```
Dado que o motorista clica em uma linha da tabela
Quando o delay-detail-dialog abre
Então todos os campos são read-only (sem botões de edit ou delete)
  E não há CTA para "Reabrir" ou "Resolver" (ações restritas a admin/cooperative — ver UC-F4)
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.4 UC-A13 "Escopo Negativo":

- **NÃO** mostrar métricas de pontualidade comparadas aos pares (fricção interna — D16 contexto).
- **NÃO** permitir editar/deletar atraso reportado — read-only.
- **NÃO** mostrar atrasos de outros motoristas (mesmo da mesma rota).
- **NÃO** adicionar export CSV nesta primeira versão.

Reforço §6.3 + D23: nenhuma coluna "passageiros" na tabela do driver.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2:
- **Nenhuma dependência de endpoint novo** (zero backend).
- **Dependência cross-UC com UC-F4 (bundle A18+F4):** colunas `resolved_by`/`resolved_at` em `delays` são adicionadas por UC-F4. Badge "Resolvido" requer esses campos. Se este UC subir **antes** de UC-F4, badge "Resolvido" renderiza `null` (equivalente a "pendente") — comportamento aceitável.
- **D23:** aplicada aqui (sem coluna "passageiros").

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- Nenhum risco específico aplicável.
- Nota: UC-A13 é o item mais simples do Bloco Z (1d esforço) — deve subir **primeiro** na Onda 1 para dar win cedo ao motorista.

## Perguntas residuais

Nenhuma.
