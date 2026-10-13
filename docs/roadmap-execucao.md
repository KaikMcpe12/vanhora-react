# VanHora — Roadmap de Execução

> **Versão:** 1.1.0 — 2026-10-08
> **Status:** Mapa macro de execução das Fases Pré-backend, Onda 1 e Onda 2. Decisões Q1–Q10 formalizadas como D21–D30.
> **Fonte canônica (única):** `docs/vanhora-decisoes-e-casos-de-uso.md` v1.0.0. Toda decisão vem desse arquivo. §6 (Escopo Negativo) é lei — nenhum item descartado reaparece aqui.
> **Escopo deste arquivo:** apenas o mapa. **Não** contém PRDs, API-spec, migrations ou código. Esses são insumos de worktrees subsequentes.

---

## Índice

1. [Resumo executivo](#1-resumo-executivo)
2. [Dependências entre UCs](#2-dependências-entre-ucs)
3. [Fase 1 — Pré-backend](#3-fase-1--pré-backend)
4. [Onda 1 — Contrato + backend inicial](#4-onda-1--contrato--backend-inicial)
5. [Onda 2 — Pós-MVP backend](#5-onda-2--pós-mvp-backend)
6. [Riscos e pontos de atenção](#6-riscos-e-pontos-de-atenção)
7. [Critério de "fase concluída"](#7-critério-de-fase-concluída)
8. [Decisões Tomadas (Q1–Q10)](#8-decisões-tomadas-q1q10)
9. [Apêndice A — Histórico de Revisões](#apêndice-a--histórico-de-revisões)

---

## 1. Resumo executivo

- **Volume total em escopo:** 20 UCs organizados em 3 fases, derivados exclusivamente de `vanhora-decisoes-e-casos-de-uso.md` §5 e consolidados em §8. UC-P1 e UC-P2 incorporados na Onda 1 por D21 (v1.1.0).
- **Backend ainda não começou** (§2.2 base). A Fase 1 (Pré-backend) destrava valor zero-contrato enquanto o backend é iniciado em paralelo. Onda 1 entra junto com o backend inicial (todos os 19 aditivos de schema de §7 são implementados nessa fase + 2 endpoints novos de D21 para UC-P1/P2). Onda 2 só avança depois do MVP do backend em produção.
- **Esforço estimado agregado (revisto por D28):** Fase 1 ≈ 3 dias; Onda 1 ≈ 22–25.5 dias (inclui +2d de UC-P1/P2); Onda 2 ≈ 20–26 dias.
- **Princípio de simplicidade preservado:** não há entidade nova fora das 3 aprovadas (`announcements`, `announcements_reads`, `operational_events`) e das 2 colunas aditivas em `delays`, `routes`, `schedules_temporary`. Workarounds degradados (A15, F2) permanecem como workaround — não viram entidade.
- **Dependência crítica:** UC-A2 reusa o endpoint `POST /api/admin/schedules-exceptions/bulk` do UC-A1. UC-A1 é pré-requisito duro de UC-A2 (confirmado em D26: dois PRDs separados). O resto da Onda 1 é majoritariamente paralelo. Onda 2 depende da estabilidade do CRUD base da Onda 1.

---

## 2. Dependências entre UCs

Grafo em texto. Toda dependência é entre UCs **em escopo** (20 bundles após D21). Setas `→` indicam "pré-requisito duro". Setas `~>` indicam "acoplamento recomendado" (não bloqueia, mas convém sincronizar).

### 2.1 Fase 1 — Pré-backend

```
P4+PA2 (inclui UC-P3 como side-effect: filtro date/dayOfWeek destravado no mock)
PA1
higiene-mock (filtro automático cooperative_id em páginas compartilhadas)

→ Nenhuma dependência entre si. Rodam 100% em paralelo.
→ Nenhuma dependência de backend (toda Fase 1 vive sobre mocks).
```

### 2.2 Onda 1 — Contrato + backend inicial

```
Pré-requisito transversal: início do backend com migrations §7.1 (12 itens herdados do api-spec)
                           + JWT (access 15min / refresh 7d) + CORS + role scoping.

Bloco P — Pré-existentes do PRD, puro front sobre endpoint novo do backend inicial (D21):
    P1  — /about consome GET /api/cities/served           (endpoint entra no backend inicial)
    P2  — PopularRoutesSection consome GET /api/destinations/popular
          └ Nenhuma dependência interna; podem subir junto com Bloco Z.

Bloco Z — zero contrato novo (podem subir primeiro, destravam valor para motorista/admin):
    A13 — Histórico próprio motorista       (reusa GET /admin/delays?reported_by=self)
    A17 — Command palette (Cmd+K)            (catálogo estático, sem backend)

Bloco S — contrato aditivo, independentes entre si:
    A6  — updated_by/updated_at (10 colunas × 5 tabelas, 1 middleware)
    A7  — schedules_temporary.driver_id
    A10 — Rotas órfãs (filtro + KPI)
    F1  — announcement_text + announcement_expires_at em routes

Bloco D — dependência interna (sequencial):
    A1 → A2
      │   └ A2 reusa POST /api/admin/schedules-exceptions/bulk introduzido por A1.
      │     A2 pode começar design/UI (RecessModal, CooperativePicker) em paralelo
      │     a A1, mas integração/testes só após endpoint estável.
      │
    A18 (bundle A18 + F4)
      │   └ Mesma onda, mesmo bundle (§8.2 doc base). F4 adiciona colunas em delays
      │     + endpoints resolve/reopen; A18 lê ?today/?mine.
      │     A17 ~> A18 (command palette pode listar atalhos ?today/?mine como comandos).

Acoplamentos cross-bloco:
    A6  ~> toda operação de PUT/PATCH em qualquer UC a partir daqui carrega updated_by/updated_at.
           Entrar cedo na onda minimiza retrabalho de infra.
    A17 ~> A18 (soft, descrito acima).
    A10 ~> A8 (Onda 2): a visibilidade de rota órfã criada por A10 é a trigger natural
                       para o fluxo de reatribuição de A8.
```

### 2.3 Onda 2 — Pós-MVP backend

```
Pré-requisito transversal: MVP do backend em produção com CRUD estável de
                           routes, schedules, cooperatives, cities, users, delays.
                           Todas migrations da Onda 1 (§7.2 itens 13–16) aplicadas.

A3  — Duplicar rota com horários
      → requer CRUD de routes + schedules estável.
      → novo endpoint POST /api/admin/routes/:id/duplicate.

A4  — Impacto pré-suspender
      → requer CRUD estável de routes, cooperatives, cities.
      → 3 endpoints novos (impact-summary por entidade).

A8  — Reatribuir carga de motorista
      → requer CRUD de users + routes estável.
      → novo endpoint POST /api/admin/users/:driver_id/reassign-routes.
      ~> A6 (updated_by registrará quem fez a reatribuição).
      ~> A10 (origem natural do gatilho; A10 pode linkar diretamente para o modal de A8).

A9  — Grade semanal
      → zero contrato novo. Agregação client-side sobre GET /admin/schedules.
      → requer apenas que GET /admin/schedules esteja estável e paginável.

A15+F2 — Reportar ausência (workaround degradado + range parcial)
      → reusa POST /api/admin/schedules-exceptions existente (NÃO o /bulk).
      → requer schedules-exceptions endpoint estável.
      → prefixo "AUSÊNCIA:" aplicado pelo backend quando reported_by.role = 'driver'.

A16 — Broadcast interno mínimo
      → 2 tabelas novas (announcements, announcements_reads).
      → 4 endpoints novos.
      → independente dos demais UCs da Onda 2.

4.5 — Operational events (incidentes ≠ atraso + check-in A14)
      → 1 tabela nova (operational_events).
      → 3 endpoints novos (POST, GET, POST check-in shortcut).
      → convive com delays.cause='mechanical' (D sem deprecar — ver riscos §6).
      ~> coop board (PR5) ganha coluna "Iniciou" alimentada por trip_started.
```

### 2.4 Síntese: cobertura dos 20 UCs em escopo

| Fase | UCs (bundles contam como 1 por D30) | Qtd |
|------|-------------------------------------|-----|
| Fase 1 | UC-P4+PA2, UC-PA1 | 2 |
| Onda 1 | UC-P1, UC-P2, UC-A1, UC-A2, UC-A6, UC-A7, UC-A10, UC-A13, UC-A17, UC-A18+F4, UC-F1 | 11 |
| Onda 2 | UC-A3, UC-A4, UC-A8, UC-A9, UC-A15+F2, UC-A16, UC-4.5 | 7 |
| **Total** | | **20** |

Delta vs v1.0.0: +2 UCs (UC-P1, UC-P2) incorporados na Onda 1 por D21.

Nenhum item descartado em §6 do documento base aparece neste grafo. Confirmado contra §6.1 (10 features), §6.2 (14 entidades), §6.3 (10 regras globais).

---

## 3. Fase 1 — Pré-backend

**Objetivo:** destravar valor no front enquanto o backend é iniciado em paralelo. Nenhum item desta fase muda contrato.

**Ordem sugerida:** 100% paralela. Nenhuma dependência interna. Se houver apenas 1 dev disponível, a ordem recomendada é a tabela abaixo (de maior valor absoluto para menor).

### 3.1 Itens

| # | UC / Chore | Esforço (base) | Esforço revisto | Justificativa de divergência |
|---|-----------|----------------|-----------------|------------------------------|
| 1 | **UC-P4+PA2** — Tabs "Partindo Agora / Próximos / Decorridos" + habilitar filtro `date`/`dayOfWeek` no mock (absorve UC-P3) | 2d | 2d | Confirmado. §5.1 UC-P3 fica implicitamente coberto pela remoção dos TODOs em `mock-schedules-api.ts:71,111`. |
| 2 | **UC-PA1** — Banner de cancelamento em favoritos (`HomeFeedSection`) | 0.5d | 0.5d | Confirmado. Lógica puramente client-side sobre `localStorage`. |
| 3 | **Higiene mock** — auto-filtro `cooperative_id` nas páginas compartilhadas (RoutesPage/SchedulesPage) para role `cooperative` | 0.5d | 0.5d | Confirmado. Alinha mock com comportamento JWT que o backend vai enforçar (`api-spec.md §3.3`). |

**Total:** 3d (sem paralelismo). Com 2 devs: 2d.

### 3.2 Critério de "pronto" por item

- **UC-P4+PA2:**
  - 3 abas visíveis em `/schedules` com peso visual distinto (Decorridos em `muted`).
  - Tab default derivada do horário atual (se há schedules em "Partindo Agora", abre nessa; senão abre "Próximos").
  - Tab persistida via `?tab=now|next|past` (nuqs).
  - Filtro `date` e `dayOfWeek` aplica no mock sem TODOs residuais (grep: zero ocorrências de `TODO` em `src/lib/api/mock-schedules-api.ts`).
  - Empty state honesto quando filtros zeram a tab ativa + CTA "Ver Próximos".
  - Re-render com `useInterval` de 60s para re-categorizar schedules em fronteira de janela.
  - Catalogado em `/admin/components-preview` (padrão PR3a em diante).
  - `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- **UC-PA1:**
  - Banner renderiza na `HomeFeedSection` apenas se ≥1 favorito com `badge: "cancelled"` para hoje.
  - Mensagem adapta plural: "1 dos seus favoritos" vs "N dos seus favoritos".
  - Clique leva a `/schedules/favorites?status=cancelled`.
  - Dispensa via `X` persiste `localStorage.vanhora_cancelled_banner_dismissed=<today>` com reset diário.
  - Tom `warning` (amarelo suave) + ícone `AlertCircle` via `StatusChip` existente.
  - Zero favoritos → não chama endpoint.
  - API falhando → banner silencioso (log console, sem toast).
- **Higiene mock:**
  - Role `cooperative` nunca vê rotas/schedules de outra cooperativa em `/cooperative/routes` e `/cooperative/schedules`.
  - Filtro aplicado antes de qualquer `useTableFilters` consumir a lista (`cooperative_id` fica fora da URL).
  - Admin não é afetado (continua vendo tudo).
  - Zero regressão nos testes de navegação Tab/Enter/Space das páginas tocadas.
  - Deixa documentado no mock que o backend vai enforçar o mesmo via JWT (`api-spec.md §3.3, §3.4, §3.7`).

---

## 4. Onda 1 — Contrato + backend inicial

**Objetivo:** entregar os 11 UCs da Onda 1 (9 que mudam contrato + 2 pré-existentes do PRD incorporados por D21), acoplados ao primeiro deploy funcional do backend. Todas as 7 novas mudanças de schema de §7.2 do documento base são aplicadas nesta onda, junto com as 12 mudanças herdadas de §7.1. **D21** adiciona 2 endpoints novos ao backend inicial (`GET /api/cities/served`, `GET /api/destinations/popular`).

**Pré-requisito transversal:** início do backend com migrations §7.1 aplicadas + JWT + CORS + role scoping funcionando em dev. Backend inicial precisa expor os 2 endpoints de D21 para que UC-P1 e UC-P2 possam consumir.

### 4.1 Agrupamento por paralelismo

#### Bloco P — Pré-existentes do PRD (puro front sobre endpoint do backend inicial — D21)

| UC | Esforço (base) | Esforço revisto | Nota |
|----|----------------|-----------------|------|
| **UC-P1** — `/about` consome `GET /api/cities/served` | — | 1d | Hook `useCitiesServed()` com React Query, substituir constante hardcoded em `about.tsx`, fallback silencioso em erro. Backend inicial expõe o endpoint (D21). **Destrava consumer de `cities.photo_url`** (resolve R9). |
| **UC-P2** — `PopularRoutesSection` consome `GET /api/destinations/popular` | — | 1d | Hook `usePopularDestinations({ limit, date })`, substituir array hardcoded, loading com skeleton de 6 cards, fallback estático em erro. |

#### Bloco Z — Zero contrato novo (podem subir primeiro)

| UC | Esforço (base) | Esforço revisto | Nota |
|----|----------------|-----------------|------|
| **UC-A13** — Histórico próprio do motorista (`/driver/my-delays`) | 1d | 1d | Reusa `GET /admin/delays?reported_by=self` existente + `AdminTable` + `SeverityBadge`. Entrega rapidíssima; subir primeiro para dar win cedo ao motorista. |
| **UC-A17** — Command palette (Cmd+K) | 2d | 2–3d | Catálogo estático em `src/lib/command-palette/commands.ts`. Divergência: integrar com `cmdk` + filtro por role + testes de teclado pode escalar para 3d. Ainda zero backend. |

#### Bloco S — Contrato aditivo, independentes entre si

| UC | Esforço (base) | Esforço revisto | Nota |
|----|----------------|-----------------|------|
| **UC-A6** — `updated_by` / `updated_at` embrionário (5 tabelas × 2 colunas = 10 colunas) | 2d | 2d | Middleware Fastify `onRequest` extrai `jwt.sub` + 1 label novo no detalhe de cada entidade. Entrar **cedo** na onda para que todo PUT/PATCH subsequente da Onda 1 já grave a trilha (minimiza retrabalho). |
| **UC-A7** — `schedules_temporary.driver_id` (motorista substituto em serviço extra) | 2d | 2d | 1 coluna aditiva + validação de pertencimento à cooperativa na camada de aplicação + campo no `ExceptionModal` modo "Serviço extra". |
| **UC-A10** — Sinalizar rotas órfãs (motorista inativo) | 1d | 1.5d | Divergência: 1d é apertado — exige query param novo em `GET /admin/routes` + KPI em 2 dashboards (admin e cooperativa) + badge âmbar no `RouteCard`. Realista 1.5d. |
| **UC-F1** — Aviso da cooperativa para passageiro público | 2d | 2d | 2 colunas em `routes` (nullable, cross-field validation) + edição em `RouteFormDrawer` + banner compacto em `ScheduleCard` + bloco destacado em `/routes/:id`. |

#### Bloco D — Dependência interna (sequencial)

| UC | Esforço (base) | Esforço revisto | Nota |
|----|----------------|-----------------|------|
| **UC-A1** — Cancelar N horários de motorista em janela de datas | 5–7d | 5–7d | O item mais pesado da onda. Introduz `POST /api/admin/schedules-exceptions/bulk` (reusado por A2) + query param `driver_id` + `AdminBulkBar` novo + `BulkExceptionModal` + checkbox nas rows + response 207 (multi-status). |
| **UC-A2** — Exceção em intervalo de datas (recesso) | 2d | 2d | **Depende de UC-A1** (reusa endpoint `/bulk`). UI (`RecessModal` + `DateRangeField`) pode ser desenhada em paralelo; integração/testes só após A1 estabilizar. |
| **UC-A18 + UC-F4** (bundle) — Deep-links nomeados + resolved_by | 2d | 2.5–3d | Divergência: bundle real cobre colunas aditivas em `delays` (`resolved_by`, `resolved_at`) + `PATCH /:id/resolve` + `PATCH /:id/reopen` + leitor `?today`/`?mine` + 2 itens de menu + botão "Marcar como resolvido" no `delay-detail-dialog`. 2d subestima; realista 2.5–3d. |

### 4.2 Esforço total revisto

| Agrupamento | Base | Revisto |
|-------------|------|---------|
| Bloco P (D21) | — | 2d |
| Bloco Z | 3d | 3–4d |
| Bloco S | 7d | 7.5d |
| Bloco D | 9–11d | 9.5–12d |
| **Total Onda 1** | **~20d** | **~22–25.5d** |

### 4.3 Sequência recomendada (com 2 devs em paralelo)

```
Semana 1:
  Dev1: A6 (middleware entra cedo → benefício para toda a onda)
  Dev2: A1 (item mais pesado, começar cedo)

Semana 2:
  Dev1: A13 → A17 → P1 → P2 → A10
         (P1 e P2 só começam após backend expor GET /cities/served e /destinations/popular)
  Dev2: A1 (conclusão) → A2 (dependente de A1)

Semana 3:
  Dev1: F1 → A7
  Dev2: A18+F4

Semana 4: estabilização + catalogação em components-preview + revisões cruzadas.
```

Com 1 dev: executar na ordem P → Z → S → D (P depende de endpoint pronto; Z/S/D minimizam bloqueio esperando backend).

---

## 5. Onda 2 — Pós-MVP backend

**Objetivo:** entregar os 7 UCs que exigem o MVP do backend já em produção estável.

**Pré-requisito transversal:** MVP do backend em produção. CRUD de routes/schedules/cooperatives/cities/users/delays estável. Dívidas técnicas §3.5 do documento base resolvidas (renames `drive_id→driver_id`, `date_ata→created_at`, cache de rating materializado etc.).

### 5.1 Agrupamento por paralelismo

Todos os UCs da Onda 2 são **independentes entre si** no plano de contrato. Dois acoplamentos recomendados (não bloqueantes) estão em §2.3.

#### Agrupamento operacional

| Grupo | UCs | Racional |
|-------|-----|----------|
| **G1 — Admin produtividade** | A3, A4, A9 | Melhoram fluxo diário do admin/cooperativa. Zero (A9) ou pouca (A3, A4) tabela nova. Podem ir em paralelo. |
| **G2 — Motorista + reatribuição** | A8, A15+F2 | Cobrem o eixo "motorista fora" (A15) e "redistribuir trabalho" (A8). Acoplados por fluxo real, não por contrato. |
| **G3 — Entidades novas** | A16, 4.5 | Cada um adiciona tabela(s) nova(s) com CRUD próprio. Carga maior. Podem ir em paralelo entre si. |

### 5.2 Detalhamento com esforço revisto

| UC | Esforço (base) | Esforço revisto | Nota |
|----|----------------|-----------------|------|
| **UC-A3** — Duplicar rota com horários | 2d | 1.5–2d | PR10 já tem "Duplicar rota". Este UC adiciona apenas checkbox "Copiar N horários" + endpoint novo com transação. Pode cair abaixo de 2d. |
| **UC-A4** — Impacto pré-suspender (rota / cooperativa / cidade) | 2–3d | 2–3d | Confirmado. 3 endpoints GET + prop nova em `AdminConfirmDialog` + fallback silencioso em erro de impact-summary. |
| **UC-A8** — Reatribuir carga de trabalho de motorista | 3d | 3–4d | Divergência: endpoint transacional + `DriverReassignmentModal` acessível de 2 lugares (linha de usuário + aba Motoristas do master-detail de cooperativa) + preview + edge case de versão stale. Realista 3–4d. |
| **UC-A9** — Grade semanal (visão temporal) | 3d | 2.5–3d | Zero backend. Agregação client-side via `useMemo`. Mobile stack vertical adiciona esforço de responsividade. |
| **UC-A15 + UC-F2** (bundle) — Reportar ausência + range parcial | 2d | 2–3d | Reusa endpoint existente (não `/bulk`). `DriverAbsenceModal` com single date OU range + "Dia todo" OU range de horário. `Promise.allSettled` em loop. Edge case meia-noite (não suporta — dividir em 2 ausências). |
| **UC-A16** — Broadcast interno mínimo | 3–4d | 4–5d | Divergência: 2 tabelas novas + 4 endpoints + banner no topo do portal (max 1 simultâneo) + CRUD page admin + CRUD page cooperativa + visibilidade de reads para emissor. Realista 4–5d. |
| **UC-4.5** — Operational events (incidentes ≠ atraso + check-in A14) | 4–5d | 5–6d | Divergência: 1 tabela nova + 3 endpoints (POST, GET, POST check-in shortcut) + UI motorista (botão separado de "Reportar atraso") + coluna "Iniciou" no board da coop + 2 páginas novas de CRUD (admin + cooperativa) + convivência explícita com `delays.cause='mechanical'`. Realista 5–6d. |

### 5.3 Esforço total revisto

| Grupo | Base | Revisto |
|-------|------|---------|
| G1 (A3+A4+A9) | 7–8d | 6–8d |
| G2 (A8+A15/F2) | 5d | 5–7d |
| G3 (A16+4.5) | 7–9d | 9–11d |
| **Total Onda 2** | **~20d** | **~20–26d** |

### 5.4 Sequência recomendada (com 2 devs)

```
Semana 1–2:
  Dev1: A9 → A3 → A4
  Dev2: A16 (iniciar cedo pelo peso)

Semana 3:
  Dev1: A8
  Dev2: A16 (conclusão) → A15+F2

Semana 4–5:
  Dev1: 4.5
  Dev2: 4.5 (parear no CRUD de 2 páginas) → estabilização.
```

---

## 6. Riscos e pontos de atenção

### 6.1 Riscos de produto / escopo

| # | Risco | UC(s) afetado(s) | Mitigação sugerida |
|---|-------|------------------|-------------------|
| R1 | **UC-4.5 convive com `delays.cause='mechanical'`** sem deprecação (§5.4 doc base, "NÃO depreciar"). Ambiguidade real para motorista: "quebrou e parou" é `vehicle_breakdown`; "atrasou 20min por mecânica" é `delays.cause='mechanical'`. Risco de dupla entrada e métricas inconsistentes. | UC-4.5 | Explicar em UI/microcopy do motorista: "Parou totalmente?" → evento; "Atrasou mas vai operar?" → atraso. Documentar em `/admin/components-preview` com exemplo. |
| ~~R2~~ | **RESOLVIDO por D23 (v1.1.0):** D4 definido como opção (c) — campo opcional no backend, front NÃO exibe até feature própria. Remover `18/22` do mock no mesmo PR que resolver a dívida. Movido para §6.4 "Riscos resolvidos". | — | — |
| R3 | **UC-A16 política de retenção** (deletar aviso com `expires_at < now() - 90d` via job batch) — **D27 (v1.1.0): NÃO implementar na Onda 2**, vira dívida operacional em §3.5 do doc base. | UC-A16 | Decisão formalizada. Reavaliar apenas se operação apontar necessidade. |
| R4 | **UC-4.5 severidade** — **D24 (v1.1.0):** derivada do `type` por default + override manual permitido APENAS se `type='other'`. Backend valida; UI oculta campo de severidade quando `type ≠ 'other'`. | UC-4.5 | Decisão formalizada. Aplicar no PRD de UC-4.5. |
| R5 | **UC-A1 vs UC-A2 limites de range divergem** — A1 rejeita range > 90 dias; A2 (recesso) sugere limite 60 dias. Dois limites coabitando no mesmo endpoint `/bulk`. | UC-A1, UC-A2 | Discriminar no endpoint por presença de `schedule_ids` (A1, limite 90d) vs `route_ids` (A2, limite 60d) — já previsto em §5.2 doc base. Documentar explicitamente no PRD. |
| R6 | **UC-A6 campo `password_hash`** dispara `updated_at` — decisão aceita no doc base (§5.2 UC-A6: "qualquer mudança é mudança"), mas gera "ruído" visual no detalhe do usuário quando a última ação foi troca de senha. | UC-A6 | UI mostra apenas "por {nome} em {data}" — não revela o campo alterado (nunca mostrar diff). Risco baixo, mitigado por design. |
| R7 | **UC-A17 Cmd+K pode colidir com atalhos nativos do browser** (Firefox em alguns OS). | UC-A17 | Documentar em `/admin/components-preview`. Oferecer fallback `Ctrl+/` ou similar se detectar colisão. Baixa prioridade. |
| R8 | **UC-A18 + F4 fluxo de "re-abrir"** permite admin A resolver e admin B reabrir indefinidamente (loop sem auditoria granular). | UC-F4, UC-A6 | UC-A6 (`updated_by`/`updated_at` em `delays`) cobre indiretamente — última ação registrada. Aceitar. |
| ~~R9~~ | **RESOLVIDO por D21 (v1.1.0):** UC-P1 entra na Onda 1 e passa a ser o consumer natural de `cities.photo_url`. Nota: o próprio UC-P1 §5.1 do doc base ainda marca `photo_url` como escopo negativo *daquele UC específico*; o consumer efetivo da coluna fica como item de reavaliação quando houver dado real. Risco de "código morto" temporariamente mitigado pela presença do UC-P1. Movido para §6.4 "Riscos resolvidos". | — | — |
| R10 | **UC-A10 (rotas órfãs) vira trigger natural de UC-A8** (reatribuição) — mas estão em ondas diferentes. Entre Onda 1 e Onda 2, badge "Motorista afastado — reatribuir" aponta para... nada. | UC-A10, UC-A8 | Na Onda 1, badge de A10 leva para `/admin/users?user=<driver_id>` (ação manual). Quando A8 entra na Onda 2, badge passa a abrir o `DriverReassignmentModal` direto. |

### 6.2 Riscos técnicos / infra

| # | Risco | Mitigação |
|---|-------|-----------|
| R11 | **Fase 1 vs backend em paralelo:** se o backend introduzir contrato diferente do mock durante a Fase 1, há retrabalho. | Fase 1 só mexe em UI puramente client-side (P4+PA2, PA1, higiene mock de role) — nenhum item depende de contrato do backend. Risco baixo. |
| R12 | **Esforço de UC-A1 (5–7d) é 25% da Onda 1 inteira.** Se atrasar, a onda inteira atrasa. | Começar A1 na semana 1. Ter 1 dev dedicado. Design do `AdminBulkBar` + `BulkExceptionModal` pode começar antes do endpoint estar pronto (mock no front). |
| R13 | **UC-4.5 tabela `operational_events` pode crescer rápido** (schedules × dias × motoristas). | §5.4 doc base sugere particionamento por `occurrence_date` se >1M registros/ano. Não implementar particionamento na Onda 2 — monitorar. |
| R14 | **UC-A16 banner com 1 aviso simultâneo** — se cooperativa + admin publicam no mesmo instante, só o mais recente aparece. Pode haver confusão. | §5.3 doc base é explícito: 1 simultâneo + lista "Avisos" no menu lateral. UI deve deixar isso visível (contador). |
| R15 | **Dependência de componentes `components-preview`:** cada PR novo cataloga. Se não disciplinar, documentação apodrece. | Checklist de "Feito quando" obrigatório. Já previsto em §9.3 doc base. |

### 6.3 Dependências externas que não estão sob controle

- **Backend inicial não começou (§2.2 doc base).** Toda Onda 1 depende do backend arrancar. Se backend atrasar, Onda 1 inteira trava. Fase 1 continua rodando contra mocks.
- **Dívidas técnicas §3.5 doc base** (renames, materializações, colunas ausentes) precisam ser **todas** parte da migration inicial do backend. Esquecer qualquer uma delas gera retrabalho na Onda 1.

### 6.4 Riscos resolvidos (histórico v1.0.0 → v1.1.0)

| # | Risco original | Resolvido por | Observação |
|---|----------------|---------------|------------|
| R2 | D4 — origem do dado "passageiros" no driver sem decisão formal | D23 (opção c: campo opcional no backend, não exibido no front) | Remover `18/22` do mock no PR que aplicar D23. |
| R9 | `cities.photo_url` sem consumer na Onda 1 | D21 (UC-P1 entra na Onda 1) | O escopo negativo original de UC-P1 §5.1 permanece: `photo_url` como consumer efetivo da coluna é item de reavaliação futura. A coluna deixa de ser "código morto" imediato. |

---

## 7. Critério de "fase concluída"

Cada fase tem um conjunto fechado de condições. Enquanto **todas** não estiverem verdes, não passa para a próxima.

### 7.1 Fase 1 concluída quando

- [ ] 3 itens em `main` (UC-P4+PA2, UC-PA1, higiene mock).
- [ ] Zero TODOs em `src/lib/api/mock-schedules-api.ts` relacionados a filtro `date`/`dayOfWeek`.
- [ ] `/schedules` abre em tab default correta baseada no horário atual, com persistência via `?tab=`.
- [ ] Banner de cancelamento de favoritos renderiza/dispensa conforme §5.1 UC-PA1 doc base.
- [ ] Role `cooperative` não vê dados de outra cooperativa em `/cooperative/routes` nem `/cooperative/schedules` no mock.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- [ ] Testes de teclado (Tab, Enter, Space) manuais nas rotas tocadas — sem regressão.
- [ ] Catalogação em `/admin/components-preview` atualizada (componentes novos: tabs públicas, banner de cancelamento).
- [ ] Auditoria de completude §2.3 doc base — ressalvas do passageiro ("PR-A banner + PR-B tabs") passam de "fracas antes do backend" para "cumprem".

### 7.2 Onda 1 concluída quando

- [ ] Backend MVP em produção (não só dev) com os 12 endpoints base + os 13 endpoints novos de §7.3 doc base aplicáveis à Onda 1 (bulk, duplicate NÃO, impact-summary NÃO, reassign NÃO, driver_status filtro, announcements NÃO, operational-events NÃO, check-in NÃO, delays resolve/reopen, routes announcement campos) **+ 2 endpoints novos de D21 (`GET /api/cities/served`, `GET /api/destinations/popular`)**.
- [ ] Migrations §7.1 (12 itens herdados) + §7.2 itens 13, 14, 15, 16 aplicadas em produção.
- [ ] Dívidas técnicas §3.5 doc base **todas** resolvidas na migration inicial (renames, materializações, colunas ausentes). `cities.photo_url` entra; consumer efetivo é item de reavaliação futura (ver §6.4).
- [ ] 11 UCs em `main` (P1, P2, A1, A2, A6, A7, A10, A13, A17, A18+F4, F1).
- [ ] UC-P1 e UC-P2 consomem endpoints reais (não mais hardcoded em `about.tsx` e `PopularRoutesSection`).
- [ ] **Decisão D23 aplicada:** campo "passageiros" removido do front (`/meus-horarios` e qualquer outro consumer de mock que o exiba — grep `18/22` ou `passengers` no front do driver).
- [ ] JWT (access 15min + refresh 7d) + CORS + role scoping funcionando em produção.
- [ ] Middleware `updated_by`/`updated_at` cobre **todas** as 5 tabelas listadas em §5.2 UC-A6 (routes, schedules, users, cooperatives, cities) — não só algumas.
- [ ] `AdminConfirmDialog` com confirmação typed continua obrigatório mesmo com impacto zero (padrão PR9/PR10/PR11 preservado).
- [ ] Todos os componentes novos catalogados em `/admin/components-preview` (AdminBulkBar, BulkExceptionModal, RecessModal, DriverReassignmentModal — este último entra na Onda 2, mas pode já ter stub, DateRangeField, CommandPalette).
- [ ] Zero item descartado em §6 doc base implementado "por acidente" (grep nos PRs da onda).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes em todos os PRs mergeados.
- [ ] Testes de teclado nas UIs novas (A17 em primeiro lugar — command palette depende de teclado).

### 7.3 Onda 2 concluída quando

- [ ] 7 UCs em `main` (A3, A4, A8, A9, A15+F2, A16, 4.5).
- [ ] Migrations §7.2 itens 17, 18, 19 aplicadas em produção (announcements, announcements_reads, operational_events).
- [ ] Endpoints novos §7.3 doc base itens 3, 4, 5, 6, 7, 9, 10, 11 implementados e documentados em `api-spec.md`.
- [ ] CRUD de `/admin/announcements`, `/cooperative/announcements`, `/admin/operational-events`, `/cooperative/operational-events` funcionando.
- [ ] Banner de aviso (UC-A16) no topo do portal (fora do público) com max 1 simultâneo + lista "Avisos" no menu.
- [ ] Botão "Iniciar viagem" (UC-4.5 shortcut `trip_started`) no `CurrentTripCard` do motorista.
- [ ] Coluna "Iniciou" com relógio no board "Agora" da cooperativa (PR5) alimentada por `trip_started`.
- [ ] Convivência explícita entre `delays.cause='mechanical'` e `operational_events.type='vehicle_breakdown'` documentada em `/admin/components-preview` + microcopy em UI motorista.
- [ ] Todos os componentes novos catalogados em `/admin/components-preview`.
- [ ] Política de retenção de avisos (UC-A16) **NÃO** implementada nesta onda — conforme D27 (vira dívida operacional em §3.5 do doc base).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.

---

## 8. Decisões Tomadas (Q1–Q10)

> As 10 perguntas abertas da v1.0.0 foram resolvidas por Kaik em 2026-10-08 e formalizadas como D21–D30 nesta v1.1.0. Nenhuma pergunta permanece em aberto. Esta seção serve como registro histórico e ponte para a próxima worktree (geração de PRDs).

### D21 — UC-P1 e UC-P2 (resolve Q1)

- **Pergunta original (Q1):** UC-P1 e UC-P2 estão aprovados em §5.1 e §4.1 do doc base, mas não aparecem em nenhuma onda em §8 do doc base. Entram em qual fase?
- **Decisão:** UC-P1 e UC-P2 entram na **Onda 1**. Adicionar `GET /api/cities/served` e `GET /api/destinations/popular` ao backlog do backend inicial.
- **Impacto neste roadmap:**
  - §1 Resumo executivo: total passa a 20 UCs.
  - §2.2 Grafo: Bloco P novo documentado.
  - §2.4 Síntese: Onda 1 passa a 11 bundles; total 20.
  - §4.1 Agrupamento: Bloco P novo (1d cada).
  - §4.2 Esforço: +2d na Onda 1 (22–25.5d revistos).
  - §4.3 Sequência: P1/P2 encaixados na semana 2 do Dev1.
  - §6.4 R9 resolvido: `cities.photo_url` ganha consumer natural.

### D22 — UC-P3 absorvido (resolve Q2)

- **Pergunta original (Q2):** UC-P3 (filtro `date`/`dayOfWeek` funcional em `/schedules`) vira UC próprio ou fica absorvido em UC-P4+PA2?
- **Decisão:** UC-P3 **NÃO vira UC próprio**. Fica absorvido em UC-P4+PA2 (Fase 1, destravar mock) + obrigação implícita do backend inicial em `api-spec.md §2.1`.
- **Impacto neste roadmap:** nenhuma mudança estrutural (já estava assim). Confirmação para a próxima worktree: PRD de UC-P4+PA2 cobre o destravamento do filtro no mock; backend inicial expõe `date`/`dayOfWeek` sem PRD separado.

### D23 — D4 passageiros do driver (resolve Q3)

- **Pergunta original (Q3):** D4 (origem de "passageiros" no driver) continua sem decisão formal. Opções: (a) contagem manual pelo motorista; (b) estimativa agregada da cooperativa; (c) campo opcional no backend que o front não exibe.
- **Decisão:** **Opção (c)** — campo opcional no backend, **front NÃO exibe** até feature própria. Remover `18/22` do mock no mesmo PR que resolver essa dívida.
- **Impacto neste roadmap:**
  - §6.4 R2 resolvido.
  - §7.2 Onda 1 checklist: novo item "D23 aplicada — passageiros removido do front".
  - Afeta UC-A13 (não exibe passageiros), UC-4.5 (`passenger_issue` mantém `type` sem acoplamento com ocupação real), `/meus-horarios` do motorista.

### D24 — UC-4.5 severidade (resolve Q4)

- **Pergunta original (Q4):** UC-4.5 severidade — derivada do `type` ou informada pelo motorista?
- **Decisão:** **Derivada do `type` por default + override manual permitido APENAS se `type='other'`**. Backend valida; UI oculta campo de severidade quando `type ≠ 'other'`.
- **Impacto neste roadmap:** §6.1 R4 atualizado com decisão formalizada. Aplicar no PRD de UC-4.5.

### D25 — UC-A17 x UC-A18 acoplamento (resolve Q5)

- **Pergunta original (Q5):** UC-A17 Command Palette deve listar atalhos nomeados (`?today`, `?mine`) como comandos, criando acoplamento duro com UC-A18?
- **Decisão:** Acoplamento **soft (`~>`)**. Command palette **pode** listar `?today`/`?mine` como comandos mas não é obrigatório ter paridade com menu lateral.
- **Impacto neste roadmap:** nenhuma mudança estrutural (grafo §2.2 já marca como `~>`). Confirmação para a próxima worktree: PRD de UC-A17 pode omitir atalhos nomeados sem bloqueio.

### D26 — UC-A1 e UC-A2 PRDs separados (resolve Q6)

- **Pergunta original (Q6):** UC-A1 e UC-A2 compartilham endpoint `/bulk`. Dois PRDs separados ou um unificado?
- **Decisão:** **Dois PRDs separados** com dependência explícita de A2 → A1. Compartilham endpoint `/bulk`, mas cada um tem user story e critérios próprios.
- **Impacto neste roadmap:** confirmação para a próxima worktree. §1 Resumo atualizado com referência explícita a D26.

### D27 — UC-A16 política de retenção (resolve Q7)

- **Pergunta original (Q7):** UC-A16 política de retenção (job batch deletando avisos expirados há 90d) é implementada na Onda 2 ou aguarda sinal operacional?
- **Decisão:** **NÃO implementar na Onda 2**. Vira dívida operacional registrada em §3.5 do doc base.
- **Impacto neste roadmap:**
  - §6.1 R3 atualizado com decisão formalizada.
  - §7.3 Onda 2 checklist: item "política de retenção NÃO implementada nesta onda" confirmado.

### D28 — Esforço revisto oficial (resolve Q8)

- **Pergunta original (Q8):** Esforço revisto diverge do doc base em 6 UCs (A17, A10, A18+F4, A16, 4.5, A15+F2). Aceitar a revisão?
- **Decisão:** **Aceitar esforço revisto**. Totais revisados viram oficiais.
- **Impacto neste roadmap:**
  - §1 Resumo executivo: totais revistos citados diretamente (Fase 1 ≈ 3d; Onda 1 ≈ 22–25.5d; Onda 2 ≈ 20–26d).
  - §4.2 e §5.3 permanecem como fonte autoritativa de esforço.

### D29 — Skills `/to-spec` e `/to-tickets` (resolve Q9)

- **Pergunta original (Q9):** Skills `/to-spec` e `/to-tickets` são para esta worktree ou para a próxima?
- **Decisão:** São para o **Passo 3 e Passo 4** (worktrees seguintes de geração de PRDs/tickets). **Não** para esta worktree, que produziu apenas o mapa.
- **Impacto neste roadmap:** nenhuma mudança estrutural. Confirmação para a continuidade do fluxo.

### D30 — Contagem de bundles (resolve Q10)

- **Pergunta original (Q10):** Bundles (UC-A18+F4, UC-A15+F2, UC-P4+PA2) contam como 1 UC ou cada subitem é UC independente?
- **Decisão:** Bundles contam como **1 UC na gestão macro** mas podem virar **2+ tickets filhos** quando `/to-tickets` for executado.
- **Impacto neste roadmap:**
  - §2.4 Síntese usa a convenção "bundles contam como 1 por D30".
  - §4 e §5 preservam a visão de bundle no planning.
  - Próxima worktree de tickets granulariza (ex: UC-A18+F4 pode virar 2 tickets: um para `?today`/`?mine` e outro para `resolved_by`/`resolved_at` + endpoints resolve/reopen).

---

## Apêndice A — Histórico de Revisões

| Versão | Data | Autor | Mudanças |
|--------|------|-------|----------|
| 1.0.0 | 2026-10-08 | Kaik + Claude | Produção inicial do roadmap. 18 UCs em escopo (Fase 1 + Onda 1 + Onda 2). §8 com 10 perguntas abertas Q1–Q10. |
| 1.1.0 | 2026-10-08 | Kaik + Claude | Formalização de D21–D30 resolvendo todas as 10 perguntas Q1–Q10. UC-P1 e UC-P2 incorporados na Onda 1 (D21). Total passa a 20 UCs. Bloco P novo em §4.1 (2d). Esforço Onda 1 revisto para 22–25.5d. R2 e R9 marcados como resolvidos em §6.4. §8 renomeada para "Decisões Tomadas (Q1–Q10)". §7.2 Onda 1 checklist atualizado com D21 (endpoints novos) e D23 (remoção de `18/22` do mock). |

### A.1 Convenções de versionamento

Alinhadas com `vanhora-decisoes-e-casos-de-uso.md` Apêndice A.1:
- **Major (X.0.0):** reorganização estrutural (ex: fusão/divisão de ondas, mudança de posicionamento).
- **Minor (0.X.0):** adição/remoção de UCs no escopo, formalização de novas decisões, revisão de esforço.
- **Patch (0.0.X):** correção de redação, clarificação de regra existente, link quebrado.

Versionamento feito **exclusivamente via Git**. Toda mudança deste documento é um commit com mensagem descritiva.

---

**Fim do roadmap.** Próximo passo esperado: Passo 2 (atualização de `vanhora-decisoes-e-casos-de-uso.md` para refletir D21–D30 e UC-P1/P2 em §8.2), depois Passo 3 (geração de PRDs por UC via `/to-spec`) e Passo 4 (tickets granulares via `/to-tickets`).
