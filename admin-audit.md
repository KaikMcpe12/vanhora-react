# Auditoria do Painel Administrativo — VanHora

> documento de diagnóstico do estado atual do painel `/admin/*`, base para planejar a reforma (Fase 5).
> não altera código de aplicação. gerado em 2026-07-24, branch `main`, sobre dados 100% mockados.

## Sumário

1. [Resumo executivo](#1-resumo-executivo)
2. [Mapa de rotas admin](#2-mapa-de-rotas-admin)
3. [Análise transversal](#3-análise-transversal)
4. [Componentes reutilizados vs duplicados](#4-componentes-reutilizados-vs-duplicados)
5. [Gaps com a especificação](#5-gaps-com-a-especificação)
6. [Problemas de UX específicos](#6-problemas-de-ux-específicos)
7. [Recomendações de referência e estética](#7-recomendações-de-referência-e-estética)
8. [Proposta de estrutura para a Fase 5](#8-proposta-de-estrutura-para-a-fase-5)

> **nota sobre a especificação:** o briefing menciona um arquivo `VanHora_Especificação.md`, que **não existe** no repositório. A especificação do admin está distribuída em `api-spec.md` (§3 Endpoints administrativos), `docs/roles-navigation.md`, `docs/database.md` e os PRDs `docs/prd-app-portal-{routes,schedules,users}-*.md`. Este documento usa esses arquivos como a especificação de referência.

---

## 1. Resumo executivo

O painel administrativo tem **7 itens de navegação** (Dashboard, Cidades, Cooperativas, Usuários, Rotas, Horários, Atrasos), dos quais:

- **4 páginas realmente implementadas:** Dashboard, Usuários, Rotas, Horários.
- **3 páginas apenas placeholder:** Cidades, Cooperativas, Atrasos — renderizam só um título + uma frase via `SectionPlaceholder`, sem nenhuma UI de CRUD.
- **2 recursos previstos como página no briefing mas que não existem como rota:** `/admin/schedules/exceptions` e `/admin/schedules/temporary`. Eles existem, porém, como **modais** dentro de `/admin/schedules` (decisão de produto razoável — ver §2).

Contando o Dashboard, são **4 telas com conteúdo real** contra **3 placeholders** e **~6 endpoints admin documentados sem nenhuma UI** (cities, cooperatives, delays têm spec completa em `api-spec.md` mas nenhuma tela funcional).

**O admin é usável?** Parcialmente. Usuários e Horários estão bem construídos e navegáveis; Rotas é bonito mas tem botões mortos (Nova rota / Editar / Desativar sem handler); Dashboard é estático (dados hardcoded no componente); metade do menu leva a páginas vazias.

**É bonito?** As páginas implementadas têm bom acabamento no modo claro e seguem o padrão de cards do lado público (bordas coloridas `border-l-4`/`border-t-[3px]`, `rounded-full` em botões). Mas há **inconsistência interna forte**: o Dashboard usa uma paleta "arco-íris" de ícones (sky, indigo, emerald, orange, violet, red) e tabelas HTML cruas, enquanto Usuários/Rotas usam cards com paleta semântica restrita. Não há uma identidade admin unificada.

**É consistente com o lado público?** Compartilha os primitivos de `components/ui/` e o utilitário `cn()`, então a "linguagem base" é a mesma. Mas o admin **reimplementa** localmente coisas que o público já resolveu (empty states, badges de status, cards de KPI), e não reaproveita o componente `EmptyState` existente.

### Pontos mais críticos

1. **Dark mode quebrado nas páginas de dados.** KPI cards e barras de filtro de Usuários/Rotas/Horários usam cores hardcoded (`bg-white`, `bg-slate-50`, `bg-emerald-50`…) sem variante `dark:`. No modo escuro renderizam cartões brancos sobre fundo escuro — ver `dark-schedules.png`. Só o Dashboard trata dark mode com cuidado.
2. **Filtros decorativos que não filtram.** Em `/admin/schedules`, os filtros de **Cooperativa** e **Data** têm estado mas **não são aplicados** ao `useMemo` que filtra as rotas. O usuário mexe e nada acontece.
3. **Botões mortos e ações destrutivas inconsistentes.** Em `/admin/routes`, "Nova rota", "Editar" e "Desativar" não têm `onClick`. Em `/admin/users` a desativação tem diálogo de confirmação (bom), mas não existe nenhuma UI de exclusão em lugar nenhum, embora o `api-spec` defina `DELETE` (soft-delete) para todas as entidades.
4. **Metade do menu é placeholder.** Cidades, Cooperativas e Atrasos não fazem nada — e Atrasos, em particular, tem endpoint e colunas totalmente especificados em `api-spec.md §3.7`.
5. **Dados hardcoded no componente, não no mock layer.** O Dashboard define `adminKpis`, `delayRows` e `departureRows` inline no `.tsx`; as Rotas definem `ROUTES` inline. Não passam pelo `mockUsersApi`/`mock-*` como o resto, dificultando a futura troca por API real.

---

## 2. Mapa de rotas admin

Rotas definidas em `src/routes.tsx`. Todas usam `AppPortalLayout` (`src/pages/_layouts/app-portal.tsx`) com `role='admin'` derivada do prefixo `/admin`. Em modo dev não há autenticação: navegar para `/admin` já resolve o usuário mock **Ana Gestora** (`admin@vanhora.dev`).

Observação transversal: nenhuma página consome endpoints reais hoje — a coluna "Endpoints previstos" refere-se ao que `api-spec.md` especifica e que a página deveria consumir; a fonte de dados atual é mock ou hardcoded.

#### `/admin` (Dashboard)

**Status:** implementado
**Propósito:** visão consolidada de operação, qualidade e incidentes da rede.
**Arquivo:** `src/pages/app-portal/admin/dashboard.tsx`
**Endpoints previstos:** `GET /api/admin/dashboard/stats` (`api-spec.md §3.8`)
**Fonte de dados atual:** constantes hardcoded no próprio componente (`adminKpis`, `delayRows`, `departureRows`).
**Screenshot:** ![](./audit-screenshots/admin-dashboard.png)

**O que a página tem:**
- Banner de alerta âmbar ("6 atrasos críticos nas últimas 24h") com botão "Ver atrasos".
- 6 KPI cards (Cooperativas Ativas, Rotas Cadastradas, Horários de Hoje, Atrasos 24h, Avaliação Média, Atrasos Críticos), cada um com ícone colorido próprio e chip de tendência.
- Tabela "Últimos Atrasos Reportados" (rota, cooperativa, atraso, motivo, severidade, ação).
- Tabela "Próximas Partidas" (rota, cooperativa, partida, destino, status, ação).

**Problemas identificados:**
- Ícones dos KPIs usam 6 cores diferentes (sky/indigo/emerald/orange/violet/red) → efeito "arco-íris" que compete por atenção e destoa da paleta contida das outras telas admin.
- As duas tabelas são HTML `<table>` cruas — padrão diferente das listagens em card de Usuários/Rotas (duas linguagens de "listar dados" no mesmo painel).
- Todos os botões de ação ("Ver atrasos", "Ver incidentes", "Ver todos", "Abrir", "Detalhes") são links sem `onClick`/`to` — decorativos.
- Sem gráfico algum, apesar de o briefing mencionar "gráfico de atrasos por semana"; só há tabelas.
- Dados fixos: os números não vêm de nenhuma fonte; impossível ver estado vazio/carregando.

#### `/admin/users` (Usuários)

**Status:** implementado (o mais completo do painel)
**Propósito:** gerenciar usuários de todas as roles (admin, cooperativa, motorista).
**Arquivo:** `src/pages/app-portal/users/users-page.tsx` (compartilhado; `admin/users.tsx` só re-exporta)
**Endpoints previstos:** `GET/POST/PUT /api/admin/users`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`, `GET /api/admin/users/:id/schedules` (`api-spec.md §3.2`)
**Fonte de dados atual:** `mockUsersApi` via TanStack Query (padrão correto).
**Screenshot:** ![](./audit-screenshots/admin-users-list.png) · modal: ![](./audit-screenshots/modal-add-user.png)

**O que a página tem:**
- 3 KPI cards (Total de usuários, Motoristas, Inativos) com borda `border-l-4`.
- Busca textual (com botão "Buscar" e commit no Enter) + toggles de status (Ativo/Inativo) + botão "Limpar".
- Grid de cards de usuário com avatar colorido por role, badge de role, indicador de status, ações por card (ver, editar, horários [só motorista], ativar/desativar).
- Paginação numérica real (10 por página).
- Modais: adicionar, editar, visualizar, horários do motorista; diálogo de confirmação para ativar/desativar.

**Problemas identificados:**
- **Sem filtro por role** na UI, embora o `api-spec` e o PRD prevejam filtro por role — para achar todos os admins, é preciso rolar/buscar por nome.
- **Sem filtro por cooperativa** na UI: o estado `selectedCooperative` existe e é enviado à mock API, mas nenhum controle o define.
- KPI cards usam `bg-slate-50`/`bg-sky-50` hardcoded → quebram no dark mode (ver §3.2).
- Empty state e loading state são `<div>` inline reimplementados, não o componente `EmptyState`.

#### `/admin/routes` (Rotas)

**Status:** implementado visualmente, mas com ações não funcionais
**Propósito:** monitorar e gerenciar as rotas de transporte.
**Arquivo:** `src/pages/app-portal/routes/routes-page.tsx` (compartilhado)
**Endpoints previstos:** `GET/POST/PUT /api/admin/routes`, `GET /api/admin/routes/:id`, `PATCH /api/admin/routes/:id/status`, `DELETE /api/admin/routes/:id` (`api-spec.md §3.4`)
**Fonte de dados atual:** array `ROUTES` hardcoded no componente (4 rotas).
**Screenshot:** ![](./audit-screenshots/admin-routes-list.png)

**O que a página tem:**
- 3 KPI cards por status (Ativas/Suspensas/Inativas).
- Busca textual + toggles de status com ícone + "Limpar".
- Grid de cards de rota (badge de status, nome/código, timeline origem→destino, motorista, contagem de horários, ações).
- Botão "Horários" que navega para `/admin/schedules?routeId=...` (funcional, via `Link`).
- Paginação (client-side, `PAGE_SIZE=6`; com 4 rotas nunca aparece).

**Problemas identificados:**
- **"Nova rota", "Editar" e "Desativar/Reativar" não têm `onClick`** — botões mortos. Só "Horários" funciona.
- Filtro/paginação operam sobre um array hardcoded de 4 rotas, não sobre o mock layer.
- KPI cards com cores hardcoded (dark mode quebrado).
- Nenhuma confirmação prevista para desativar (o botão sequer age hoje).

#### `/admin/schedules` (Horários)

**Status:** implementado (rico, com gestão operacional inline)
**Propósito:** grade operacional de horários agrupada por rota, com exceções, serviços extras, atrasos e mudança de status.
**Arquivo:** `src/pages/app-portal/schedules/schedules-page.tsx` (compartilhado)
**Endpoints previstos:** `GET/POST /api/admin/schedules`, `PATCH /api/admin/schedules/:id/status`, `POST /api/admin/schedules-exceptions`, `POST /api/admin/schedules-temporary` (`api-spec.md §3.3`)
**Fonte de dados atual:** `MOCK_ADMIN_ROUTES` + `ADMIN_SCHEDULE_SUMMARY` de `src/lib/data/mock-admin-schedules.ts`.
**Screenshot:** ![](./audit-screenshots/admin-schedules-list.png)

**O que a página tem:**
- 3 KPI cards (Horários ativos hoje, Exceções abertas, Rotas monitoradas).
- Filtros: busca textual + `CooperativePicker` + popover de data + toggle "Somente com exceção" + toggles de status operacional (Em operação/Atrasado/Cancelado/Suspenso).
- Seções por rota (código, cooperativa, origem→destino, preço, chip de exceções, botão "Serviço extra").
- Linhas de horário expansíveis com círculos de dias, badge operacional, menu de ações (`MoreHorizontal`), painel expandido (dias, status, observações, exceção próxima, paradas, avaliação).
- Modais: exceção (cancelar/reagendar/serviço extra), atraso, mudança de status.
- Seção de "Serviços extras" (horários temporários) por rota.

**Problemas identificados:**
- **Filtros de Cooperativa e Data não são aplicados** — `filteredRoutes` (useMemo) depende só de `[committedQuery, statusFilters, onlyExceptions]`; `cooperativeFilter` e `dateFilter` são ignorados. Filtros que não filtram.
- Botões "Novo Horário" e "Carregar mais rotas" sem `onClick`.
- KPI cards com `bg-white`/`bg-slate-50` hardcoded → **dark mode quebrado** (ver `dark-schedules.png`).
- Cor de destaque de horário usa hex literal (`text-[#005ab4]`, `bg-[#0873df]`) em vez de token `--primary`.
- Densidade alta: muita informação por linha; pode intimidar (mas é o coração operacional, então aceitável).

**Modais desta página:**
- Exceção: ![](./audit-screenshots/modal-exception.png)
- Atraso: ![](./audit-screenshots/modal-delay.png)

#### `/admin/schedules/exceptions`

**Status:** não existe como rota — implementado como **modal** (`ExceptionModal`, modo cancelar/reagendar) dentro de `/admin/schedules`.
**Observação:** decisão de produto coerente. O `api-spec` trata exceções como `POST /api/admin/schedules-exceptions` (sub-recurso de um schedule), não como página. Manter como modal é adequado; não é um gap.

#### `/admin/schedules/temporary`

**Status:** não existe como rota — implementado como **modal** (`ExceptionModal` em modo `temporary`, acionado por "Serviço extra") + linhas `TemporaryScheduleRow` na própria seção da rota.
**Observação:** idem acima. Adequado como modal/linha inline.

#### `/admin/cities` (Cidades)

**Status:** **placeholder** — nenhuma funcionalidade.
**Arquivo:** `src/pages/app-portal/admin/cities.tsx` → `SectionPlaceholder`
**Endpoints previstos:** `GET/POST/PUT/DELETE /api/admin/cities` (`api-spec.md §3.6`)
**Screenshot:** ![](./audit-screenshots/admin-cities-placeholder.png)

**O que a página tem:** um `<h1>Cidades</h1>` e a frase "Area de CRUD de cidades para administradores. Contexto atual: Administrador." Nada mais.

**Problemas identificados:**
- Página inteiramente vazia — grande área em branco, sem sequer um empty state ilustrado ou "em breve".
- `api-spec` já define CRUD completo (incl. regra `CITY_IN_USE` no delete) sem nenhuma UI.

#### `/admin/cooperatives` (Cooperativas)

**Status:** **placeholder**
**Arquivo:** `src/pages/app-portal/admin/cooperatives.tsx` → `SectionPlaceholder`
**Endpoints previstos:** `GET/POST/PUT/DELETE /api/admin/cooperatives` (`api-spec.md §3.5`)
**Screenshot:** ![](./audit-screenshots/admin-cooperatives-placeholder.png)

**O que a página tem:** título "Cooperativas" + "CRUD completo das cooperativas cadastradas." Nada mais.

**Problemas identificados:** idem cidades. Existe até um lado público de cooperativas (`/cooperatives`) já reformado, mas o admin não tem CRUD.

#### `/admin/delays` (Atrasos)

**Status:** **placeholder**
**Arquivo:** `src/pages/app-portal/admin/delays.tsx` → `SectionPlaceholder`
**Endpoints previstos:** `GET/POST /api/admin/delays` (`api-spec.md §3.7`)
**Screenshot:** ![](./audit-screenshots/admin-delays-placeholder.png)

**O que a página tem:** título "Atrasos" + "Painel de visualizacao de atrasos reportados." Nada mais.

**Problemas identificados:**
- É a maior contradição do painel: o Dashboard **mostra** atrasos e tem botão "Ver atrasos", os Horários **registram** atrasos (DelayModal), mas a página que deveria **listar/filtrar** atrasos está vazia.
- `api-spec.md §3.7` especifica colunas (schedule, minutos, severidade, motivo, reportado por, data) e filtros (rota, schedule, severidade, intervalo de datas) — nada implementado.

---

## 3. Análise transversal

### 3.1 Navegação e layout

- **Menu lateral:** `AppPortalAside` (`src/pages/app-portal/app-portal-aside.tsx`) é consistente entre todas as páginas. Renderiza dois grupos ("Menu Principal", "Dados de Transporte") a partir de `getAppPortalNavigationGroups(role)`, com item ativo destacado (`bg-primary/12 border-primary/40`). Header do menu com logo + "Painel de operações"; rodapé com card do usuário + botão "Sair". Boa base.
- **Breadcrumb:** existe apenas como texto no header (`Portal > {página}`), montado em `AppPortalLayout` (`breadcrumb = 'Portal > ' + pageTitle`). **Não é clicável** e tem só um nível — não reflete hierarquia real (ex.: Horários > Rota R-204). Ver `AppPortalHeader`.
- **Header/topbar:** `AppPortalHeader` é consistente — botão de menu mobile, breadcrumb + título, badge da role ("Administrador") e dropdown de avatar (Meu perfil / Sair). Altura fixa `h-20`, sticky, com backdrop blur.
- **Responsivo:** funciona. Em desktop (≥lg) a sidebar fica fixa (`w-64`); abaixo disso vira um `Sheet` acionado pelo hambúrguer (ver `mobile-sidebar.png`). As páginas de dados colapsam de grid 3-col para 1-col e, em Horários, as linhas ganham uma segunda linha para dias+status. Mobile geral bem tratado (ver `mobile-dashboard.png`, `mobile-users.png`).

**Screenshots:** ![](./audit-screenshots/mobile-dashboard.png) ![](./audit-screenshots/mobile-users.png) ![](./audit-screenshots/mobile-sidebar.png)

### 3.2 Padrões visuais

- **Cores:** convivem três abordagens. (a) Tokens semânticos (`bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`) — usados na estrutura. (b) Escalas Tailwind hardcoded para status (`emerald`/`amber`/`slate`/`sky`/`indigo`/`rose`) — usadas em KPIs, badges e cards. (c) **Hex literais** em Horários (`#005ab4`, `#0873df`). A (b) é aceitável quando semântica (emerald=ativo, amber=suspenso, slate=inativo, alinhado ao CLAUDE.md), mas o Dashboard extrapola para 6 cores decorativas sem semântica.
- **Tipografia:** usa tokens de cor (`text-foreground`/`text-muted-foreground`), mas tamanhos são hardcoded ad-hoc por tela (`text-2xl`, `text-3xl`, `text-3xl font-extrabold`, `text-[11px]`, `text-[10px]`). Não há escala tipográfica compartilhada. Os horários usam `font-bold` grande mas **não** `font-mono` (Fira Code), apesar da convenção do projeto para códigos/horários.
- **Espaçamentos:** o container de página é consistente (`space-y-6`, `p-4 md:p-6`), mas paddings internos de card variam (`p-4`, `p-5`, `px-4 py-3`, `px-3 py-2.5`). Sem ritmo vertical padronizado.
- **Dark mode:** **inconsistente**. O Dashboard trata dark com `dark:` em quase tudo (ver `dark-dashboard.png` — correto). Já Usuários/Rotas/Horários pintam KPI cards e barras de filtro com `bg-white`/`bg-slate-50`/`bg-emerald-50` **sem** variante `dark:` → cartões claros sobre fundo escuro (ver `dark-schedules.png`). É o defeito visual nº 1 do painel.
- **Estética geral:** parece um "dashboard bootstrap-ish" competente, não um produto com identidade (Linear/Notion). Bordas coloridas + cards arredondados + `shadow-xs` ocasional. Falta uma decisão estética unificada; hoje cada página tem seu próprio dialeto visual.

**Screenshots dark:** ![](./audit-screenshots/dark-dashboard.png) ![](./audit-screenshots/dark-schedules.png)

### 3.3 Padrões de dados

- **Tabelas vs cards:** não há um `DataTable` unificado. Dashboard = `<table>` HTML cru; Usuários/Rotas = grid de cards; Horários = linhas customizadas expansíveis. Três padrões para "mostrar uma lista".
- **Paginação:** três estratégias. Usuários = paginação numérica real via mock API. Rotas = `slice` client-side. Horários = botão "Carregar mais rotas" sem handler. Dashboard = sem paginação.
- **Sort:** **inexistente** em qualquer página. Nenhuma coluna/card é ordenável.
- **Filtros:** Usuários e Rotas filtram de fato (busca + status). Horários filtra por busca/status mas **ignora** cooperativa e data. Nenhum filtro por role em Usuários.
- **Formulários:** os modais de Usuários usam React Hook Form + Zod (`user-form.tsx`, schema em `src/lib/schemas/`). Os modais de Horários (`DelayModal`, `ExceptionModal`) usam `useState` local + validação manual (`canSubmit`) e `// TODO: submit to API`. Dois padrões de formulário.
- **Empty states:** existem, mas reimplementados inline em cada página (`<div>` com ícone + texto + botão "Limpar filtros"). O componente `EmptyState` (`src/components/empty-state.tsx`) do lado público **não é usado**.
- **Loading states:** spinner manual inline (`<div className="animate-spin …" />`) só em Usuários; as demais páginas operam sobre dados síncronos e não têm loading. Existe `skeleton.tsx` mas o admin não o usa.

### 3.4 Padrões de ação

- **Ações destrutivas:** só Usuários trata bem — desativar/reativar abre um `Dialog` de confirmação com nome do usuário e cor de risco (rose). **Não existe exclusão** ("delete") em nenhuma tela, embora o `api-spec` defina soft-delete para todas as entidades. Rotas "Desativar" é botão morto.
- **Bulk actions:** inexistentes. Nenhuma seleção múltipla em nenhuma listagem.
- **Ações rápidas:** Horários tem menu `MoreHorizontal` consistente (`ScheduleActionsMenu`); Usuários usa botões-ícone em linha; Rotas usa botões com rótulo. Três padrões de "ações por item".
- **Feedback pós-ação:** Usuários usa `toast` (sonner) + `invalidateQueries` (refetch) — o padrão certo. As demais ações ou não existem ou fecham o modal com `// TODO` sem feedback.

### 3.5 Consistência com o lado público

- **Componentes reutilizados:** todos os primitivos `components/ui/*` (Button, Badge, Dialog, Input, Toggle, Popover, DropdownMenu, Sheet, Avatar…), o `CooperativePicker` (usado em Horários e no público) e o utilitário `cn()`. A fundação é compartilhada.
- **Componentes duplicados / não reaproveitados:** `EmptyState` existe no público mas o admin reimplementa empty states à mão; lógica de badge de status é reescrita em 4 lugares; cards de KPI têm duas implementações diferentes.
- **Estética:** o admin **parece do mesmo produto** na fundação (fonte, botões arredondados, cores base), mas o Dashboard destoa (arco-íris + tabelas cruas). Com a reforma, dá para elevar o admin ao mesmo nível de polimento do público.

---

## 4. Componentes reutilizados vs duplicados

#### StatusBadge / badges de status

**Localização:** `admin/dashboard.tsx` (`SeverityBadge`, `StatusBadge`), `users-page.tsx` (`STATUS_META` + JSX inline), `routes-page.tsx` (`STATUS_META`), `schedules-page.tsx` (`OP_STATUS_META` + `OperationalBadge`), `delay-modal.tsx` (`getSeverity`).
**Duplicação:** sim — 5 implementações de "badge colorido por status/severidade".
**Status:** consolidar. Candidato nº 1 a virar um `<StatusBadge tone=… />` único, dirigido por um mapa de tokens.
**Observação:** as cores até coincidem (emerald/amber/red/slate), o que reforça que é o mesmo conceito repetido.

#### Cards de KPI

**Localização:** `admin/dashboard.tsx` (KPI inline com ícone colorido + trend), `users-page.tsx` e `routes-page.tsx` (`KPI_CONFIG` + `.map`), `schedules-page.tsx` (3 `<article>` escritos à mão).
**Duplicação:** sim — Usuários e Rotas quase compartilham o padrão `KPI_CONFIG`; Dashboard e Horários fazem à parte.
**Status:** consolidar em `<KpiCard>` (valor, label, descrição, ícone, tom, tendência opcional). Reduz código e resolve o dark mode de uma vez.

#### Barra de busca + filtros

**Localização:** bloco quase idêntico em `users-page.tsx`, `routes-page.tsx`, `schedules-page.tsx` (InputGroup + botão Buscar + Toggles de status + "Limpar").
**Duplicação:** sim — mesma estrutura copiada 3×, com pequenas variações.
**Status:** extrair `<FilterBar>` / `<SearchInput>`. Bônus: o `CooperativePicker` já é reaproveitável e poderia servir também às Rotas.

#### Empty state

**Localização:** `<div>` inline em `users-page.tsx`, `routes-page.tsx`, `schedules-page.tsx`; componente pronto em `src/components/empty-state.tsx` (não usado no admin).
**Duplicação:** sim, e desnecessária — já existe o componente.
**Status:** substituir os inlines por `EmptyState`.

#### DataTable

**Localização:** não existe. Dashboard usa `<table>` cru; demais usam cards.
**Duplicação:** n/a (ausência).
**Status:** oportunidade — um `<DataTable>` (com sort/paginação/estado vazio) unificaria Dashboard, futura Cidades, Cooperativas, Delays e Usuários (se migrar de card para tabela).

#### SectionPlaceholder

**Localização:** `src/pages/app-portal/section-placeholder.tsx`
**Duplicação:** não.
**Status:** apropriado como stub temporário, mas visualmente pobre. Na reforma, ou vira um empty state ilustrado decente, ou é substituído pelas páginas reais.

#### AppPortalAside / AppPortalHeader / AppPortalLayout

**Localização:** `src/pages/app-portal/app-portal-{aside,header}.tsx`, `src/pages/_layouts/app-portal.tsx`
**Duplicação:** não.
**Status:** específicos do portal e apropriados. São a espinha dorsal a refinar (breadcrumb clicável, densidade da sidebar) — mantêm-se.

#### ScheduleActionsMenu / modais de Horários

**Localização:** `src/pages/app-portal/schedules/{schedule-actions-menu,delay-modal,exception-modal,schedule-status-modal}.tsx`
**Duplicação:** não.
**Status:** apropriados ao contexto operacional. `ExceptionModal` já é reaproveitado em dois modos (schedule-level e route-level) — bom exemplo de reuso. Manter; só padronizar formulário (migrar para RHF+Zod como os de Usuários).

#### UserForm + modais de Usuários

**Localização:** `src/pages/app-portal/users/{user-form,add-user-modal,edit-user-modal,view-user-modal,driver-schedules-modal}.tsx`
**Duplicação:** não (add/edit compartilham `UserForm`).
**Status:** apropriado e bem feito — é a **referência interna** de como um CRUD admin deveria ser (RHF+Zod, toast, confirmação, refetch). Serve de molde para Cidades/Cooperativas.

---

## 5. Gaps com a especificação

Comparação entre o que `api-spec.md`/PRDs especificam e o que existe. Prioridade: **alta** (quebra fluxo de uso), **média** (dor contornável), **baixa** (nice-to-have).

#### Página `/admin/delays` — inexistente

**Especificação:** `api-spec.md §3.7` define `GET /api/admin/delays` com colunas (schedule, minutos, severidade, motivo, reportado por, data) e filtros (rota, schedule, severidade, `date_from`/`date_to`).
**Estado atual:** placeholder vazio.
**Impacto:** admin não consegue listar/investigar atrasos — justamente o que o Dashboard promete com "Ver atrasos".
**Prioridade:** alta.

#### Página `/admin/cities` — CRUD inexistente

**Especificação:** `api-spec.md §3.6` — CRUD completo, unicidade `(name, state)`, erro `CITY_IN_USE` no delete.
**Estado atual:** placeholder.
**Impacto:** não há como cadastrar cidades, que são pré-requisito de rotas.
**Prioridade:** alta (bloqueia cadastro de rotas do zero).

#### Página `/admin/cooperatives` — CRUD inexistente

**Especificação:** `api-spec.md §3.5` — CRUD completo (name, phone, logo, site, brand_color).
**Estado atual:** placeholder.
**Impacto:** cooperativas são o topo da hierarquia de dados; sem cadastro admin, todo o resto fica preso a seed.
**Prioridade:** alta.

#### `/admin/users` — filtro por role

**Especificação:** PRD de usuários e `api-spec.md §3.2` preveem filtro por `role` (admin/cooperative/driver) e por `cooperative_id`.
**Estado atual:** só busca textual + toggle de status. `selectedCooperative` existe no código mas sem controle na UI.
**Impacto:** para achar "todos os motoristas da cooperativa X", é preciso rolar/adivinhar a busca.
**Prioridade:** alta.

#### `/admin/schedules` — filtros de cooperativa e data não aplicados

**Especificação:** `api-spec.md §3.3` prevê filtros `cooperative_id`, `day_of_week` e `date`.
**Estado atual:** UI de Cooperativa e Data existe, mas os valores **não** entram na filtragem (bug — ver §6). Não há filtro por dia da semana.
**Impacto:** filtros presentes que enganam o usuário (parecem funcionar e não funcionam).
**Prioridade:** alta.

#### Dashboard — sem gráfico e sem fonte de dados

**Especificação:** briefing pede "gráfico de atrasos por semana"; `api-spec.md §3.8` define `GET /api/admin/dashboard/stats`.
**Estado atual:** só KPIs + tabelas, tudo hardcoded no componente.
**Impacto:** médio — a informação existe em tabela, falta a leitura de tendência.
**Prioridade:** média.

#### CRUD de Rotas — criar/editar/desativar

**Especificação:** `api-spec.md §3.4` — `POST/PUT/PATCH .../status/DELETE`, com stops, active_days, price, driver.
**Estado atual:** listagem visual sobre array hardcoded; botões Nova/Editar/Desativar sem handler; sem formulário.
**Impacto:** a rota é a entidade central; hoje é só leitura fake.
**Prioridade:** alta.

#### Criação de Horários / Serviços extras — sem persistência

**Especificação:** `POST /api/admin/schedules`, `POST /api/admin/schedules-temporary`, `POST /api/admin/schedules-exceptions`.
**Estado atual:** modais existem e validam, mas terminam em `// TODO: submit to API`; "Novo Horário" sem handler.
**Impacto:** médio-alto — a UI está pronta, falta o wiring.
**Prioridade:** média.

#### Exclusão (soft-delete) — ausente em toda parte

**Especificação:** `DELETE` (soft-delete) para users, cities, cooperatives, routes.
**Estado atual:** só "desativar" em Usuários; nenhuma UI de exclusão.
**Impacto:** baixo-médio (desativar cobre muitos casos), mas diverge da spec.
**Prioridade:** baixa.

#### Ordenação de listagens

**Especificação:** implícita no uso de tabelas paginadas.
**Estado atual:** nenhum sort.
**Impacto:** baixo em volume atual, cresce com dados reais.
**Prioridade:** baixa.

---

## 6. Problemas de UX específicos

Ordenados por impacto.

#### Filtros de Cooperativa e Data não filtram (Horários)

**Página:** `/admin/schedules`
**Descrição:** `cooperativeFilter` e `dateFilter` têm estado e UI, mas o `useMemo` de `filteredRoutes` depende só de `[committedQuery, statusFilters, onlyExceptions]`. Selecionar cooperativa ou data não muda a lista.
**Impacto:** alto — filtro que finge funcionar corrói confiança.
**Recomendação:** aplicar ambos na filtragem (ou desabilitar até implementar).

#### Botões mortos em Rotas

**Página:** `/admin/routes`
**Descrição:** "Nova rota", "Editar" e "Desativar/Reativar" não têm `onClick`. Clicar não faz nada.
**Impacto:** alto — a página aparenta ser um CRUD, mas é só leitura.
**Recomendação:** implementar as ações ou, no mínimo, estado desabilitado/"em breve".

#### Página de Atrasos vazia apesar de referências por todo lado

**Página:** `/admin/delays`
**Descrição:** Dashboard e Horários apontam para "atrasos", mas a página é um placeholder.
**Impacto:** alto — link/ação que leva ao vazio.
**Recomendação:** implementar a listagem de atrasos (§5) e conectar o botão "Ver atrasos" do Dashboard.

#### Dark mode quebrado nas páginas de dados

**Página:** `/admin/users`, `/admin/routes`, `/admin/schedules`
**Descrição:** KPI cards e barras de filtro com `bg-white`/`bg-slate-50`/`bg-*-50` sem variante `dark:` → cartões claros no tema escuro (ver `dark-schedules.png`).
**Impacto:** médio-alto — visualmente quebrado se o usuário usar dark.
**Recomendação:** trocar cores hardcoded por tokens (`bg-card`, `bg-muted`) e/ou adicionar variantes `dark:` via um `<KpiCard>` central.

#### "Novo Horário" e "Carregar mais rotas" sem ação (Horários)

**Página:** `/admin/schedules`
**Descrição:** ambos os botões não têm handler.
**Impacto:** médio.
**Recomendação:** abrir modal de criação / paginar de fato.

#### Ausência de filtro por role e por cooperativa (Usuários)

**Página:** `/admin/users`
**Descrição:** sem como filtrar por role ou cooperativa na UI.
**Impacto:** médio — piora com volume.
**Recomendação:** adicionar dropdowns de role e cooperativa (o backend/mocks já esperam).

#### Breadcrumb raso e não clicável

**Página:** todas
**Descrição:** breadcrumb é texto fixo `Portal > {página}`, um nível, sem link.
**Impacto:** médio — navegação de contexto pobre (ex.: dentro de uma rota específica).
**Recomendação:** breadcrumb hierárquico e clicável.

#### Dashboard com dados fixos e botões decorativos

**Página:** `/admin`
**Descrição:** KPIs/tabelas hardcoded; "Ver atrasos/incidentes/todos/Abrir/Detalhes" sem navegação.
**Impacto:** médio — parece funcional, não é.
**Recomendação:** ligar ao mock layer e às páginas destino.

#### Empty/loading states reimplementados

**Página:** Usuários/Rotas/Horários
**Descrição:** empty states inline; loading só em Usuários; `EmptyState`/`skeleton` existentes ignorados.
**Impacto:** baixo-médio — inconsistência e retrabalho.
**Recomendação:** padronizar com os componentes existentes.

#### Dados hardcoded fora do mock layer

**Página:** Dashboard (`adminKpis`/`delayRows`/`departureRows`), Rotas (`ROUTES`)
**Descrição:** dados no `.tsx` em vez de `src/lib/data/mock-*`.
**Impacto:** baixo agora, alto na hora de plugar a API.
**Recomendação:** mover para o mock layer e consumir via TanStack Query (como Usuários).

#### Horários não usam fonte mono

**Página:** `/admin/schedules`
**Descrição:** horários (`06:30`) em `font-bold` comum, não `font-mono` (Fira Code), contrariando convenção.
**Impacto:** baixo — estético/alinhamento tabular.
**Recomendação:** aplicar `font-mono`/`tabular-nums` a horários e códigos.

#### Cores hex literais em vez de token

**Página:** `/admin/schedules`
**Descrição:** `#005ab4`, `#0873df` hardcoded.
**Impacto:** baixo.
**Recomendação:** usar `--primary`/token de destaque.

---

## 7. Recomendações de referência e estética

A auditoria mostra um painel de **baixo volume de dados por página**, **single-user** (dev/seed, um admin mock), **orientado a CRUD** e com **excesso de dialetos visuais** (arco-íris no Dashboard, três formas de listar, dark mode inconsistente). As referências abaixo atacam exatamente esses pontos.

#### 1. Linear — sistema visual e navegação

**Por que faz sentido:** volume baixo por tela e público single-user pedem densidade calma e navegação por teclado, não um "cockpit" denso. Linear é a referência de painel B2B enxuto.
**Importar:** paleta neutra + **uma** cor de destaque (resolve o arco-íris do Dashboard); tipografia com escala clara; sidebar contida; breadcrumb/contexto discretos; estados vazios elegantes; dark mode de primeira classe (resolve nosso defeito nº 1).
**Evitar:** atalhos/comando-K e microinterações avançadas agora — over-engineering para o estágio atual.

#### 2. Airtable — grades de dados (CRUDs e listagens)

**Por que faz sentido:** o painel é essencialmente listas de entidades (usuários, rotas, cidades, atrasos). Airtable é a melhor referência de tabela com filtro/sort/estado vazio bem resolvidos.
**Importar:** um `<DataTable>` único com header fixo, sort por coluna, filtros combináveis visíveis e paginação consistente — unificando Dashboard/Cidades/Cooperativas/Atrasos e, opcionalmente, Usuários.
**Evitar:** edição inline de célula e views salvas — complexidade desnecessária por ora.

#### 3. Supabase Studio — CRUD administrativo pragmático

**Por que faz sentido:** é um admin real (também sobre Postgres, como o `database.md` sugere) que equilibra tabelas + formulários em modal/drawer sem virar enterprise pesado — exatamente o tom que Usuários já ensaia bem.
**Importar:** padrão formulário-em-drawer/modal com validação inline e confirmação destrutiva (generalizar o que `UserForm` já faz); layout de detalhe de entidade.
**Evitar:** SQL editor / features de plataforma — fora de escopo.

**Síntese:** Linear para a **casca** (layout, cor, tipografia, dark, navegação), Airtable para as **listas**, Supabase para os **CRUDs/formulários**. Evitar dashboards corporativos densos (SAP/estilo "admin template") e sombras pesadas — o projeto é flat por convenção (CLAUDE.md).

---

## 8. Proposta de estrutura para a Fase 5

Sequência: **fundamentos primeiro** (casca + primitivos + dark mode), depois **do mais simples ao mais complexo** para validar o padrão antes de aplicá-lo nas telas difíceis. Esforço relativo: P (pequeno), M (médio), G (grande).

### PR 1 — Fundamentos da nova estética admin [G]

Tokens/escala admin (tipografia, espaçamento, uma cor de destaque), correção estrutural do **dark mode** (remover `bg-white`/`bg-*-50` hardcoded), refino de `AppPortalLayout`/`Aside`/`Header` (sidebar estilo Linear, breadcrumb clicável e hierárquico). Sem tocar em páginas específicas.
*Entrega a base visual e destrava o dark mode para todo o painel.*

### PR 2 — Kit de primitivos admin [G]

`<KpiCard>`, `<StatusBadge>`, `<FilterBar>`/`<SearchInput>`, `<DataTable>` (sort + paginação + estado vazio via `EmptyState`), `<PageHeader>`. Consolida as 5 duplicações da §4. Aplica-se onde já há uso trivial, sem reescrever regras de negócio.
*Sem esse kit, cada página seguinte repetiria o retrabalho.*

### PR 3 — Dashboard [M]

Refaz `/admin/dashboard` sobre os novos primitivos: KPIs hierarquizados (uma cor de destaque), um gráfico discreto de atrasos por semana, tabelas via `<DataTable>`, dados vindos do mock layer, e botões que **navegam** (Ver atrasos → `/admin/delays`).

### PR 4 — CRUDs simples: Cidades + Cooperativas [M]

Implementa os dois placeholders usando o padrão de `UserForm` (RHF+Zod, modal/drawer, toast, confirmação) + `<DataTable>`. São os CRUDs menos complexos — ideais para validar o novo padrão end-to-end antes das telas pesadas.

### PR 5 — Atrasos [M]

Implementa `/admin/delays` conforme `api-spec.md §3.7`: `<DataTable>` com colunas e filtros (rota, severidade, intervalo de datas), conectando o "Ver atrasos" do Dashboard e o `DelayModal` dos Horários.

### PR 6 — Usuários (evolução) [M]

Adiciona filtro por role e por cooperativa; migra empty/loading states para os componentes padrão; mantém o que já é bom. Pequeno em risco, alto em valor (fecha gaps de §5).

### PR 7 — Rotas (CRUD real) [G]

Move `ROUTES` para o mock layer; implementa criar/editar (com stops, active_days, price, driver) e ativar/desativar com confirmação; liga os botões hoje mortos. Entidade central — merece PR próprio.

### PR 8 — Horários (wiring + correções) [G]

Corrige os filtros de cooperativa/data (bug da §6); liga "Novo Horário" e "Carregar mais rotas"; migra os modais para RHF+Zod; persiste exceções/serviços extras no mock layer; aplica `font-mono` e tokens de cor.

**Resumo da ordem:** casca (PR1) → primitivos (PR2) → Dashboard (PR3) → CRUDs simples (PR4) → Atrasos (PR5) → Usuários (PR6) → Rotas (PR7) → Horários (PR8). Cada PR é entregável e testável isoladamente; PR1 e PR2 são pré-requisito dos demais.
