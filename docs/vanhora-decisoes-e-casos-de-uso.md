# VanHora — Especificação de Decisões e Casos de Uso

> **Versão:** 1.0.0 — 2026-10-08 (versionamento via Git)
> **Autor:** Kaik (frakaik2018@gmail.com)
> **Status:** Documento vivo — fonte canônica de decisões de produto
> **Propósito:** Insumo definitivo para geração de PRDs e tickets de implementação. **Anti-alucinação**: cada caso de uso tem escopo negativo explícito. Qualquer feature que não esteja descrita aqui ou nos documentos canônicos (`VanHora Especificação.md`, `database.md`, `api-spec.md`, `design_system.md`, `guia_inspiracao_vanhora.md`) **não deve ser implementada sem decisão formal registrada neste arquivo**.
> **Documentos complementares:** `plano-melhorias-app-portal.md` (histórico de PRs do front, PR1-PR13 + PR6 concluídos), `auditoria-completude-2026-09.md` (auditoria de completude por persona), `mapeamento-admin-logistica-2026-09.md` (mapeamento de workflows reais).

---

## Índice

1. [Posicionamento e Princípios](#1-posicionamento-e-princípios)
2. [Estado atual do Produto](#2-estado-atual-do-produto)
3. [Decisões Consolidadas](#3-decisões-consolidadas)
4. [Visão por Persona](#4-visão-por-persona)
5. [Casos de Uso Aprovados — Detalhamento](#5-casos-de-uso-aprovados--detalhamento)
   - 5.1 [Público / Passageiro](#51-público--passageiro)
   - 5.2 [Admin Geral](#52-admin-geral)
   - 5.3 [Cooperativa](#53-cooperativa)
   - 5.4 [Motorista](#54-motorista)
   - 5.5 [Transversais](#55-transversais)
6. [Escopo Negativo Consolidado (Out of Scope)](#6-escopo-negativo-consolidado-out-of-scope)
7. [Mudanças de Schema Aprovadas](#7-mudanças-de-schema-aprovadas)
8. [Roadmap em Ondas](#8-roadmap-em-ondas)
9. [Convenções Técnicas Herdadas (PR1-PR13)](#9-convenções-técnicas-herdadas-pr1-pr13)
10. [Referências](#10-referências)

---

## 1. Posicionamento e Princípios

### 1.1 Definição do Produto

**VanHora é um app de consulta pública + backoffice operacional simples e útil** para cooperativas de vans intermunicipais do interior do Ceará. A plataforma visa controle operacional para três perfis internos (motorista, cooperativa, admin geral) e consulta de horários para o passageiro público.

**O VanHora NÃO é:**
- ERP completo de cooperativa (não cobre quadro social, assembleia, atas, cotas — Lei 5.764/71)
- Plataforma de venda de bilhetes (não emite CT-e, não cobra passagem, não faz checkout)
- Sistema de gestão de frota (não cadastra veículos, não controla manutenção, não registra combustível)
- Sistema de rastreamento (não usa GPS, não mostra mapa, não calcula ETA em tempo real)
- Canal de comunicação direta motorista↔passageiro (comunicação externa fica no WhatsApp)

### 1.2 Princípios Inegociáveis

Herdados de `plano-melhorias-app-portal.md` e consolidados nos PRs 1-13:

| Princípio | Aplicação prática |
|-----------|-------------------|
| **Simplicidade sobre completude** | Preferir workaround degradado (ex: A15 usa `schedules_exceptions`) a criar entidade nova. Features sem gatilho real ficam no backlog. |
| **Contexto regional respeitado** | Passageiro leigo em 3G/4G instável, cooperativas pequenas (7–30 motoristas), motoristas em van física. Nenhuma feature pode assumir smartphone premium ou banda larga estável. |
| **Sem invenção de dado** | Se o schema não tem, a UI não mostra. Sem placeholders de features futuras ("Mapa em breve"). |
| **Tempo relativo primeiro** | Countdown ("Em 8 min") tem prioridade sobre horário absoluto. |
| **Cor + ícone + texto em todo status** | Nunca comunicar status só por cor (acessibilidade). |
| **Alvos de toque ≥ 44×44px** | Em todas as ações primárias. |
| **Flat design** | Sem `shadow-*` em cards (exceção: elementos flutuantes). `border-l-<color>` para status. |

### 1.3 Público-Alvo Real (não hipotético)

- **Programa Cid Gomes (2026):** 740 vans, 164 linhas, 27 cooperativas licitadas no interior do Ceará ([DETRAN-CE](https://www.detran.ce.gov.br/governador-cid-gomes-assina-ordem-de-servico-para-operacao-das-vans/)).
- **Cooperativas-alvo:** pequenas (7–30 motoristas, ~27 vans/coop), informais, sem equipe de TI dedicada.
- **Motoristas-alvo:** 1 van por motorista (titular), reportam da rua em rede instável.
- **Passageiros-alvo:** público leigo, sem cadastro, acessa pelo celular na rua sob sol forte.

---

## 2. Estado atual do Produto

### 2.1 Front-end (PR1-PR13 + PR6 concluídos)

| PR | Entrega |
|----|---------|
| PR1 | Wizard de atraso adaptativo (`quick`/`wizard`), `MinuteStepper`, `ChoiceChips`, `SelectableCard`, `StepIndicator` |
| PR2 | `SeverityBadge` (fonte única via `severityFromMinutes`), helpers de formatação, `useFormDialogState` |
| PR3a | Extração dos componentes-base + `StatusChip` novo |
| PR3b | Migração `AdminStatusBadge` → `StatusChip` (`SCHEDULE_STATUS_META`, `ROUTE_STATUS_META`, `USER_STATUS_META`) |
| PR4 | Home do motorista (`CurrentTripCard`, `TripProgress`, `QuickActions`) + `/meus-horarios` com passageiros |
| PR5 | Painel operacional da cooperativa (`OperationsBoard` "Agora", `LiveUpdatedAt`, 3 gráficos `recharts`) |
| PR7 | Infra de tabela admin (`AdminTable`, `AdminPagination`, `useTableFilters` sobre `nuqs`, `SearchableSelect`) |
| PR8 | Pickers de domínio (`CooperativePicker` id-based, `WeekdayPicker` com presets) |
| PR9 | Cooperativas admin master-detail (abas Geral/Rotas/Motoristas/Atrasos) |
| PR10 | Rotas admin (toggle Grid/Tabela, duplicar rota, deep-link `?highlight=`, `route-form` id-based) |
| PR11 | Horários admin (filtros URL-sync, badge exceções com popover, duplicar horário, `AdminSchedule` com `routeId`/`cooperativeId`) |
| PR12 | Cidades admin (padronização infra, `AdminConfirmDialog` bloqueado para cidade vinculada) |
| PR13 | Polimento Parte 2 (consistência, acessibilidade, `components-preview` como documentação viva) |
| PR6 | Polimento Parte 1 (aplicação dos padrões consolidados no driver/coop/wizard) |

### 2.2 Backend

**Status:** não iniciado. Especificação em `api-spec.md`. Mocks no front implementam o contrato esperado.

### 2.3 Cobertura por Persona (síntese da auditoria 2026-09)

| Persona | Status |
|---------|--------|
| Público (passageiro) | Cumpre com ressalvas (PR-A banner de cancelamento + PR-B tabs Partindo Agora/Próximos/Decorridos são condições fracas antes do backend) |
| Admin | Cumpre. 7 páginas prometidas no PRD entregues |
| Cooperativa | Cumpre com ressalva de higiene (`cooperative_id` não filtrado em páginas compartilhadas no mock — backend enforça via JWT) |
| Motorista | Cumpre. 0 TODOs no código |

---

## 3. Decisões Consolidadas

Histórico de decisões formais tomadas em conversas prévias, agora canônicas.

### 3.1 Decisões sobre Posicionamento

| ID | Decisão | Data | Status |
|----|---------|------|--------|
| D1 | VanHora é app de consulta + backoffice operacional simples e útil, **não** ERP completo | 2026-09-28 | Firme |
| D2 | Sem venda de bilhete, sem cobrança, sem CT-e | 2026-09-28 | Firme |
| D3 | Sem GPS, sem mapa, sem ocupação em tempo real | PR4 em diante | Firme |
| D4 | **Passageiros/ocupação** é dado aceito no mock do driver (tabela `/meus-horarios`, sumário) — origem a definir quando backend chegar | 2026-08 (PR4) | Aceito (ver §3.5) |
| D5 | Cada cooperativa opera exclusivamente sua frota (van pertence à coop) | 2026-09-28 | Firme |
| D6 | Comunicação com passageiros/motoristas fica no próprio site (não via push, não WhatsApp integrado) | 2026-09-28 | Firme |

### 3.2 Decisões sobre Escopo Agora (In-Scope)

| ID | Decisão | Origem | Status |
|----|---------|--------|--------|
| D7 | Incluir A1, A2, A3, A4, A6, A7, A8, A9, A10, A13, A16 (mínimo), A17, A18 | §5 deste doc | Aprovado |
| D8 | Incluir F1 (aviso cooperativa→passageiro), F2 (impedimento parcial com hora), F4 (`?mine` admin) | 2026-10-08 | Aprovado |
| D9 | Incluir 4.5 (`operational_events` **sem upload de imagem**) — resolve A14 (check-in) e DA3 (incidentes ≠ atraso) | Q3 2026-09-28 | Aprovado |
| D10 | Aceitar aditivos de schema listados no §7 | 2026-10-08 | Aprovado |

### 3.3 Decisões sobre Escopo Negativo (Out-of-Scope)

| ID | Decisão | Origem | Status |
|----|---------|--------|--------|
| D11 | **NÃO** implementar: A5 (transferir rotas), A11 (comparação mês-mês), A12 (ordenação board) | 2026-10-08 | Firme |
| D12 | **NÃO** implementar: 4.1 (frota), 4.2 (ausência formal — usar A15 degradado), 4.4 (manutenção), 4.6 (combustível), 4.8 (rastreamento passivo) | 2026-10-08 | Firme |
| D13 | **NÃO** implementar: 5.2 (docs regulatórios), 5.3 (renovação ARCE), 5.4 (assembleia/cooperados), 5.5 (prestação de contas) | 2026-10-08 | Firme |
| D14 | **NÃO** implementar: F3 (confirmação de transferência de rotas — depende de A5), F5 (timezone/horário de verão — Brasil não usa), F6 (KPI "exceções abertas por coop" no dashboard admin) | 2026-10-08 | Firme |
| D15 | **NÃO** implementar: 4.3 (escala rotativa — impactaria `routes.drive_id`), 4.7 (troca de turno — depende de notificação), 5.1 (auditoria completa — A6 cobre), 5.6 (broadcast completo — A16 cobre) | Julgamento 2026-10-08 | Firme (gatilhos futuros podem reverter) |
| D16 | **NÃO** implementar: DA2 (avaliação para motorista) — pode gerar fricção interna cooperativa estilo rideshare | 2026-09-21 | Firme |
| D17 | **NÃO** implementar: PA3 (favorito com apelido), PA4 (compartilhar via WhatsApp), P5 (PWA/service worker/cache offline) | 2026-10-08 | Firme |

### 3.4 Decisões sobre Workaround degradado

| ID | Decisão | Base técnica |
|----|---------|--------------|
| D18 | **A14 check-in** entra via 4.5 (`operational_events` com `type='trip_started'`), não via workaround em `schedules_exceptions` | Q3 2026-09-28 |
| D19 | **A15 ausência** fica em workaround (`schedules_exceptions.type='cancelled'` + `reason` prefixado `AUSÊNCIA:<motivo>`). Entidade `driver_absences` só se gatilho de ruído em métrica aparecer | Q2 2026-09-28 |
| D20 | **F2 impedimento parcial com hora** fica junto da A15 (workaround degradado) — motorista cria N exceções no range | 2026-10-08 |

### 3.5 Dívidas Técnicas Registradas

Pendências conhecidas que **não bloqueiam o backend**, mas devem ser resolvidas quando o item relacionado for implementado:

| Dívida | Origem | Resolução prevista |
|--------|--------|-------------------|
| `routes.drive_id` → `driver_id` (typo no schema) | `api-spec.md §5` | Migration backend inicial |
| `ratings.date_ata` → `created_at` (typo) | `api-spec.md §5` | Migration backend inicial |
| Materializar `cooperatives.rating_cached` / `rating_count_cached` | `api-spec.md §5` | Trigger no backend inicial |
| `cooperatives.brand_color`, `email`, `description` ausentes no schema | `api-spec.md §5` | Migration backend inicial |
| `routes.origin_city_id`, `destination_city_id`, `description` ausentes | `api-spec.md §5` | Migration backend inicial |
| `cities.photo_url` ausente | `api-spec.md §5` | Migration backend inicial |
| **Passageiros do driver (D4):** origem do dado indefinida | PR4 | Decidir antes do backend expor esse campo: contagem manual pelo motorista, estimativa cooperativa, ou campo opcional |

### 3.6 Convenções de API (consolidadas)

- Base URL sem versionamento: `/api/*` (versionamento `/v1/` opcional via variável de ambiente)
- Autenticação JWT com `access_token` (15min) + `refresh_token` (7d com rotação)
- Paginação zero-indexed (`page=0` default, `limit=12` default), exceção para `/api/admin/users` (1-indexed)
- Filtros: strings diretas, arrays comma-separated, UUIDs validados
- IDs são **UUID v4** (nunca slugs — cirurgia pré-PR9 migrou todos os slugs de mock para UUID)
- CORS configurável; não usar `*` em produção (cookies de sessão)
- Session-based rating com `X-Session-Id` + IP para passageiro público

---

## 4. Visão por Persona

### 4.1 Público / Passageiro

**Objetivo real:** Descobrir em segundos qual é a próxima van do meu trecho, se vai sair no horário, e voltar rápido aos horários que uso sempre — em rede fraca, sem cadastro.

**Capacidades consolidadas:**
- Buscar horários por origem/destino/data
- Favoritar schedules em `localStorage` (limite 100, sem cadastro)
- Avaliar 1-5 estrelas via `session_id` + IP
- Ver detalhes de rota/cooperativa com estatísticas 30d
- Ver cancelamentos e exceções

**Casos de uso aprovados neste doc:** P1, P2, P3, P4+PA2 (unificados), PA1, F1

### 4.2 Admin Geral

**Objetivo real:** Orquestrar toda a plataforma: manter base limpa (cidades/cooperativas/usuários), monitorar operação, resolver problemas rápido.

**Capacidades consolidadas:**
- 7 páginas CRUD (Dashboard, Cidades, Cooperativas, Usuários, Rotas, Horários, Atrasos)
- Master-detail em Cooperativas (abas Geral/Rotas/Motoristas/Atrasos)
- Filtros persistentes em URL via nuqs
- Confirmação tipada em ações destrutivas

**Casos de uso aprovados neste doc:** A1, A2, A3, A4, A6, A17, A18, F4

### 4.3 Cooperativa

**Objetivo real:** Ver em tempo quase real o que roda hoje, identificar rotas com problema, manter dados em dia, entender performance para explicar aos cooperados.

**Capacidades consolidadas:**
- Dashboard operacional (board "Agora" com `refetchInterval: 30s`)
- 3 gráficos recharts (pontualidade 30d, atrasos por rota, severidade)
- CRUD escopado à própria cooperativa (via JWT no backend)
- Perfil editável + Performance Overview

**Casos de uso aprovados neste doc:** A7, A8, A9, A10, A16, F1

### 4.4 Motorista

**Objetivo real:** Saber qual minha próxima viagem, reportar um problema em segundos quando algo trava, ver meus horários da semana. Nada mais.

**Capacidades consolidadas:**
- Home com `CurrentTripCard` (sem GPS, derivado por janela de tempo)
- Wizard adaptativo `quick`/`wizard` para reportar atraso
- Severidade auto-derivada
- Minhas Rotas / Meus Horários read-only + perfil editável (nome/telefone)

**Casos de uso aprovados neste doc:** A13, A15, F2, 4.5 (incidentes ≠ atraso)

---

## 5. Casos de Uso Aprovados — Detalhamento

Cada UC segue a estrutura:

1. **Descrição e Objetivo**
2. **Regras de Negócio Inegociáveis**
3. **Guia de Implementação** (back + front + edge cases)
4. **Escopo Negativo (Anti-alucinação)**
5. **Sugestões/Conselhos de Arquitetura**

### 5.1 Público / Passageiro

#### UC-P1 — Página `/about` consome `GET /api/cities/served`

**1. Descrição e Objetivo**
Substituir a lista hardcoded de cidades atendidas na página `/about` (`about.tsx:126`) pela chamada ao endpoint `GET /api/cities/served`, já definido em `api-spec.md §2.3`. Objetivo: mostrar dado real conforme a plataforma cresce, sem reeditar código a cada cidade nova.

**2. Regras de Negócio Inegociáveis**
- Endpoint retorna cidades que possuem **pelo menos 1 rota ativa** vinculada (origem ou destino).
- Formato: `{ cities: [{ id, name, state, active_routes }], total }`.
- Se o endpoint falhar, degradar para fallback estático atual (não quebrar a página).
- Cache no cliente: `staleTime` de 1h (lista muda devagar).

**3. Guia de Implementação**
- **Back-end:** query `SELECT DISTINCT c.* FROM cities c JOIN routes r ON (r.origin_city_id = c.id OR r.destination_city_id = c.id) WHERE r.status = 'active' AND r.deleted_at IS NULL`.
- **Front-end:** criar hook `useCitiesServed()` com React Query. Substituir constante hardcoded em `about.tsx`. Loading state com skeleton. Error state silencioso (log console + fallback).
- **Edge case:** cidade com 0 rotas ativas não aparece. Cidade com rota suspensa também não (apenas `active`).
- **Edge case:** se o front recebe `cities: []`, mostrar mensagem "Em breve, atendemos novas cidades" em vez de seção vazia.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar `cities.photo_url` nesse UC (fica para quando o schema for atualizado — ver §7).
- **NÃO** criar filtro de busca na página `/about` (é institucional, não listagem).
- **NÃO** adicionar estatísticas por cidade além de `active_routes` (sem população, sem demográficos — não é escopo da plataforma).
- **NÃO** inventar lista "cidades em breve" sem dado real no backend.

**5. Sugestões/Conselhos de Arquitetura**
- Endpoint é `GET` público, sem auth. Rate limit padrão (120/min).
- `active_routes` pode ser calculado on-demand ou materializado em `cities.route_count_cached` (não obrigatório — a query custa pouco com índice em `routes.status`).

---

#### UC-P2 — `PopularRoutesSection` consome `GET /api/destinations/popular`

**1. Descrição e Objetivo**
Substituir a lista hardcoded de 6 destinos populares na home pela chamada ao endpoint `GET /api/destinations/popular` (`api-spec.md §2.5`). Objetivo: destinos refletirem volume real de busca/schedules, não decisão editorial estática.

**2. Regras de Negócio Inegociáveis**
- Backend decide o critério: top N por `schedule_count` do dia ou campo editorial `cities.is_featured`.
- Default `limit=6`.
- Response inclui `schedule_count`, `price_from` e `primary_cooperative` (nome + `brand_color`).
- Para cada cidade sem schedules ativos no dia, excluir do response (não mostrar destino sem opção real).

**3. Guia de Implementação**
- **Back-end:** query combinando `cities` + `routes` + `schedules` (dia da semana derivado), ordenado por `COUNT(DISTINCT s.id) DESC`, limit N.
- **Front-end:** criar hook `usePopularDestinations({ limit, date })`. Substituir array hardcoded em `PopularRoutesSection`. Loading com skeleton de 6 cards. Error state: fallback para lista estática atual.
- **Edge case:** se backend retorna <6 destinos (plataforma nova), renderizar apenas os retornados — não preencher com placeholders.
- **Edge case:** `date` default é "hoje". Se usuário navegar para outra data via query param, destinos re-calculam.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar algoritmo de ranking "ML/personalizado" por usuário — ranking é editorial ou por volume agregado.
- **NÃO** adicionar foto da cidade (`photo_url`) nesse UC — fica para o schema futuro.
- **NÃO** inventar métrica "trending" ou "crescendo" sem dado histórico comparativo real.

**5. Sugestões/Conselhos de Arquitetura**
- Resposta pode ser cacheada por 15min no backend (lista muda devagar durante o dia).
- Query usa índices existentes em `routes.destination_city_id` e `schedules.route_id`.

---

#### UC-P3 — Filtro de data e dia da semana funcional em `/schedules`

**1. Descrição e Objetivo**
Hoje `mock-schedules-api.ts:71,111` tem TODOs explícitos: o filtro `date` e `dayOfWeek` está exposto na UI mas não filtra. PRD e `api-spec.md §2.1` prometem o filtro. Este UC destrava a feature.

**2. Regras de Negócio Inegociáveis**
- Filtro `date` recebe `YYYY-MM-DD`, deriva `day_of_week` (`seg`/`ter`/.../`dom`) e aplica em `schedules.day_of_week`.
- Filtro `dayOfWeek` recebe array comma-separated (`seg,ter,qua`) e aplica como OR.
- Se `date` e `dayOfWeek` vêm juntos, `date` tem prioridade (derivação ignora `dayOfWeek` manual).
- Backend verifica `schedules_exceptions` para a `date` fornecida: schedule cancelado para aquela data recebe `badge: "cancelled"`.
- Horários temporários (`schedules_temporary`) para aquela `date` aparecem no response.

**3. Guia de Implementação**
- **Back-end:** query `WHERE day_of_week = $derivedDay AND status = 'active'`, com `LEFT JOIN schedules_exceptions e ON e.schedule_id = s.id AND e.exception_date = $date`.
- **Front-end:** remover TODO em `mock-schedules-api.ts`. Hook `useSchedules` já aceita `date`; mock precisa aplicar filtro.
- **Edge case:** `date` no passado permite busca (histórico de horários).
- **Edge case:** `date` muito futura (>1 ano) retorna erro `INVALID_PARAM`.
- **Edge case:** se `date` cai em feriado nacional conhecido, não há tratamento automático — exceção precisa ser criada manualmente pela cooperativa.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar lógica de "feriado nacional" automaticamente. Exceções são responsabilidade da cooperativa criar.
- **NÃO** adicionar filtros adicionais ao `/schedules` sem decisão formal.
- **NÃO** mudar a semântica atual (filtro é AND entre critérios diferentes, OR dentro do mesmo critério).

**5. Sugestões/Conselhos de Arquitetura**
- Índice `idx_schedules_day` já existe em `schedules(day_of_week)`.
- Adicionar índice composto `(day_of_week, status)` se performance pedir.
- `exception_date` deve ter índice (`idx_exceptions_date` já previsto em `api-spec.md §6`).

---

#### UC-P4+PA2 — Tabs "Partindo Agora / Próximos / Decorridos" em `/schedules`

**1. Descrição e Objetivo**
Implementar as 3 tabs previstas no PRD §"Consulta de Horários (Público)" para categorização temporal:
- **Partindo Agora:** janela `-30min a +60min` do agora
- **Próximos:** `>+60min` até fim do dia
- **Decorridos:** `<-30min` (horários passados)

Objetivo: reduzir tempo de absorção a <2s conforme `guia_inspiracao_vanhora.md §4.A`. Hoje a lista é única.

**2. Regras de Negócio Inegociáveis**
- Categorização é **client-side** (puro, sem endpoint novo).
- Tab default é derivada do horário atual: se há schedules em "Partindo Agora", abre nessa; senão abre "Próximos".
- Tab persistida via `?tab=now|next|past` (nuqs).
- Decorridos tem **peso visual menor** (aba cinza, texto `muted`) — não compete com Partindo Agora.
- Countdown no card continua funcionando dentro da tab (já implementado).

**3. Guia de Implementação**
- **Front-end:** aproveitar categorização existente em `use-schedule-tabs.ts` (já existe no app portal), reusar/adaptar para o lado público em `/schedules`.
- **Front-end:** `Tabs` do shadcn, `grid-cols-3` com peso visual diferente para "Decorridos" (opacity-70, text-muted-foreground).
- **Front-end:** se tab ativo fica vazio após filtros, mostrar empty state ("Nenhum horário Partindo Agora para esses filtros") + CTA "Ver Próximos".
- **Edge case:** schedule que já saiu há mais de 30min some de "Partindo Agora" automaticamente no re-render — não precisa refetch.
- **Edge case:** meia-noite: schedules do dia seguinte não aparecem; dia atual termina às 23:59.
- **Backend:** nenhuma mudança. O endpoint `GET /api/schedules` já aceita `departureAfter`/`departureBefore`, mas a categorização é feita no client agregando o response.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar endpoint novo. Categorização é derivada.
- **NÃO** mudar as 3 janelas (`-30`, `+60`) sem decisão formal — são do PRD.
- **NÃO** adicionar 4ª tab "Favoritos" aqui (favoritos têm página própria `/schedules/favorites`).
- **NÃO** adicionar notificação sonora/vibrar quando um horário "entra" em "Partindo Agora" — fora de escopo.

**5. Sugestões/Conselhos de Arquitetura**
- Re-render com `useInterval` de 60s para re-categorizar schedules que cruzam fronteiras de tempo.
- Se infinite scroll está ativo, cada tab tem seu próprio scroll (não compartilham estado).

---

#### UC-PA1 — Banner de cancelamento em favoritos (`HomeFeedSection`)

**1. Descrição e Objetivo**
Hoje passageiro só descobre que um favorito foi cancelado abrindo `/schedules/favorites`. Este UC adiciona um banner na `HomeFeedSection` que mostra, de forma passiva: *"2 dos seus favoritos hoje estão cancelados — ver"*.

**2. Regras de Negócio Inegociáveis**
- Banner aparece **só se** houver ≥1 favorito com `badge: "cancelled"` para a data **hoje**.
- Mensagem adapta ao número: *"1 dos seus favoritos hoje está cancelado"* / *"3 dos seus favoritos hoje estão cancelados"*.
- Cor do banner: amarelo suave (warning), não vermelho (não é emergência).
- Clicar leva para `/schedules/favorites` com filtro `?status=cancelled` pré-aplicado.
- Banner dispensável via `X` (persiste dispensa em `localStorage.vanhora_cancelled_banner_dismissed=<data>` só para hoje).

**3. Guia de Implementação**
- **Front-end:** `HomeFeedSection` já lê favoritos de `localStorage`. Chamar `GET /api/schedules?ids=<favorites>&date=<today>`. Filtrar `badge === "cancelled"`. Se count > 0, renderizar banner.
- **Front-end:** verificar `localStorage.vanhora_cancelled_banner_dismissed === today` para esconder.
- **Front-end:** banner usa `StatusChip` tone `warning` + ícone `AlertCircle`.
- **Edge case:** zero favoritos → não chamar endpoint, não mostrar banner.
- **Edge case:** se API falhar, não mostrar banner (silencioso).
- **Edge case:** se favorito aponta para schedule que não existe mais, backend retorna `badge: "unknown"` ou omite — não contar como cancelado.
- **Backend:** nenhuma mudança. `GET /api/schedules?ids=...` já retorna `badge` baseado em `schedules_exceptions`.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** usar notificação push — passageiro não tem cadastro.
- **NÃO** adicionar som/vibrar.
- **NÃO** mostrar banner para "atrasado" ou "suspenso" — só para `cancelled`.
- **NÃO** criar entidade `favorites` no backend (continua localStorage, limite 100).
- **NÃO** persistir dispensa além do dia (amanhã banner reaparece se condição continuar).

**5. Sugestões/Conselhos de Arquitetura**
- Debounce da verificação para evitar refetch a cada visita à home — cache de 5min.
- Banner no topo da `HomeFeedSection`, antes dos favoritos listados.

---

#### UC-F1 — Aviso da cooperativa para passageiro público

**1. Descrição e Objetivo**
Cooperativa precisa comunicar passageiros sobre: *"Rota R-204 vai atrasar hoje por manifestação na BR-222"*. Hoje impossível. Este UC adiciona 2 campos em `routes` para a cooperativa editar o aviso, e o passageiro ver na UI.

**2. Regras de Negócio Inegociáveis**
- Campos novos em `routes`:
  - `announcement_text` (varchar 280, nullable) — texto do aviso, limite estilo tweet
  - `announcement_expires_at` (timestamp, nullable) — quando o aviso some automaticamente
- Aviso visível no `ScheduleCard` daquela rota como banner amarelo compacto (tom `warning`).
- Aviso visível na página `/routes/:id` em bloco destacado.
- Se `announcement_expires_at < now()`, backend retorna `null` nos dois campos (não exibir no cliente).
- Cooperativa edita via `PUT /api/admin/routes/:id` (aditivo nos campos existentes).
- Edição aditiva: cooperativa pode mudar texto, estender ou encurtar validade.

**3. Guia de Implementação**
- **Schema:** adicionar `announcement_text`, `announcement_expires_at` em `routes` (ambos nullable).
- **Back-end:** endpoint `PUT /api/admin/routes/:id` aceita os dois campos. Validação Zod: `announcement_text` 1-280 chars, `announcement_expires_at` ISO 8601 futuro.
- **Back-end:** `GET /api/schedules`, `GET /api/routes/:id`, `GET /api/admin/routes` incluem os campos quando `expires_at > now()`.
- **Front-end admin:** `RouteFormDrawer` ganha seção colapsável "Aviso aos passageiros" com `textarea` + `date-time picker`. Preview do banner como aparecerá.
- **Front-end público:** `ScheduleCard` renderiza banner compacto se `announcement_text` presente. `/routes/:id` renderiza bloco destacado.
- **Edge case:** aviso expirado + usuário com cache antigo pode ver aviso que já expirou — degradar silenciosamente (próximo refetch limpa).
- **Edge case:** cooperativa deixa `announcement_expires_at` em branco — regra: `NOT NULL` quando `announcement_text IS NOT NULL`. Validação Zod cross-field.
- **Edge case:** rota com aviso é suspensa — aviso continua visível (afinal, "rota suspensa hoje por X" é informação útil). Backend decide ocultar ou não baseado em `routes.status`.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar entidade `announcements` separada. São 2 colunas em `routes`.
- **NÃO** permitir markdown/HTML no `announcement_text` — texto puro, sem links, sem formatação.
- **NÃO** adicionar notificação push para passageiros.
- **NÃO** criar histórico de avisos. Quando cooperativa edita, perde o anterior.
- **NÃO** permitir aviso em nível de cooperativa (ex: "Toda nossa frota em recesso") — é por rota.
- **NÃO** adicionar tipos ("urgente", "informativo") — texto puro é suficiente.

**5. Sugestões/Conselhos de Arquitetura**
- Rate limit implícito pelo endpoint `PUT /api/admin/routes/:id` existente.
- Index parcial em `routes(announcement_expires_at) WHERE announcement_expires_at IS NOT NULL` ajuda queries de limpeza futura.

---

### 5.2 Admin Geral

#### UC-A1 — Cancelar N horários de motorista em janela de datas

**1. Descrição e Objetivo**
Admin ou cooperativa precisa cancelar todos os horários de um motorista específico em uma faixa de datas (ex: motorista em cirurgia por 1 semana). Hoje: filtro não aceita `driver_id` arbitrário, não há bulk action, cada exceção é criada 1 por vez.

**2. Regras de Negócio Inegociáveis**
- Filtro de motorista em `/admin/schedules` (admin/cooperativa).
- Multiselect de horários via checkbox nas linhas da tabela.
- Bulk action "Cancelar selecionados em janela" abre modal: date-range + motivo único.
- Response 207 (multi-status): mostra sucessos e falhas por `schedule_id`.
- Audit: todas exceções criadas carregam `created_by = <admin_user_id>`.

**3. Guia de Implementação**
- **Back-end:**
  - Adicionar `driver_id` como query param em `GET /api/admin/schedules` (aditivo).
  - Novo endpoint `POST /api/admin/schedules-exceptions/bulk` com body `{ schedule_ids: UUID[], date_range: {from, to}, type: "cancelled"|"suspended", reason: string }`.
  - Server itera: materializa 1 linha em `schedules_exceptions` por (schedule × data no range aplicável).
  - Response: `{ created: UUID[], failed: [{ schedule_id, date, error }] }`.
- **Front-end:**
  - Habilitar filtro "Motorista" (Combobox) no `SchedulesPage`.
  - Coluna de checkbox + `AdminBulkBar` (componente novo).
  - Modal `BulkExceptionModal` com `DateRangeField` + `ChoiceChips` (type) + textarea (reason).
- **Edge case:** schedule está em "cancelled" por outra exceção para aquela data — ignorar (idempotente).
- **Edge case:** range inclui dias em que schedule não opera (não está em `active_days`) — ignorar silenciosamente.
- **Edge case:** `date_range.from > date_range.to` — erro 400.
- **Edge case:** range > 90 dias — erro 400 (proteção).

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** reatribuir motoristas automaticamente — admin usa UC-A8 depois.
- **NÃO** notificar passageiros afetados (sem canal de notificação).
- **NÃO** adicionar sugestão IA "melhor motorista substituto".
- **NÃO** criar `AdminBulkBar` com export CSV — bulk só para ações de cancelamento/exceção aqui.

**5. Sugestões/Conselhos de Arquitetura**
- Transação única no backend (`BEGIN ... COMMIT`) para garantir atomicidade do bulk.
- Response 207 permite retry parcial pelo front.

---

#### UC-A2 — Exceção em intervalo de datas (recesso)

**1. Descrição e Objetivo**
Marcar recesso (ex: 24/12 a 02/01) para uma ou várias rotas em um fluxo único. Hoje: `ExceptionModal` aceita 1 data por horário — 10 dias × 5 horários = 50 modais.

**2. Regras de Negócio Inegociáveis**
- Admin/cooperativa escolhe uma ou várias rotas.
- Date-range picker define o intervalo.
- Motivo único aplicado a todas as exceções geradas.
- Tipo: `cancelled` ou `suspended`.
- Response mostra total de exceções criadas e falhas.

**3. Guia de Implementação**
- **Back-end:** mesmo endpoint `POST /api/admin/schedules-exceptions/bulk` de UC-A1, mas com `route_ids: UUID[]` em vez de `schedule_ids`. Server resolve `route_ids` para todos os `schedule_ids` filhos e materializa exceções.
- **Front-end:** criar `DateRangeField` encapsulando `react-imask` já existente. Modal `RecessModal` com `CooperativePicker` (opcional, filtra rotas) + lista de rotas (checkboxes) + `DateRangeField` + motivo.
- **Edge case:** rota com `active_days: ['seg','ter','qua','qui','sex']` + range inclui sábado/domingo — pular esses dias (nenhum schedule afetado).
- **Edge case:** range cruza horário temporário já cadastrado — temporário NÃO é afetado (só grade recorrente).
- **Edge case:** rota já tem exceção criada para alguma data no range — mantém a existente, não duplica.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar entidade "recesso" ou "feriado" separada — tudo entra como `schedules_exceptions`.
- **NÃO** sugerir feriados nacionais automaticamente.
- **NÃO** reatribuir motoristas.
- **NÃO** criar notificação para passageiros com favoritos afetados automaticamente — eles vão ver via UC-PA1 quando entrarem.

**5. Sugestões/Conselhos de Arquitetura**
- Reusa o endpoint de UC-A1 (`/bulk`). Pode discriminar por presença de `route_ids` vs `schedule_ids` no body.
- Validação: `date_range` ≤ 60 dias (recesso típico máximo).

---

#### UC-A3 — Duplicar rota com horários

**1. Descrição e Objetivo**
Variação da ação "Duplicar rota" existente (PR10), que hoje duplica só o cabeçalho. Este UC permite copiar os horários junto.

**2. Regras de Negócio Inegociáveis**
- Ao duplicar, dialog pergunta: "Copiar os N horários desta rota?" (checkbox).
- Novo código sugerido pelo sistema (`<original>-DUP` editável, mesmo padrão do PR10).
- Nova rota entra com status `inactive` (consistente com PR10 — evita duplicata operando).
- Novos horários herdam `active_days`, `departure_time` da rota original; recebem `routeId` da rota nova.
- Nenhum motorista é copiado (nova rota entra com `drive_id = null`).

**3. Guia de Implementação**
- **Back-end:** `POST /api/admin/routes/:id/duplicate` com body `{ include_schedules: boolean, new_name?: string, new_active_days?: string[] }`.
- **Back-end:** se `include_schedules: true`, server itera `schedules` da rota original e cria cópias apontando para nova `route_id`.
- **Front-end:** modal de duplicar ganha checkbox "Copiar N horários" com contagem real.
- **Edge case:** rota original com 0 horários — checkbox desabilitado.
- **Edge case:** novo nome colide com outro — erro 409 (sugere `<nome>-COPIA-2`).
- **Edge case:** rota original com horários em exceção aberta — exceções NÃO são copiadas (começam limpas).

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** copiar motorista da rota original (seria confuso ter 2 rotas com mesmo motorista).
- **NÃO** copiar `announcement_text` (UC-F1) — avisos são por contexto, não transferíveis.
- **NÃO** copiar exceções/temporários.
- **NÃO** permitir duplicar entre cooperativas diferentes.

**5. Sugestões/Conselhos de Arquitetura**
- Transação única garante que ou tudo é criado ou nada.
- Default do `new_active_days` é o do original.

---

#### UC-A4 — Impacto pré-suspender (rota/cooperativa/cidade)

**1. Descrição e Objetivo**
Antes de confirmar ação destrutiva ("Suspender rota R-204"), admin vê prévia: *"Isso vai afetar N horários ativos, M exceções abertas, K atrasos nos últimos 7d, L passageiros com essa rota favoritada"*.

**2. Regras de Negócio Inegociáveis**
- `AdminConfirmDialog` cresce com bloco "Impacto" acima do prompt de digitação.
- Dados vêm de endpoint dedicado `GET /api/admin/<entity>/:id/impact-summary`.
- Se backend demora >1s, mostrar skeleton (não bloquear confirmação).
- Favoritos é **estimativa** (não há cadastro — count pode ser substituído por "sem telemetria disponível" se preferir).

**3. Guia de Implementação**
- **Back-end:**
  - `GET /api/admin/routes/:id/impact-summary` → `{ active_schedules, open_exceptions, delays_7d }`.
  - `GET /api/admin/cooperatives/:id/impact-summary` → `{ active_routes, active_drivers, scheduled_today, delays_7d }`.
  - `GET /api/admin/cities/:id/impact-summary` → `{ routes_as_origin, routes_as_destination, stops_count }`.
- **Front-end:** `AdminConfirmDialog` ganha prop `impactEndpoint`. Fetch on-mount, renderiza bloco "Impacto" com `<AdminKPICard>` compactos.
- **Edge case:** entidade sem impacto (ex: rota recém-criada sem horário) — bloco "Impacto" renderiza "Sem impacto — nenhuma dependência".
- **Edge case:** backend 500 — dialog funciona sem bloco "Impacto" + log console.
- **Edge case:** confirmação typed continua obrigatória mesmo com impacto zero (padrão do PR9/PR10/PR11).

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** estimar impacto financeiro (sem dado de receita).
- **NÃO** adicionar botão "Ver afetados" com drill-down — se útil, vira UC próprio.
- **NÃO** adicionar sugestão IA tipo "você quer mesmo fazer isso?".
- **NÃO** adicionar count de "favoritos" se não houver telemetria no backend — preferir omitir a estimar errado.

**5. Sugestões/Conselhos de Arquitetura**
- Cada endpoint é GET simples, cacheável.
- Reusar query do `/admin/schedules` existente para contagem de horários/exceções.

---

#### UC-A6 — `updated_by` / `updated_at` embrionário (trilha mínima)

**1. Descrição e Objetivo**
Resposta a *"quem alterou o motorista da R-204?"* sem criar tabela de auditoria completa. Adicionar 2 colunas em cada entidade mutável + exibir no detalhe.

**2. Regras de Negócio Inegociáveis**
- Colunas novas em `routes`, `schedules`, `users`, `cooperatives`, `cities`:
  - `updated_by uuid NULL` (FK para `users.id`)
  - `updated_at timestamp NULL`
- Toda operação `PUT`/`PATCH` seta ambas automaticamente (middleware).
- UI mostra no detalhe: *"Última alteração por {Nome do Usuário} em {DD/MM/AAAA HH:MM}"*.
- Se `updated_by IS NULL`, mostrar "sem alterações registradas".
- `created_at` continua existindo (nunca é alterado).

**3. Guia de Implementação**
- **Schema:** 2 colunas × 5 tabelas (10 colunas aditivas, nenhuma destrutiva).
- **Back-end:** middleware Fastify que, antes do commit de `PUT`/`PATCH`, injeta `updated_by = <jwt.sub>` e `updated_at = now()`.
- **Front-end:** adicionar linha no bloco de detalhe (`cooperative-detail-panel.tsx`, `route-detail.tsx`, etc.).
- **Edge case:** usuário que fez alteração foi deletado (soft-delete) — mostrar "por usuário removido".
- **Edge case:** `updated_at < created_at` (impossível, mas defensivo): usar `created_at` como fallback.
- **Edge case:** campo `password_hash` em `users` não deve disparar `updated_at` (seria barulho). Decisão: dispara mesmo assim — qualquer mudança é mudança.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar tabela `audit_log` com histórico de todas as mudanças. Isso é 5.1, descartado (D15).
- **NÃO** mostrar diff ("campo X foi de A para B") — só autor e data.
- **NÃO** permitir filtrar listagens por `updated_by` ou `updated_at` — não é objetivo deste UC.
- **NÃO** armazenar IP ou user-agent — mínimo necessário.

**5. Sugestões/Conselhos de Arquitetura**
- Middleware `onRequest` do Fastify extrai `jwt.sub` e popula `request.updatedBy`, consumido pelo repositório.
- Index em `(updated_at DESC)` opcional (só se "entidades alteradas recentemente" virar query comum).

---

#### UC-A17 — Command palette (Cmd+K)

**1. Descrição e Objetivo**
Atalho global para ações comuns: "Novo usuário", "Ir para rota R-204", "Ver atrasos de hoje", "Reportar atraso". Reduz navegação em admin pesado.

**2. Regras de Negócio Inegociáveis**
- Atalho global: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux).
- Comandos filtrados por role do usuário (admin vê tudo, cooperativa só o escopo próprio, motorista comandos próprios).
- Suporte a atalhos nomeados (`?today`, `?mine` de UC-A18) nos resultados.
- Comandos de navegação têm ícone de seta; comandos de ação têm ícone de ação.
- Fecha com `Esc` ou clique fora.

**3. Guia de Implementação**
- **Front-end:** usar `cmdk` (já é dependência via `SearchableSelect`).
- Catálogo de comandos em `src/lib/command-palette/commands.ts`, cada comando com `{ id, label, icon, action, visibleIfRole, keywords }`.
- Hook global `useCommandPalette` com atalho de teclado.
- Comandos "ir para X" fazem `navigate()`; "criar Y" abrem modal.
- **Edge case:** usuário sem role (não logado) — palette não abre.
- **Edge case:** comando pede permissão que o usuário não tem — oculto do filtro.
- **Backend:** nenhuma mudança.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar busca "fuzzy" por entidades (ex: "pedro silva" → vai para usuário Pedro Silva). Isso é PR separado se precisar.
- **NÃO** adicionar histórico de comandos recentes nesta primeira versão.
- **NÃO** permitir customização pelo usuário (ex: alias).
- **NÃO** mostrar o command palette no portal público.

**5. Sugestões/Conselhos de Arquitetura**
- Catálogo estático em TypeScript (sem backend). Adicionar comando é 1 linha.
- Keywords permitem múltiplas formas de achar o mesmo comando ("novo horário" vs "add schedule" vs "+ horário").

---

#### UC-A18 — Deep-links nomeados (`?today`, `?mine`)

**1. Descrição e Objetivo**
Pré-computar URLs nomeadas acessíveis via menu lateral ou atalhos: `/admin/schedules?today` (= hoje), `/admin/delays?mine` (atrasos escopados).

**2. Regras de Negócio Inegociáveis**
- `?today`: equivalente a `?date=<data atual ISO>` resolvido no cliente.
- `?mine` em `/admin/delays`:
  - Para role `cooperative`: filtra `cooperativeId = <user.cooperativeId>` (redundante no backend com JWT, mas explícito na UI).
  - Para role `admin`: filtra `resolved_by IS NULL AND severity = 'high'` (triagem alta prioridade).
  - Para role `driver`: filtra `reported_by = <user.id>` (idêntico ao escopo automático do backend).
- Links no menu lateral: "Hoje" (admin + coop em `/schedules`), "Minha fila" (todas as personas em `/delays`).

**3. Guia de Implementação**
- **Front-end:**
  - Reader de query param: se `?today`, interceptar e substituir por `?date=<ISO>` antes de renderizar.
  - Reader de `?mine` em `/admin/delays`: adicionar filtros compostos baseado em role.
  - Menu lateral: itens novos "Hoje", "Minha fila" (ícones apropriados).
- **Backend:**
  - Adicionar colunas `delays.resolved_by uuid NULL` e `delays.resolved_at timestamp NULL` (aditivo, suporta `?mine` do admin).
  - Endpoint `PATCH /api/admin/delays/:id/resolve` que seta ambas.
- **Edge case:** `?today` + `?date=<outra>` juntos → `?date` tem prioridade (specific wins).
- **Edge case:** `?mine` em contexto que não faz sentido (ex: `/admin/users?mine`) → ignorar o param.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar sistema de "URLs favoritas" por usuário.
- **NÃO** adicionar outros atalhos nomeados nesta primeira versão (`?this-week`, `?urgent` etc).
- **NÃO** persistir estado de "triagem alta" (`?mine` admin) no backend como preferência.

**5. Sugestões/Conselhos de Arquitetura**
- Resolução de `?today` no `useEffect` do página consumidora, usando `nuqs` para reescrever a URL sem recarregar.
- Ação "Resolver atraso" (via `?mine` admin) abre `delay-detail-dialog` com botão "Marcar como resolvido" que chama o novo endpoint.

---

#### UC-F4 — Filtro `?mine` para admin via `resolved_by`

**1. Descrição e Objetivo**
Extensão do UC-A18. Admin precisa de uma fila "minha fila" de triagem — atrasos ainda não resolvidos que precisam de atenção. Requer rastreamento de resolução, que hoje não existe no schema.

**2. Regras de Negócio Inegociáveis**
- 2 colunas aditivas em `delays`:
  - `resolved_by uuid NULL` (FK para `users.id`)
  - `resolved_at timestamp NULL`
- Delay sem `resolved_by` é considerado "pendente".
- Delay resolvido não some da listagem — ganha badge "Resolvido" + nome do resolver.
- Admin marca como resolvido via `PATCH /api/admin/delays/:id/resolve` (sem body, usa JWT).
- Delay pode ser "re-aberto" por outro admin (`PATCH /api/admin/delays/:id/reopen`).

**3. Guia de Implementação**
- **Schema:** 2 colunas aditivas em `delays`.
- **Back-end:** 2 endpoints novos (`resolve`, `reopen`). `GET /api/admin/delays` aceita filtro `?resolved=true|false|all` (default `all`).
- **Front-end:** `delay-detail-dialog` ganha botão "Marcar como resolvido" / "Reabrir". Card do delay mostra badge `StatusChip` "Resolvido" (`tone: success`).
- **Edge case:** cooperativa resolve delay próprio — permitido (não é admin-only).
- **Edge case:** driver NÃO pode resolver (só admin + cooperative).
- **Edge case:** delay deletado (`deleted_at`) não pode ser resolvido.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar status intermediário "em análise" / "ignorado". Só pendente/resolvido.
- **NÃO** criar fluxo de aprovação (resolver ≠ precisa 2 pessoas).
- **NÃO** adicionar comentário obrigatório ao resolver — ação simples, 1 clique.
- **NÃO** usar `resolved_by` para outra entidade — campo específico de `delays`.

**5. Sugestões/Conselhos de Arquitetura**
- Index parcial: `CREATE INDEX idx_delays_pending ON delays(created_at DESC) WHERE resolved_by IS NULL AND deleted_at IS NULL;` — acelera a fila `?mine`.
- Endpoint `resolve`/`reopen` são idempotentes (resolver 2× não erro, só re-registra `resolved_at`).

---

### 5.3 Cooperativa

#### UC-A7 — Horário temporário com motorista substituto

**1. Descrição e Objetivo**
Cooperativa cria horário extra para dia específico (ex: feriado alta-demanda) e precisa atribuir motorista **diferente do titular da rota** só naquela instância.

**2. Regras de Negócio Inegociáveis**
- Nova coluna `schedules_temporary.driver_id uuid NULL` (FK para `users.id`).
- Semântica:
  - `NULL` → herda `routes.drive_id` (titular da rota).
  - Preenchido → override para aquela ocorrência específica.
- Motorista substituto deve pertencer à mesma cooperativa da rota.
- `routes.drive_id` não muda (titular normal continua).

**3. Guia de Implementação**
- **Schema:** 1 coluna aditiva `driver_id uuid NULL` em `schedules_temporary`.
- **Back-end:** `POST /api/admin/schedules-temporary` aceita campo opcional `driver_id`. Validação: `driver_id` precisa ter `cooperative_id = route.cooperative_id` (constraint de aplicação).
- **Front-end:** modal `ExceptionModal` em modo "Serviço extra" ganha campo "Motorista" (`SearchableSelect`) com hint "Se vazio, usa o titular da rota". Default: vazio.
- **Edge case:** titular está `inactive` + sem override → UI alerta "Rota sem motorista — defina um substituto" + badge âmbar.
- **Edge case:** cooperativa escolhe motorista de outra cooperativa — rejeitado pelo backend (422).
- **Edge case:** motorista escolhido também está em outro schedule mesmo horário — permitido no backend (não é conflito de banco), mas front mostra warning amarelo.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar lógica de "quem é o melhor substituto" via sugestão.
- **NÃO** permitir atribuir usuário com role ≠ `driver`.
- **NÃO** criar validação de "motorista disponível" (sem registro de ausência formal — é A15/4.2 descartado).
- **NÃO** notificar o motorista substituto (sem canal de notificação definido para este fluxo).

**5. Sugestões/Conselhos de Arquitetura**
- Validação de pertencimento à cooperativa é feita na camada de aplicação (SQL check não é prático via FK de 2 níveis).
- Index composto `(route_id, date)` já previsto em `api-spec.md` cobre consultas.

---

#### UC-A8 — Reatribuir carga de trabalho de motorista

**1. Descrição e Objetivo**
Cooperativa precisa passar todas as rotas de um motorista (ex: Beto entra de férias) para outros motoristas em uma operação única com prévia.

**2. Regras de Negócio Inegociáveis**
- Interface mostra todas as rotas onde `drive_id = <origem>` da própria cooperativa.
- Para cada rota, dropdown de destino filtrado por motoristas da mesma cooperativa.
- Preview antes de aplicar (quantas rotas afetadas, para quem).
- Aplicação é transacional: ou todas as reatribuições vão, ou nenhuma.
- Reatribuir para `null` (desatribuir) é permitido explicitamente (checkbox "Deixar sem motorista").

**3. Guia de Implementação**
- **Back-end:** `POST /api/admin/users/:driver_id/reassign-routes` com body `{ mappings: [{ route_id, new_driver_id: UUID|null }] }`. Transação única.
- **Back-end:** validação: todos `new_driver_id` precisam pertencer à mesma `cooperative_id` da `route`.
- **Front-end:** modal `DriverReassignmentModal` acessível de 2 lugares: linha do motorista em `/users` + aba "Motoristas" do master-detail de cooperativa (`/admin/cooperatives?cooperative=<id>&tab=drivers`).
- **Edge case:** motorista origem não tem rotas — modal mostra "Nenhuma rota para reatribuir" + ação cancelada.
- **Edge case:** no meio da operação, outra pessoa altera uma rota (versão stale) — transação falha, UI pede refresh.
- **Edge case:** reatribuir para si mesmo (origem = destino) — permitido mas marca warning amarelo "Sem mudança efetiva".

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** sugerir destinatário automaticamente (ex: "menor carga") — admin decide.
- **NÃO** reatribuir schedules_temporary — só routes.
- **NÃO** notificar motorista destino.
- **NÃO** adicionar motivo obrigatório para reatribuição.

**5. Sugestões/Conselhos de Arquitetura**
- Transação SQL única envolvendo múltiplos `UPDATE routes SET drive_id = ... WHERE id = ...`.
- Response 207 opcional se quiser permitir sucessos parciais (preferência: 400 all-or-nothing para evitar estado inconsistente).

---

#### UC-A9 — Grade semanal (visão temporal)

**1. Descrição e Objetivo**
Cooperativa precisa ver a semana à frente numa matriz Rotas × Dias com contagem de saídas. Hoje `/cooperative/schedules` é lista plana.

**2. Regras de Negócio Inegociáveis**
- Novo toggle na `/schedules` admin/cooperativa: "Lista" (atual) / "Grade" (novo).
- Grade mostra matriz: linhas = rotas ativas, colunas = seg a dom.
- Célula contém contagem de saídas (`schedules` com aquele dia em `active_days`).
- Clicar na célula faz drill-down filtrando lista para aquele dia + rota.
- Estado "Grade/Lista" persiste em URL (`?view=list|grid`).
- Badge de motorista nome aparece se único motorista para a célula (senão, "N motoristas").

**3. Guia de Implementação**
- **Front-end:** novo componente `WeeklyGridView` reutilizando `GET /api/admin/schedules` existente (nenhum endpoint novo).
- Toggle acessível via `TabsList` no header de `/schedules`.
- Mobile: grade vira stack vertical por dia (grid rouba espaço).
- **Edge case:** rota com `active_days = []` (nenhum dia) — some da grade (seria linha vazia).
- **Edge case:** semana sem schedules em nenhuma rota — grade mostra "Nenhuma rota ativa esta semana".
- **Edge case:** cooperativa com 50+ rotas — grade com scroll vertical interno.
- **Backend:** nenhuma mudança.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar edição direto na grade (ex: drag horário para outro dia). Lista é edição; grade é visão.
- **NÃO** mostrar exceções/temporários na grade — grade é da grade recorrente.
- **NÃO** colorir células por "carga" (saturação de motorista) — fora de escopo nesta versão.
- **NÃO** adicionar grid "mensal" (grade semanal basta).

**5. Sugestões/Conselhos de Arquitetura**
- Agregação por `active_days` acontece no front após fetch único de todas as rotas.
- Memoizar transformação `routes → matrix` com `useMemo`.

---

#### UC-A10 — Sinalizar rotas órfãs (motorista inativo)

**1. Descrição e Objetivo**
Ao desativar/suspender motorista, suas rotas (`drive_id = <inactive>`) continuam atribuídas tacitamente — admin descobre o problema só ao abrir cada rota. Este UC puxa a visibilidade pro dashboard.

**2. Regras de Negócio Inegociáveis**
- KPI novo "Rotas sem motorista ativo" no dashboard da cooperativa.
- No dashboard admin, mesmo KPI com breakdown por cooperativa.
- Filtro `?driver_status=inactive` em `GET /api/admin/routes` (aditivo).
- Badge âmbar "Motorista afastado — reatribuir" no `RouteCard` quando `driver.status === 'inactive'`.
- Rota sem `drive_id` (null) **também** é considerada órfã.

**3. Guia de Implementação**
- **Back-end:** adicionar filtro `?driver_status=inactive` em `GET /api/admin/routes` → `WHERE drive_id IS NULL OR drive_id IN (SELECT id FROM users WHERE status = 'inactive')`.
- **Back-end:** endpoint de dashboard inclui campo `orphan_routes_count` (novo).
- **Front-end:** novo `AdminKPICard` em dashboards. Badge no `RouteCard` com clique → navega para `/admin/users?user=<driver_id>` ou abre `DriverReassignmentModal` direto.
- **Edge case:** motorista reativado — badge some automaticamente no próximo refetch.
- **Edge case:** rota com motorista deletado (soft-delete) — tratar como órfã.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** auto-desatribuir ao desativar motorista. Mantém a referência para o admin decidir.
- **NÃO** criar alerta por email/push.
- **NÃO** adicionar sugestão de substituto automática.

**5. Sugestões/Conselhos de Arquitetura**
- Query de KPI pode ser cacheada por 1min (não precisa ser real-time).

---

#### UC-A16 — Broadcast interno (versão mínima)

**1. Descrição e Objetivo**
Canal de aviso interno da cooperativa para motoristas, visível no próprio site (sem push, sem WhatsApp integrado). Admin pode broadcastar para cooperativas também.

**2. Regras de Negócio Inegociáveis**
- 2 tabelas novas:
  - `announcements` (`id`, `title` varchar 120, `body` varchar 2000, `audience` enum `all|cooperative|driver`, `cooperative_id` uuid FK NULL, `expires_at` timestamp NULL, `created_by` uuid FK, `created_at` timestamp)
  - `announcements_reads` (`announcement_id` uuid, `user_id` uuid, `read_at` timestamp)
- Audience `all` = enviado pelo admin para todas as cooperativas e todos drivers.
- Audience `cooperative` = emissor é admin, destinatários são usuários role `cooperative` da `cooperative_id`.
- Audience `driver` = emissor é cooperative, destinatários são usuários role `driver` da `cooperative_id`.
- Aviso expirado (`expires_at < now()`) some automaticamente.
- Confirmação de leitura: ao dispensar banner, cria linha em `announcements_reads`.
- Cooperativa/admin vê quantos leram no detalhe do aviso.

**3. Guia de Implementação**
- **Schema:** 2 tabelas novas.
- **Back-end:**
  - `POST /api/admin/announcements` (admin + cooperative podem criar; cooperative só com audience=`driver` e cooperative_id = próprio).
  - `GET /api/announcements/mine` (consome JWT, filtra por role + cooperativa).
  - `POST /api/announcements/:id/read` (idempotente).
  - `GET /api/admin/announcements/:id/reads` (quantos leram, admin + emissor).
- **Front-end:**
  - Banner no topo do portal (fora do público), max 1 aviso simultâneo (prioridade por `created_at DESC`).
  - Botão `X` dispensa (cria read) + remove banner.
  - Página `/admin/announcements` (admin) e `/cooperative/announcements` com CRUD.
- **Edge case:** usuário já leu + reaparece — não mostra (já tem registro em `announcements_reads`).
- **Edge case:** vários avisos simultâneos — mostrar só o mais recente; outros ficam listados em "Avisos" no menu.
- **Edge case:** emissor exclui aviso — removido para todos imediatamente, histórico de reads preservado.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** permitir markdown/HTML — texto puro, sem links.
- **NÃO** adicionar tipos (`info`, `warning`, `urgent`) — apenas texto neutro.
- **NÃO** permitir anexo (imagem, PDF).
- **NÃO** usar push notification nem email.
- **NÃO** permitir agendamento (aviso é criado = publicado).
- **NÃO** permitir targeting por rota específica ou motorista específico (seria 5.6 descartado — D15).
- **NÃO** criar sistema de resposta/comentário no aviso. Comunicação é unidirecional.

**5. Sugestões/Conselhos de Arquitetura**
- Tabelas pequenas (expected: dezenas por cooperativa/mês). Sem particionamento.
- Index: `(audience, cooperative_id, expires_at)` para query do banner.
- Policy de retenção: deletar avisos com `expires_at < now() - 90d` via job batch (opcional).

---

### 5.4 Motorista

#### UC-A13 — Histórico próprio de atrasos (`/driver/my-delays`)

**1. Descrição e Objetivo**
Motorista reporta atraso e nunca mais vê. Este UC adiciona página de histórico para transparência pessoal.

**2. Regras de Negócio Inegociáveis**
- Nova rota `/driver/my-delays`.
- Lista últimos 30 dias de atrasos onde `reported_by = <self>`.
- Filtros: severidade (chips), causa (chips), período (últimos 7d/30d/90d).
- Clique abre `delay-detail-dialog` existente (read-only para motorista).
- Item no menu lateral do driver com badge de contagem dos últimos 7 dias.

**3. Guia de Implementação**
- **Back-end:** zero mudança. `GET /api/admin/delays?reported_by=<self>` já suportado (`api-spec.md §3.7` garante escopo driver).
- **Front-end:** nova página reusando `AdminTable` + `useTableFilters` + `SeverityBadge` já existentes.
- Menu lateral driver adiciona item "Meus Atrasos" com `AlertTriangle` + badge count.
- **Edge case:** motorista sem atrasos — empty state positivo ("Nenhum atraso reportado — ótimo trabalho! ✓").
- **Edge case:** atraso resolvido pelo admin via UC-F4 — mostra badge "Resolvido" na linha.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** mostrar métricas de pontualidade comparadas aos pares (fricção interna cooperativa).
- **NÃO** permitir editar/deletar atraso reportado — read-only.
- **NÃO** mostrar atrasos de outros motoristas (mesmo da mesma rota).
- **NÃO** adicionar export CSV nesta primeira versão.

**5. Sugestões/Conselhos de Arquitetura**
- Reuso completo da infra existente (`AdminTable`, `SeverityBadge`, `useTableFilters`).

---

#### UC-A15 + F2 — Reportar ausência (workaround degradado + range parcial)

**1. Descrição e Objetivo**
Motorista avisa que não vai operar. Usa workaround `schedules_exceptions.type='cancelled'` com `reason` prefixado para distinguir de cancelamento operacional. F2 estende: motorista pode marcar range parcial (ex: "não opero segunda das 6h às 12h").

**2. Regras de Negócio Inegociáveis**
- Nova ação na home do motorista: "Não vou operar".
- Modal pede:
  - Data(s) afetada(s): single date ou range.
  - Período no dia (F2): "Dia todo" / "Range de horário" (de X até Y).
  - Motivo (chips): "Doença" / "Particular" / "Veículo indisponível" / "Outro".
- Sistema cria N exceções: 1 por horário do motorista que cai no range.
- `reason` segue formato: `AUSÊNCIA:<motivo>` (prefixo pelo backend baseado em role=driver).
- Cooperativa vê como cancelamento no board "Agora" com badge "Motorista afastado".
- Cooperativa pode cancelar as exceções geradas (ex: motorista voltou).

**3. Guia de Implementação**
- **Back-end:** nenhum endpoint novo. `POST /api/admin/schedules-exceptions` existente aceita múltiplas criações. Server detecta que `reported_by.role = 'driver'` e prefixa `reason`.
- **Back-end:** range de horário derivado no front — resolve `schedule_ids` cujas `departure_time` caem no range e envia lista.
- **Front-end:** modal `DriverAbsenceModal`. Chama o endpoint em loop com `Promise.allSettled`.
- **Edge case:** motorista sem schedules no range — mostra "Nenhum horário afetado nesse range" + cancelar.
- **Edge case:** horário já tem exceção para aquela data (ex: cooperativa já cancelou) — pular silenciosamente.
- **Edge case:** range cruza meia-noite — não suportado, dividir em 2 ausências.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** criar tabela `driver_absences` (4.2 está em escopo negativo D12).
- **NÃO** permitir anexo (atestado médico, foto).
- **NÃO** criar fluxo de aprovação pela cooperativa.
- **NÃO** reatribuir automaticamente para outro motorista.
- **NÃO** notificar passageiros com favoritos afetados.
- **NÃO** calcular "quanto motorista faltou no mês" como métrica.
- **NÃO** persistir motivo em formato estruturado — fica em texto no `reason` prefixado.

**5. Sugestões/Conselhos de Arquitetura**
- Server detecta prefixo `AUSÊNCIA:` para análises futuras (sem schema específico).
- Transação única no backend para batch de exceções.

---

#### UC-4.5 — Eventos operacionais / incidentes ≠ atraso

**1. Descrição e Objetivo**
Motorista reporta ocorrências que **não são atraso**: quebra de veículo, acidente, problema com passageiro, assalto. Hoje tudo isso vira "atraso com causa=mecânico" — polui métrica. Também cobre A14 (check-in via `type='trip_started'`).

**2. Regras de Negócio Inegociáveis**
- Nova tabela `operational_events`:
  - `id` uuid
  - `schedule_id` uuid FK
  - `route_id` uuid FK (desnormalizado para query)
  - `cooperative_id` uuid FK (desnormalizado)
  - `occurrence_date` date
  - `occurrence_time` time
  - `type` enum: `trip_started` | `vehicle_breakdown` | `accident` | `passenger_issue` | `security_incident` | `other`
  - `severity` enum: `low` | `medium` | `high`
  - `description` text (max 2000 chars)
  - `reported_by` uuid FK
  - `reported_at` timestamp
- **Sem upload de imagem** (restrição explícita — D9).
- Severidade pode ser derivada do `type` no backend (ex: `accident` = `high` obrigatório) OU informada pelo motorista.
- Visibilidade: cooperativa vê eventos próprios; admin vê todos.
- UI motorista: tela com `ChoiceChips` para `type` + textarea description + `SeverityBadge` auto (ou editável).

**3. Guia de Implementação**
- **Schema:** 1 tabela nova. Índices em `(cooperative_id, occurrence_date DESC)` e `(schedule_id)`.
- **Back-end:**
  - `POST /api/admin/operational-events` (driver + cooperative + admin podem criar; driver só com `reported_by = self`).
  - `GET /api/admin/operational-events` com filtros `cooperative_id`, `route_id`, `schedule_id`, `type[]`, `severity`, `date_from`, `date_to`.
  - `POST /api/admin/schedules/:id/check-in` → shortcut que cria `operational_events` com `type='trip_started'` + `severity='low'`.
- **Front-end driver:**
  - Botão "Reportar ocorrência" na home (diferente de "Reportar atraso").
  - Modal com `ChoiceChips` de `type`.
  - Para `type='trip_started'`, botão fica no `CurrentTripCard` como "Iniciar viagem".
- **Front-end cooperativa:**
  - Board "Agora" ganha coluna "Iniciou" com relógio quando há `trip_started` para o schedule.
  - Nova página `/admin/operational-events` (admin) e `/cooperative/operational-events`.
- **Edge case:** motorista reporta `trip_started` 2× para mesmo schedule — segundo é ignorado (idempotente por `(schedule_id, occurrence_date)`).
- **Edge case:** evento com `type='other'` + `severity='high'` — alerta no board da cooperativa.

**4. Escopo Negativo (Anti-alucinação)**
- **NÃO** adicionar upload de imagem (D9 — restrição explícita).
- **NÃO** adicionar `trip_ended` nesta primeira versão (só `trip_started`; término é implícito ao chegar `arrival_time`).
- **NÃO** criar workflow de "resposta da cooperativa" ao evento.
- **NÃO** integrar com seguro (Coopersegg etc).
- **NÃO** depreciar `delays.cause='mechanical'` ainda — convivem. Documentar: "mecânico" em delays é "atrasou por mecânica"; `vehicle_breakdown` em eventos é "parou totalmente".
- **NÃO** criar `type='passed_stop'` (seria 4.8 rastreamento passivo, descartado D12).
- **NÃO** criar fluxo de "fechamento" do evento.

**5. Sugestões/Conselhos de Arquitetura**
- Tabela cresce proporcional a schedules × dias. Particionamento por `occurrence_date` pode ser considerado se >1M registros/ano.
- Índice composto `(cooperative_id, type, severity)` acelera dashboards.

---

### 5.5 Transversais

Casos de uso transversais (A17, A18, F4) já descritos em 5.2 Admin (aplicam-se a todas as personas ou admin principalmente).

---

## 6. Escopo Negativo Consolidado (Out of Scope)

Lista única e canônica de tudo que **NÃO deve ser implementado** sem decisão formal registrada neste documento.

### 6.1 Features de produto descartadas

| Item | Fonte | Motivo |
|------|-------|--------|
| **A5 — Transferir rotas entre cooperativas** | D11 | Complexidade alta, gatilho raro |
| **A11 — Comparação mês-mês** | D11 | Nice-to-have, baixa prioridade |
| **A12 — Ordenação/agrupamento no board** | D11 | Nice-to-have, baixa prioridade |
| **F3 — Confirmação de transferência** | D14 | Depende de A5 descartado |
| **F5 — Timezone/horário de verão** | D14 | Brasil não usa; irrelevante |
| **F6 — KPI "exceções abertas por coop"** | D14 | Dashboard já tem informação suficiente |
| **DA2 — Avaliação individual para motorista** | D16 | Fricção interna cooperativa |
| **PA3 — Favorito com apelido** | D17 | Muda shape de localStorage, baixo ROI |
| **PA4 — Compartilhar horário (WhatsApp)** | D17 | Fora do escopo de consulta |
| **P5 — PWA / Cache offline** | D17 | Infra client complexa |

### 6.2 Entidades novas descartadas (Parte B/C)

| Item | Fonte | Motivo |
|------|-------|--------|
| **4.1 — Frota (vehicles)** | D12 | VanHora não é sistema de gestão de frota |
| **4.2 — Ausência formal (driver_absences)** | D12 | A15 degradado cobre; só reconsiderar com gatilho de ruído |
| **4.3 — Escala rotativa** | D15 | Impactaria `routes.drive_id`; viola simplicidade |
| **4.4 — Manutenção (maintenance_orders)** | D12 | Depende de 4.1 descartado |
| **4.6 — Combustível (fuel_records)** | D12 | Depende de 4.1 descartado |
| **4.7 — Troca de turno (shift_swap_requests)** | D15 | Depende de notificação; complica |
| **4.8 — Rastreamento passivo** | D12 | Depende de 4.1 descartado |
| **5.1 — Auditoria completa (audit_log)** | D15 | A6 cobre essencial |
| **5.2 — Documentos regulatórios (documents)** | D13 | VanHora não é ERP |
| **5.3 — Renovação com alerta ARCE** | D13 | Depende de 5.2 descartado |
| **5.4 — Assembleia/Cooperados (Lei 5.764)** | D13 | VanHora não é ERP |
| **5.5 — Prestação de contas mensal** | D13 | Fora de escopo (sem venda, sem CT-e) |
| **5.6 — Broadcast completo** | D15 | A16 mínimo cobre; reconsiderar se insuficiente |

### 6.3 Comportamentos técnicos vetados globalmente

Estas regras aplicam-se a **todos** os UCs, mesmo quando não repetidas no "Escopo Negativo" do UC específico.

| Regra | Justificativa |
|-------|--------------|
| **Sem GPS, sem mapa, sem "placeholder de mapa"** | D3 — se não vai existir, não reserva espaço |
| **Sem ocupação real-time** | D4 — passageiros é mock aceito, não real-time |
| **Sem upload de arquivos (fotos, PDFs, atestados)** | D9 explicitamente, e por extensão a todos os UCs |
| **Sem notificação push** | D6 — comunicação é no próprio site |
| **Sem WhatsApp/email integrado** | D6 — canais externos ficam fora |
| **Sem IA/ML sugerindo decisões** (ex: "melhor motorista substituto") | Simplicidade |
| **Sem venda de bilhete, cobrança, CT-e** | D2 |
| **Sem markdown/HTML em campos de texto do usuário** | Prevenção XSS e simplicidade |
| **Sem personalizações profundas** (ex: temas por cooperativa além de `brand_color`) | Fora de escopo |
| **Sem comentários/respostas em avisos** | Comunicação unidirecional (D6) |

### 6.4 Padrões de dado inventado — proibido

- Nenhum UC pode exibir métrica que **não vem do schema real**.
- Nenhum campo pode ser preenchido com placeholder tipo "em breve" ou "N/A estimado".
- Se um dado não existe, o componente que o mostraria **não renderiza** (ou renderiza empty state honesto).

---

## 7. Mudanças de Schema Aprovadas

Consolidação das mudanças já aprovadas e novas aditivas aprovadas neste documento. **Todas aditivas, nenhuma destrutiva.**

### 7.1 Herdadas de `api-spec.md §5` (12 itens — base canônica)

Já faziam parte do escopo do backend inicial:

1. `cooperatives.brand_color varchar(7) NULL`
2. `routes.origin_city_id uuid FK NOT NULL`
3. `routes.destination_city_id uuid FK NOT NULL`
4. `routes.description text NULL`
5. `cooperatives.email varchar NULL`
6. `cooperatives.description varchar(500) NULL`
7. `cities.photo_url varchar NULL`
8. Rename `routes.drive_id` → `routes.driver_id` (migration)
9. Rename `ratings.date_ata` → `ratings.created_at` (migration)
10. `cooperatives.rating_cached DECIMAL(3,2) NULL` (materialização)
11. `cooperatives.rating_count_cached INTEGER NULL` (materialização)
12. Nenhum endpoint novo listado aqui — apenas estes campos acima.

### 7.2 Novas aprovadas neste documento (aditivas)

| # | Mudança | UC relacionado | Status |
|---|---------|---------------|--------|
| 13 | `schedules_temporary.driver_id uuid FK NULL` | UC-A7 | Aprovado D7 |
| 14 | `updated_by uuid NULL`, `updated_at timestamp NULL` em `routes`, `schedules`, `users`, `cooperatives`, `cities` (10 colunas) | UC-A6 | Aprovado D7 |
| 15 | `delays.resolved_by uuid NULL`, `delays.resolved_at timestamp NULL` | UC-F4 | Aprovado D8 |
| 16 | `routes.announcement_text varchar(280) NULL`, `routes.announcement_expires_at timestamp NULL` | UC-F1 | Aprovado D8 |
| 17 | Tabela nova `announcements` | UC-A16 | Aprovado D7 |
| 18 | Tabela nova `announcements_reads` | UC-A16 | Aprovado D7 |
| 19 | Tabela nova `operational_events` (sem anexos) | UC-4.5 | Aprovado D9 |

**Total:** 12 (base canônica) + 7 (novas) = 19 mudanças de schema aditivas aprovadas.

### 7.3 Endpoints novos aprovados

| # | Endpoint | UC |
|---|----------|-----|
| 1 | `POST /api/admin/schedules-exceptions/bulk` | UC-A1, UC-A2 |
| 2 | Query param `driver_id` em `GET /api/admin/schedules` | UC-A1 |
| 3 | `POST /api/admin/routes/:id/duplicate` com `include_schedules` | UC-A3 |
| 4 | `GET /api/admin/routes/:id/impact-summary` | UC-A4 |
| 5 | `GET /api/admin/cooperatives/:id/impact-summary` | UC-A4 |
| 6 | `GET /api/admin/cities/:id/impact-summary` | UC-A4 |
| 7 | `POST /api/admin/users/:driver_id/reassign-routes` | UC-A8 |
| 8 | Query param `driver_status=inactive` em `GET /api/admin/routes` | UC-A10 |
| 9 | `POST /api/admin/announcements`, `GET /api/announcements/mine`, `POST /api/announcements/:id/read`, `GET /api/admin/announcements/:id/reads` | UC-A16 |
| 10 | `POST /api/admin/operational-events`, `GET /api/admin/operational-events` | UC-4.5 |
| 11 | `POST /api/admin/schedules/:id/check-in` (shortcut para `operational_events`) | UC-4.5 / A14 |
| 12 | `PATCH /api/admin/delays/:id/resolve`, `PATCH /api/admin/delays/:id/reopen` | UC-F4 |
| 13 | Campos novos em response de `GET /api/schedules` e `GET /api/routes/:id` para `announcement_text`/`announcement_expires_at` | UC-F1 |

---

## 8. Roadmap em Ondas

Reorganizado com base em: valor × dependência de contrato × complexidade.

### 8.1 Pré-backend — Front puro (opcional, antes de iniciar back)

Itens que destravam valor sem bloquear o backend. **Nenhum item desta onda muda contrato.**

| # | UC | Esforço | Justificativa |
|---|-----|---------|---------------|
| 1 | UC-P4+PA2 — Tabs "Partindo Agora/Próximos/Decorridos" + habilitar filtro date/dayOfWeek no mock | 2d | Alto valor para passageiro público, zero contrato |
| 2 | UC-PA1 — Banner de cancelamento em favoritos | 0.5d | Alto valor, zero contrato |
| 3 | Higiene mock: auto-filtro `cooperative_id` nas páginas compartilhadas (RoutesPage/SchedulesPage) para role `cooperative` | 0.5d | Comportamento que backend vai enforçar; mock fica alinhado |

### 8.2 Onda 1 — Contrato novo que entra JUNTO com backend inicial

Itens que **mudam contrato** (adicionam campos ou endpoints) e devem estar decididos antes do primeiro commit do backend. Já aprovados em D7-D10.

| # | UC | Esforço | Impacto schema |
|---|-----|---------|---------------|
| A1 | Cancelar N horários em janela | 5-7d | Endpoint bulk novo + query param |
| A2 | Exceção em intervalo (recesso) | 2d | Reusa endpoint bulk de A1 |
| A6 | `updated_by`/`updated_at` embrionário | 2d | 10 colunas (5 tabelas × 2) |
| A7 | Horário temporário com substituto | 2d | 1 coluna em `schedules_temporary` |
| A10 | Sinalizar rotas órfãs | 1d | 1 query param + 1 KPI |
| A13 | Histórico próprio do motorista | 1d | Zero (endpoint já existe) |
| A17 | Command palette | 2d | Zero (front puro) |
| A18 | Deep-links nomeados + UC-F4 | 2d | 2 colunas em `delays` + 2 endpoints |
| F1 | Aviso cooperativa→passageiro | 2d | 2 colunas em `routes` |

**Total Onda 1:** ~20d. Rodam contra backend em desenvolvimento.

### 8.3 Onda 2 — Após MVP backend no ar

Itens que precisam do backend funcional antes de implementar.

| # | UC | Esforço |
|---|-----|---------|
| A3 | Duplicar rota com horários | 2d |
| A4 | Impacto pré-suspender | 2-3d |
| A8 | Reatribuir carga de motorista | 3d |
| A9 | Grade semanal | 3d |
| A15 + F2 | Reportar ausência (workaround + range parcial) | 2d |
| A16 | Broadcast interno mínimo | 3-4d |
| 4.5 | Operational events (incidentes + check-in) | 4-5d |

**Total Onda 2:** ~20d. Pós-MVP.

### 8.4 Backlog priorizado por gatilho (não ativo)

Reconsiderar **apenas** quando o gatilho real acontecer:

| Item | Gatilho reversor |
|------|------------------|
| 4.2 driver_absences formal | A15 degradado começar a poluir métricas de pontualidade |
| 5.6 Broadcast completo | A16 mínimo mostrar-se insuficiente |

### 8.5 Backlog nunca-reconsiderado (descartado firme)

Todos os itens de §6.1, §6.2 que não têm gatilho reversor. Não reavaliar sem decisão formal nova neste documento.

---

## 9. Convenções Técnicas Herdadas (PR1-PR13)

Mantidas obrigatoriamente em qualquer implementação nova.

### 9.1 Front-end

| Convenção | Fonte |
|-----------|-------|
| Componentes base: `AdminTable`, `AdminPagination`, `AdminKPICard`, `AdminActionMenu`, `AdminConfirmDialog`, `AdminEmptyState`, `AdminFilterBar` | PR7, PR9 |
| Status: `StatusChip` com `*_STATUS_META` (`SCHEDULE_STATUS_META`, `ROUTE_STATUS_META`, `USER_STATUS_META`) | PR3b |
| Severidade: `SeverityBadge` com `severityFromMinutes()` fonte única | PR2 |
| Pickers: `CooperativePicker` (id-based, com `brand_color`), `WeekdayPicker` (presets `multi`/`single`), `SearchableSelect` (genérico) | PR8 |
| Filtros: `useTableFilters` sobre `nuqs` (zero-indexed, `namespace` opcional) | PR7, PR11 |
| Forms: `useFormDialogState` para padrão modal com form | PR2 |
| Deep-link `?highlight=<uuid>` com scroll + pulse temporário + limpeza do param | PR10, PR11 |
| Row-click: `role="button"`, `tabIndex={0}`, Enter/Space, `focus-visible:ring-2`, `aria-label` | PR7 |
| Alvos ≥44×44px em ações primárias | PR1 em diante |
| Cor + ícone + texto em todo status | Design System |
| Flat design (sem shadow em cards; exceção: popover/dropdown/dialog) | Design System |
| Recharts só quando ≥15 pontos ou eixo contínuo real; CSS/flex para o resto | PR9 |
| Motion (framer motion): entradas escalonadas, transições de troca de contexto, feedback. Nunca em hover/focus | PR1 em diante |
| Catalogar componente novo em `components-preview` | PR3a em diante |

### 9.2 Back-end (`api-spec.md`)

| Convenção | Fonte |
|-----------|-------|
| Base URL sem versionamento (`/api/*`) | §1.1 |
| JWT: access token 15min + refresh token 7d com rotação | §1.4 |
| Paginação zero-indexed `page=0`, `limit=12` default (exceção `/admin/users` 1-indexed) | §1.5 |
| IDs sempre UUID v4 | §1.2 |
| Filtros: strings diretas, arrays comma-separated | §1.6 |
| Response de erro: `{ error: { code, message, details? } }` | §1.3 |
| CORS configurável, nunca `*` em produção | §1.9 |
| Rate limit sugerido: 60/min para `GET /schedules`, 120/min demais públicos | §1.8 |
| Backend enforça escopo por role via JWT (`cooperative` só vê próprio, `driver` só vê próprio) | §3.3, §3.4, §3.7 |
| Sensitive fields (email duplicado, UUID inválido) → 409 e 422 respectivamente | §1.7 |

### 9.3 Padrão de PRs

| Convenção | Fonte |
|-----------|-------|
| Cada PR tem seção "Feito quando" com checklist verificável | Plano melhorias |
| Cada PR novo cataloga componentes/features em `components-preview` | PR3a em diante |
| Delete do antigo no MESMO PR que cria o substituto (sem coexistência) | §5 plano melhorias |
| Testes de teclado (Tab + Enter + Space) obrigatórios em qualquer UI nova | Checklist §6 |
| `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes antes de commit | Padrão |

---

## 10. Referências

### 10.1 Documentos internos VanHora (canônicos)

- `VanHora Especificação.md` — PRD do produto
- `database.md` — Schema de banco
- `api-spec.md` — Contrato de API
- `design_system.md` — Guia de design e componentes
- `guia_inspiracao_vanhora.md` — Princípios de UX e inspirações
- `plano-melhorias-app-portal.md` — Histórico de PRs (PR1-PR13 + PR6)
- `auditoria-completude-2026-09.md` — Auditoria por persona
- `mapeamento-admin-logistica-2026-09.md` — Workflows reais mapeados

### 10.2 Regulamentação relevante

- [ARCE — Resolução 07/2021](https://www.legisweb.com.br/legislacao/?id=414627) — vistoria/renovação (contexto, não implementada)
- [ARCE — Resolução 05/2025](https://www.arce.ce.gov.br/wp-content/uploads/sites/53/2018/11/Resolucao-Arce-no-05-2025.pdf)
- [Lei 5.764/1971 (Cooperativismo)](https://www.planalto.gov.br/ccivil_03/leis/l5764.htm) — explicitamente FORA de escopo (D13)
- [DETRAN-CE — Programa Cid Gomes](https://www.detran.ce.gov.br/governador-cid-gomes-assina-ordem-de-servico-para-operacao-das-vans/) — contexto do público-alvo

### 10.3 Sistemas de referência (consultados, não copiados)

Transporte / escala: Moovit, Cittamobi, Buser, Praxio Globus, Vilesoft, WPLEX-EP, Cirux Escala, Prolog, Cobli
Operação motorista: Uber Driver, 99 Motorista, iFood Entregadores
Dashboard/compliance: Optibus, Swiftly, Samsara, Fleetio

---

## Apêndice A — Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2026-10-08 | Kaik | Consolidação inicial. Baseado em: PR1-PR13 + PR6 concluídos, auditoria 2026-09, mapeamento 2026-09, respostas Q1-Q5, aprovações F1/F2/F4, descartes D11-D17, julgamento em "a considerar" (4.5 in, 4.3/4.7/5.1/5.6 out). |

### A.1 Convenções de versionamento

- **Major (X.0.0):** mudança de decisão canônica (ex: posicionamento muda de "backoffice" para "ERP") ou escopo revertido em larga escala.
- **Minor (0.X.0):** adição de UC novo aprovado, nova mudança de schema aprovada, revisão de prioridade de ondas.
- **Patch (0.0.X):** correção de erro de redação, clarificação de regra existente, adição de referência.

Versionamento feito **exclusivamente via Git** (sem CHANGELOG.md separado). Toda mudança deste documento é um commit com mensagem descritiva do que mudou e por quê.

---

## Apêndice B — Como usar este documento

**Para gerar PRDs:**
1. Escolha o UC alvo em §5.
2. O PRD herda: Descrição + Objetivo + Regras de Negócio + Guia de Implementação + Escopo Negativo.
3. Adicione no PRD: user stories detalhadas, mocks de UI, critérios de aceite específicos, test cases.
4. Confira §6 (Escopo Negativo Consolidado) — qualquer item lá **não pode entrar** no PRD mesmo que pareça útil.
5. Confira §9 (Convenções Técnicas) — PRD deve explicitamente dizer quais convenções reusa.

**Para gerar tickets:**
1. Um UC = um épico. Fatias de implementação viram tickets filhos.
2. Cada ticket deve referenciar o UC original (`UC-A1`, `UC-F1`, etc.) e seu Escopo Negativo.
3. Ticket que escapa do Escopo Negativo precisa de **revisão deste documento** antes de ir para dev.

**Para decidir se uma feature nova entra:**
1. Está listada em §5 ou §6? Siga a decisão.
2. Não está em nenhum? → **Decisão formal necessária** antes de implementar. Atualize este documento (bump de versão minor) com a nova decisão (seção §3) e o novo UC (§5) ou escopo negativo (§6).

**Para o agente de implementação (anti-alucinação):**
- Nunca invente campo, endpoint, entidade ou feature que não esteja em §5 ou §7.
- Em dúvida sobre escopo, consulte §6 antes de escrever código.
- Se um UC parece pedir algo que o §6 proíbe (ex: notificação push, upload de arquivo), **pare e pergunte** — não implemente nenhum workaround.
- Toda convenção técnica em §9 é obrigatória; não "simplifique".
