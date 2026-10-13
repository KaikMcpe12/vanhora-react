# VanHora — Fluxo de Execução por Worktrees

> **Versão:** 1.0.0 — 2026-10-08
> **Propósito:** Guia operacional dos próximos 6 passos até a implementação começar. Cada passo é uma worktree isolada no Orca, com entrada clara, output único e prompt pronto para colar no agente.
> **Fontes canônicas:** `docs/vanhora-decisoes-e-casos-de-uso.md` (lei) + `docs/roadmap-execucao.md` (mapa).
> **Princípio:** uma worktree = um output. Nunca misturar "decidir" com "implementar" no mesmo contexto.

---

## Visão Geral — Sequência dos Passos

```
Passo 1: Fechar Q1–Q10 + bump versão      ──→ roadmap v1.1.0 + doc base v1.1.0
Passo 2: Atualizar documento base          ──→ doc base com D21–D30 formalizadas
Passo 3: Gerar PRDs (Fase 1 + Onda 1)      ──→ 12 arquivos em docs/prds/
Passo 4: Gerar tickets (/to-tickets)       ──→ backlog priorizado por milestone
Passo 5: Backend inicial começa            ──→ migrations + scaffold + endpoints base
Passo 6: Fase 1 em paralelo (front puro)   ──→ 3 PRs no front, zero contrato
```

**Tempo de planejamento (passos 1–4):** ~1–2 dias de worktrees.
**Tempo de implementação (passos 5–6 e Onda 1):** ~20–23 dias (Onda 1 do roadmap).

---

## Passo 1 — Fechar Perguntas Abertas (worktree atual)

### Objetivo
Resolver as 10 perguntas abertas em `docs/roadmap-execucao.md` §8. Transformar as sugestões aceitas em decisões formais D21–D30. Bump do roadmap para v1.1.0.

### Output esperado
- `docs/roadmap-execucao.md` atualizado para v1.1.0 (§8 vira "Decisões Tomadas" com D21–D30; perguntas riscadas).
- Changelog no apêndice do roadmap registrando a mudança.

### Pré-requisitos
- `docs/vanhora-decisoes-e-casos-de-uso.md` v1.0.0 em `main`.
- `docs/roadmap-execucao.md` v1.0.0 em `main`.

### Prompt para o agente

````markdown
# Atualizar roadmap v1.0.0 → v1.1.0 — Perguntas Q1–Q10 resolvidas

Fonte: `@docs/roadmap-execucao.md` §8 (Perguntas Abertas).

As 10 perguntas foram respondidas pelo Kaik. Formalizar como decisões D21–D30 e atualizar o roadmap. Nenhuma pergunta pode continuar aberta ao final.

## Decisões formais (aplicar todas)

- **D21 (Q1):** UC-P1 e UC-P2 entram na **Onda 1**. Adicionar `GET /api/cities/served` e `GET /api/destinations/popular` ao backlog do backend inicial. Isso destrava `cities.photo_url` ter consumer (resolve R9).
- **D22 (Q2):** UC-P3 **NÃO vira UC próprio**. Fica absorvido em UC-P4+PA2 (Fase 1, destravar mock) + obrigação implícita do backend inicial em `api-spec.md §2.1`.
- **D23 (Q3):** **D4 (passageiros do driver) resolvido: opção (c)** — campo opcional no backend, **front NÃO exibe** até feature própria. Remover `18/22` do mock no mesmo PR que resolver essa dívida. Afeta UC-A13, UC-4.5 (`passenger_issue` continua como `type`, mas sem acoplamento com ocupação real), e `/meus-horarios` do motorista.
- **D24 (Q4):** UC-4.5 severidade: **derivada do `type` por default + override manual permitido apenas se `type='other'`**. Backend valida. UI oculta campo de severidade quando `type ≠ 'other'`.
- **D25 (Q5):** UC-A17 acoplamento com UC-A18: **soft (`~>`)**. Command palette **pode** listar `?today`/`?mine` como comandos mas não é obrigatório ter paridade com menu lateral.
- **D26 (Q6):** UC-A1 e UC-A2: **dois PRDs separados** com dependência explícita de A2 → A1. Compartilham endpoint `/bulk`, mas cada um tem user story e critérios próprios.
- **D27 (Q7):** UC-A16 política de retenção (job batch deletando avisos expirados há 90d): **NÃO implementar na Onda 2**. Vira dívida operacional registrada em §3.5 do doc base.
- **D28 (Q8):** **Aceitar esforço revisto** nos 6 UCs com divergência (A17, A10, A18+F4, A16, 4.5, A15+F2). Totais revisados viram oficiais.
- **D29 (Q9):** Skills `/to-spec` e `/to-tickets` são para o **Passo 3 e Passo 4** (worktrees seguintes de geração de PRDs/tickets). Não para esta worktree.
- **D30 (Q10):** Bundles (UC-A18+F4, UC-A15+F2, UC-P4+PA2) contam como **1 UC na gestão macro** mas podem virar **2+ tickets filhos** quando `/to-tickets` for executado.

## Mudanças no arquivo

1. **§8 "Perguntas Abertas"** → renomear para **§8 "Decisões Tomadas (Q1–Q10)"**. Converter cada linha da tabela em entrada D21–D30 com formato "Q#: pergunta original → D#: decisão formal + justificativa breve".
2. **§6 "Riscos"**: marcar R2 (passageiros/D4) como **RESOLVIDO** por D23 — remover da lista ou mover para "Riscos resolvidos" no fim da seção.
3. **§6 R9 (`cities.photo_url` sem consumer)**: marcar como **RESOLVIDO** por D21 (UC-P1 entra na Onda 1 com consumer).
4. **§2.4 "Síntese cobertura dos 18 UCs"**: atualizar total para **20 UCs** (18 + UC-P1 + UC-P2) na Onda 1. Ajustar linha "Onda 1" para 11 bundles.
5. **§4 Onda 1**: adicionar UC-P1 e UC-P2 como novo "Bloco P — Pré-existentes do PRD" com esforço 1d cada (puro front consumindo endpoint que backend inicial já expõe).
6. **§4.3 Sequência recomendada**: encaixar P1 e P2 na semana 2 do dev 1, após A13+A17 (também "zero contrato novo" do ponto de vista do front, pois backend expõe endpoint pronto).
7. **§7 "Critério de fase concluída"**: adicionar à Onda 1 checklist:
   - "[ ] UC-P1 e UC-P2 consomem endpoints reais (não mais hardcoded)".
   - "[ ] Decisão D23 aplicada: campo 'passageiros' removido do front (`/meus-horarios` e qualquer outro consumer de mock que o exiba)".
8. **Apêndice A — Histórico de Revisões**: adicionar linha v1.1.0 em 2026-10-08 descrevendo D21–D30 aplicadas.
9. **Topo do arquivo**: bump de versão `1.0.0` → `1.1.0`.

## Restrições

- **Não** criar PRDs ainda (isso é Passo 3).
- **Não** editar `docs/vanhora-decisoes-e-casos-de-uso.md` (isso é Passo 2).
- **Não** reabrir nenhuma das 10 decisões — todas foram tomadas por Kaik.
- Se encontrar inconsistência entre as decisões D21–D30 e o resto do roadmap (ex: §2 esquecer de linkar P1/P2 em algum lugar), **corrigir no mesmo PR**.

## Feito quando

- [ ] `docs/roadmap-execucao.md` é v1.1.0.
- [ ] §8 renomeada para "Decisões Tomadas" com D21–D30 todas listadas.
- [ ] Zero ocorrência de "Pergunta aberta" ou "sem decisão" no documento.
- [ ] §2.4 totalização refletindo 20 UCs em escopo.
- [ ] §4 Bloco P novo documentado com UC-P1 e UC-P2.
- [ ] §6 R2 e R9 marcados como RESOLVIDOS.
- [ ] Changelog atualizado.
- [ ] Grep `grep -i "pergunta aberta\|Q[1-9]\|Q10" docs/roadmap-execucao.md` retorna apenas referências históricas (dentro de D21–D30), nenhuma pendência real.
````

---

## Passo 2 — Atualizar Documento Base com D21–D30

### Objetivo
Transportar as decisões D21–D30 para o documento canônico `vanhora-decisoes-e-casos-de-uso.md`, para que o PRD base reflita o estado atual sem precisar cruzar com o roadmap.

### Output esperado
- `docs/vanhora-decisoes-e-casos-de-uso.md` atualizado para v1.1.0 com D21–D30 em §3.
- UC-P1, UC-P2, UC-P3 atualizados conforme decisões.
- §6 Escopo Negativo atualizado se aplicável.
- §7 Mudanças de Schema sem alterações (D21-D30 não mudam schema).

### Pré-requisitos
- Passo 1 concluído (roadmap v1.1.0 em `main`).

### Prompt para o agente

````markdown
# Atualizar documento base v1.0.0 → v1.1.0 — Incorporar D21–D30

Fonte canônica das decisões: `@docs/roadmap-execucao.md` v1.1.0 §8 (Decisões Tomadas).

Transportar as decisões D21–D30 para o documento base `@docs/vanhora-decisoes-e-casos-de-uso.md` para que ele continue sendo fonte única de verdade sem precisar cruzar com o roadmap.

## Mudanças obrigatórias

### 1. §3 Decisões Consolidadas — adicionar D21–D30

Adicionar nova sub-seção §3.7 "Decisões pós-roadmap v1.1.0 (D21–D30)" com todas as 10 decisões. Formato idêntico às tabelas D1–D20 existentes (ID, descrição, origem, status).

### 2. §5.1 UC-P1 — atualizar para refletir D21

Mudar status do UC-P1 de "proposto" para "aprovado na Onda 1". Adicionar nota: "Entra junto do backend inicial para destravar consumer de `cities.photo_url`".

### 3. §5.1 UC-P2 — atualizar para refletir D21

Mesma mudança. Nota: "Entra na Onda 1 do backend inicial".

### 4. §5.1 UC-P3 — atualizar para refletir D22

Adicionar nota no topo do UC-P3: "**NÃO é UC próprio.** Front: absorvido em UC-P4+PA2 (Fase 1, remover TODOs em `mock-schedules-api.ts`). Backend: obrigação implícita do contrato inicial em `api-spec.md §2.1`. Mantido aqui para referência contratual."

### 5. §3.5 Dívidas Técnicas — resolver D4

Mudar linha "Passageiros do driver (D4): origem indefinida" para:

> **RESOLVIDO em D23 (2026-10-08):** passageiros é campo opcional no backend; **front NÃO exibe**. Remover `18/22` de `/meus-horarios` + qualquer outro consumer de mock que mostre o campo no PR da Onda 1. Backend pode entregar o campo preenchido ou NULL — front ignora.

### 6. §5.4 UC-4.5 — refletir D24

Em §5.4 UC-4.5 "Regras de Negócio", clarificar: "Severidade **derivada automaticamente por `type`** no backend (ex: `accident` = `high` obrigatório, `vehicle_breakdown` = `high` default, `other` = `low` default). Front **oculta campo de severidade** quando `type ≠ 'other'`. Apenas `type='other'` permite override manual."

### 7. §5.2 UC-A17 — refletir D25

Em "Guia de Implementação", adicionar: "Acoplamento com UC-A18 é **soft**: command palette pode listar os atalhos `?today`/`?mine` como comandos, mas não é obrigatório para paridade com menu lateral."

### 8. §5 UC-A1 e UC-A2 — refletir D26

Adicionar nota em UC-A1 e UC-A2: "**PRDs separados** (D26). Compartilham `POST /api/admin/schedules-exceptions/bulk`, mas user stories, UI e critérios de aceite distintos."

### 9. §3.5 Dívidas Técnicas — adicionar D27

Nova linha:
> **UC-A16 política de retenção:** job batch deletando avisos expirados há 90d NÃO implementado na Onda 2. Decidido em D27. Vira dívida operacional — reavaliar quando volume de avisos crescer.

### 10. §8 Roadmap em Ondas — atualizar §8.2 Onda 1

Adicionar linha para UC-P1 e UC-P2 na tabela da Onda 1. Esforço 1d cada. Total Onda 1 passa de ~20d para ~22d (sem revisar as outras estimativas aqui — ficam no roadmap).

### 11. Apêndice A — Histórico de Revisões

Adicionar linha v1.1.0 com data 2026-10-08. Resumo: "D21–D30 formalizadas após conclusão do roadmap v1.1.0. UC-P1 e UC-P2 entram oficialmente na Onda 1. D4 resolvido. §5.1 UC-P3 clarificado como não-UC."

### 12. Topo do arquivo

Bump versão `1.0.0` → `1.1.0`.

## Restrições

- **Não** criar UCs novos.
- **Não** mudar §6 Escopo Negativo (D21–D30 não alteram o que é "fora de escopo").
- **Não** mudar §7 Mudanças de Schema Aprovadas (D21–D30 não acrescentam schema).
- **Não** criar PRDs (Passo 3).
- Se D21–D30 contradizem alguma regra existente no doc base, **sinalizar e perguntar** — não corrigir silenciosamente.

## Feito quando

- [ ] `docs/vanhora-decisoes-e-casos-de-uso.md` é v1.1.0.
- [ ] §3.7 nova com D21–D30 completas.
- [ ] UC-P1, UC-P2, UC-P3 atualizados.
- [ ] §3.5 D4 marcado como RESOLVIDO + D27 adicionada.
- [ ] §5.4 UC-4.5 severidade clarificada.
- [ ] §8.2 Onda 1 inclui UC-P1 e UC-P2.
- [ ] Changelog atualizado.
- [ ] Zero contradição entre doc base e roadmap (`diff` conceitual).
````

---

## Passo 3 — Gerar PRDs (Fase 1 + Onda 1)

### Objetivo
Gerar 1 PRD por UC em `docs/prds/`, cobrindo Fase 1 (3 PRDs) + Onda 1 (11 PRDs, incluindo UC-P1 e UC-P2 adicionados por D21).

### Output esperado
- 14 arquivos em `docs/prds/` seguindo template padrão.
- `docs/prds/README.md` como índice navegável.

### Pré-requisitos
- Passo 1 e Passo 2 concluídos.
- Doc base v1.1.0 e roadmap v1.1.0 em `main`.
- Skill `/to-spec` instalada no `.claude/`.

### Prompt para o agente

````markdown
# Geração de PRDs — Fase 1 + Onda 1

Fontes canônicas (em ordem de precedência):
1. `@docs/vanhora-decisoes-e-casos-de-uso.md` v1.1.0 (lei)
2. `@docs/roadmap-execucao.md` v1.1.0 (mapa)

## Objetivo

Gerar 1 PRD por UC em `docs/prds/`, cobrindo:

### Fase 1 (3 PRDs)
- `docs/prds/fase1-01-uc-p4-pa2-tabs-temporais.md`
- `docs/prds/fase1-02-uc-pa1-banner-cancelamento.md`
- `docs/prds/fase1-03-higiene-mock-cooperative-filter.md`

### Onda 1 (11 PRDs)
- `docs/prds/onda1-01-uc-p1-cities-served.md`
- `docs/prds/onda1-02-uc-p2-destinations-popular.md`
- `docs/prds/onda1-03-uc-a13-driver-my-delays.md`
- `docs/prds/onda1-04-uc-a17-command-palette.md`
- `docs/prds/onda1-05-uc-a6-updated-by.md`
- `docs/prds/onda1-06-uc-a7-schedules-temporary-driver.md`
- `docs/prds/onda1-07-uc-a10-rotas-orfas.md`
- `docs/prds/onda1-08-uc-f1-aviso-cooperativa-passageiro.md`
- `docs/prds/onda1-09-uc-a1-cancelar-horarios-bulk.md`
- `docs/prds/onda1-10-uc-a2-excecao-intervalo.md`
- `docs/prds/onda1-11-uc-a18-f4-deep-links-resolved.md`

**NÃO gerar PRDs da Onda 2 ainda.** Esses virão depois do MVP backend em produção.

## Skills a usar

- **`/to-spec`** — core de cada PRD (user stories, requisitos funcionais e não-funcionais, critérios de aceite).
- **`/engineering:system-design`** — quando o PRD envolve decisão de arquitetura (ex: UC-A1 com endpoint bulk e response 207).
- **`/engineering:testing-strategy`** — para a seção de critérios de aceite BDD de UCs com fluxo complexo.
- **`/design:ux-copy`** — para microcopy de empty states, erros, toasts (ex: UC-A1 "cancelado X de Y", UC-F1 banner).

## Template obrigatório de cada PRD

Estrutura em 12 seções:

1. **Resumo** (3–5 linhas)
2. **Problema real + usuário impactado** (persona do UC)
3. **Fonte canônica** (linha exata do doc base + roadmap, formato `vanhora-decisoes-e-casos-de-uso.md §5.X.Y UC-XXX`)
4. **User stories** ("Como X, quero Y, para Z")
5. **Requisitos funcionais** (lista numerada RF1, RF2, ...)
6. **Requisitos não-funcionais** (performance, a11y ≥44×44px, i18n se aplicável, mobile-first)
7. **Fluxo UX detalhado** (passo-a-passo, estados, edge cases do doc base)
8. **Mudanças de API/schema** (link para §7 do doc base, não duplicar)
9. **Critérios de aceite BDD** (Given/When/Then — mínimo 3 cenários: happy path, edge case, erro)
10. **Escopo negativo** (herda do UC "Anti-alucinação" + reforço)
11. **Dependências** (herda do roadmap §2)
12. **Riscos aplicáveis** (herda do roadmap §6, se houver)

Para PRDs de bundle (UC-P4+PA2, UC-A18+F4): seções separadas por sub-UC dentro do mesmo arquivo.

## Criar `docs/prds/README.md`

Índice navegável com:
- Lista de todos os PRDs com link + resumo de 1 linha + persona + fase.
- Legenda de status (`draft`, `aprovado`, `em implementação`, `concluído`).
- Instruções de uso (como ler, como propor mudança, versionamento).

## Restrições

- **Não** inventar funcionalidade fora do doc base + roadmap.
- **Não** reabrir decisões D1–D30.
- **Não** escrever código, migrations, OpenAPI, SQL.
- **Não** adicionar riscos ou dependências novos sem base nos documentos canônicos.
- Em dúvida sobre escopo, **PARE e pergunte** — não assuma.
- Cada PRD deve referenciar explicitamente a decisão D# relevante (ex: UC-4.5 referencia D9, D24).

## Feito quando

- [ ] 14 arquivos em `docs/prds/` (3 Fase 1 + 11 Onda 1).
- [ ] `docs/prds/README.md` índice navegável criado.
- [ ] Cada PRD tem as 12 seções preenchidas.
- [ ] Nenhum PRD contradiz doc base ou roadmap (revisão cruzada).
- [ ] Perguntas residuais listadas no fim de cada PRD (idealmente vazias — se não vazias, PARAR antes de considerar passo concluído).
- [ ] Convenções técnicas de §9 do doc base explicitamente citadas em cada PRD onde aplicáveis.
- [ ] Grep final: nenhum PRD menciona item descartado em §6 do doc base.
````

---

## Passo 4 — Gerar Tickets (`/to-tickets`)

### Objetivo
Converter os 14 PRDs em tickets executáveis, agrupados por milestone (Fase 1, Onda 1 Bloco Z, Bloco S, Bloco D).

### Output esperado
- `docs/tickets/` com 1 arquivo por milestone contendo os tickets filhos.
- Ou (preferência do seu time) emissão direta para GitHub/Linear/Jira via skill `/to-tickets`.

### Pré-requisitos
- Passo 3 concluído (14 PRDs em `docs/prds/`).
- Skill `/to-tickets` instalada e configurada para o destino (local markdown ou API externa).

### Prompt para o agente

````markdown
# Geração de Tickets — Fase 1 + Onda 1

Fontes:
1. `@docs/prds/` — 14 PRDs aprovados
2. `@docs/roadmap-execucao.md` v1.1.0 — agrupamento e dependências
3. `@docs/vanhora-decisoes-e-casos-de-uso.md` v1.1.0 — restrições

## Objetivo

Usar skill `/to-tickets` para converter cada PRD em tickets filhos executáveis, respeitando o agrupamento do roadmap:

- **Milestone "Fase 1 — Pré-backend"**: 3 PRDs → N tickets filhos cada (um por fatia implementável, ex: "configurar nuqs para ?tab=", "renderizar banner", "testes de teclado").
- **Milestone "Onda 1 — Bloco Z"** (zero contrato): UC-A13, UC-A17, UC-P1, UC-P2.
- **Milestone "Onda 1 — Bloco S"** (contrato aditivo independente): UC-A6, UC-A7, UC-A10, UC-F1.
- **Milestone "Onda 1 — Bloco D"** (dependência sequencial): UC-A1 → UC-A2, UC-A18+F4.

## Regras de granularidade

- 1 ticket ≈ 1 PR mergeável (padrão do time nos PR1–PR13).
- Ticket deve ter: título, descrição (link para PRD), critérios de aceite subset do PRD, estimativa em horas/dias, dependências, labels (`fase1`/`onda1`, `front`/`back`/`fullstack`, persona).
- Para bundles (UC-P4+PA2, UC-A18+F4): dividir em tickets separados conforme D30.
- Para UC pesado (UC-A1, 5–7d): dividir em 3–5 tickets filhos (ex: "endpoint bulk + validação", "AdminBulkBar componente", "BulkExceptionModal UI", "integração + testes 207").

## Destino

Confirmar com Kaik qual destino antes de executar:
- (a) Arquivos markdown em `docs/tickets/<milestone>/<ticket>.md`
- (b) GitHub Issues via `gh` CLI
- (c) Linear via API
- (d) Jira via API

Default: (a) arquivos markdown.

## Restrições

- **Não** criar tickets fora dos 14 PRDs.
- **Não** inflar granularidade (ticket "escrever import" não existe).
- **Não** separar front de back se o ticket é naturalmente fullstack (ex: UC-A6 middleware + UI).
- Dependências entre tickets devem replicar as do roadmap §2.

## Feito quando

- [ ] Todos os 14 PRDs geraram ≥1 ticket.
- [ ] Nenhum ticket sem PRD de origem.
- [ ] Milestones corretamente mapeados.
- [ ] Dependências explícitas (bloqueado por X, bloqueia Y).
- [ ] Total de tickets razoável (estimativa: 40–60 para Fase 1 + Onda 1).
````

---

## Passo 5 — Backend Inicial Começa

### Objetivo
Scaffold do backend Fastify com todas as migrations §7.1 + §7.2 da Onda 1 + endpoints base cobertos pelos 11 PRDs da Onda 1.

### Output esperado
- Repositório/módulo backend com:
  - Migrations: 12 itens §7.1 (herdados do `api-spec.md`) + 4 itens §7.2 Onda 1 (schedules_temporary.driver_id, updated_by/at × 5 tabelas, delays.resolved_by/at, routes.announcement_*).
  - JWT (access 15min + refresh 7d) + CORS + role scoping.
  - Endpoints base (CRUD existentes + os novos de UC-A1, A2, A6, A7, A10, A13, A17, A18+F4, F1, P1, P2).
  - Testes de integração mínimos por endpoint.

### Pré-requisitos
- Passo 4 concluído (tickets em algum destino).
- Decisão sobre stack e repositório do backend (presume-se Node/Fastify conforme `VanHora Especificação.md`).

### Prompt para o agente

````markdown
# Scaffold Backend Inicial + Migrations + Endpoints Onda 1

Fontes:
1. `@docs/vanhora-decisoes-e-casos-de-uso.md` v1.1.0 §7 (Mudanças de Schema Aprovadas)
2. `@docs/prds/onda1-*.md` (11 PRDs da Onda 1)
3. `@docs/api-spec.md` (contrato existente)
4. `@docs/database.md` (schema base)

## Objetivo

Criar backend inicial com:
- Scaffold Node 20+ / Fastify / TypeScript / Prisma (ou drizzle, conforme stack decidida)
- PostgreSQL com migrations das 12 mudanças §7.1 + 4 mudanças §7.2 da Onda 1
- Autenticação JWT (access 15min + refresh 7d com rotação)
- CORS configurável via env (não `*` em produção)
- Role scoping via middleware (admin/cooperative/driver)
- 11 UCs da Onda 1 implementados ponta-a-ponta

## Migrations obrigatórias (ordem)

### §7.1 herdadas (12 itens — nenhum destrutivo)
1. `cooperatives.brand_color varchar(7) NULL`
2. `routes.origin_city_id uuid FK NOT NULL`
3. `routes.destination_city_id uuid FK NOT NULL`
4. `routes.description text NULL`
5. `cooperatives.email varchar NULL`
6. `cooperatives.description varchar(500) NULL`
7. `cities.photo_url varchar NULL`
8. Rename `routes.drive_id` → `routes.driver_id`
9. Rename `ratings.date_ata` → `ratings.created_at`
10. `cooperatives.rating_cached DECIMAL(3,2) NULL` + trigger de materialização
11. `cooperatives.rating_count_cached INTEGER NULL` + trigger
12. Zero endpoints novos aqui — base.

### §7.2 Onda 1 (4 itens aditivos)
13. `schedules_temporary.driver_id uuid FK NULL` (UC-A7)
14. `updated_by uuid NULL`, `updated_at timestamp NULL` em routes, schedules, users, cooperatives, cities (10 colunas) (UC-A6)
15. `delays.resolved_by uuid NULL`, `delays.resolved_at timestamp NULL` (UC-F4)
16. `routes.announcement_text varchar(280) NULL`, `routes.announcement_expires_at timestamp NULL` (UC-F1)

## Endpoints novos obrigatórios (Onda 1)

Conforme §7.3 doc base, filtrar apenas Onda 1:

- `POST /api/admin/schedules-exceptions/bulk` (UC-A1, UC-A2)
- Query param `driver_id` em `GET /api/admin/schedules` (UC-A1)
- Query param `driver_status=inactive` em `GET /api/admin/routes` (UC-A10)
- `PATCH /api/admin/delays/:id/resolve` + `PATCH /api/admin/delays/:id/reopen` (UC-F4)
- Campos `announcement_text`, `announcement_expires_at` em responses de schedules/routes (UC-F1)
- `GET /api/cities/served` (UC-P1 — já estava em api-spec mas sem consumer)
- `GET /api/destinations/popular` (UC-P2 — idem)

**NÃO implementar nesta fase (ficam para Onda 2):**
- `POST /api/admin/routes/:id/duplicate`
- `GET /api/admin/<entity>/:id/impact-summary`
- `POST /api/admin/users/:driver_id/reassign-routes`
- Endpoints de `announcements` e `operational_events`

## Testes obrigatórios

Para cada endpoint novo: pelo menos 1 teste de integração cobrindo happy path + 1 edge case + 1 erro de validação.

## Restrições

- **Zero endpoint ou tabela** fora dos listados acima.
- **Não** implementar entidades da Onda 2 (announcements, operational_events, etc).
- **Não** implementar dívidas descartadas em §6 doc base.
- Nenhuma coluna destrutiva — todas aditivas.
- Confirmar com Kaik qualquer decisão de stack/estrutura antes de scaffold.

## Feito quando

- [ ] Scaffold em pé: `npm run dev` sobe servidor.
- [ ] Todas as migrations §7.1 + §7.2 Onda 1 aplicadas localmente.
- [ ] 100% dos endpoints novos da Onda 1 respondendo (mesmo que com dados mock inicialmente).
- [ ] JWT + role scoping funcionando (3 roles testados).
- [ ] Testes de integração passando.
- [ ] `README.md` do backend com instruções de setup.
- [ ] `api-spec.md` atualizado com os endpoints novos documentados.
````

---

## Passo 6 — Fase 1 em Paralelo (Front Puro)

### Objetivo
Enquanto o backend é scaffoldado (Passo 5), 1 dev no front executa a Fase 1 (3 PRs, zero contrato, destravam valor para passageiro público).

### Output esperado
- 3 PRs mergeados em `main` do front:
  - PR Fase1-01: Tabs "Partindo Agora / Próximos / Decorridos" + filtro date/dayOfWeek destravado no mock
  - PR Fase1-02: Banner de cancelamento em favoritos
  - PR Fase1-03: Higiene mock (auto-filtro cooperative_id para role cooperative)

### Pré-requisitos
- Passo 3 concluído (PRDs da Fase 1 em `docs/prds/`).
- Passo 4 concluído (tickets gerados).

### Prompt para o agente (adaptar por PR)

Este passo não tem 1 prompt único — segue o modelo dos PRs anteriores (PR1–PR13), com 1 prompt por PR. Template base:

````markdown
# Executar PR Fase1-XX — <nome>

Ler `@docs/prds/fase1-XX-<nome>.md` inteiro antes de começar.

Fontes:
1. PRD completo em `docs/prds/fase1-XX-<nome>.md`
2. Convenções técnicas: `docs/vanhora-decisoes-e-casos-de-uso.md` §9

## Escopo

Implementar o PRD cumprindo exatamente seus critérios de aceite BDD. Nada além.

## Skills a usar

- Nenhuma skill obrigatória — o PRD é autossuficiente.
- Opcional: `/engineering:testing-strategy` se precisar bolar casos de teste adicionais.

## Restrições

- **Não** adicionar funcionalidade fora do PRD.
- **Não** antecipar features da Onda 1 ou Onda 2.
- Convenções técnicas §9 do doc base são obrigatórias (StatusChip, AdminTable, nuqs, alvos 44×44, cor+ícone+texto).
- Catalogar componente novo em `/admin/components-preview`.

## Feito quando

- [ ] Todos os critérios de aceite BDD do PRD cumpridos (checar 1 a 1).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
- [ ] Walkthrough por teclado (Tab, Enter, Space, Esc) nas UIs tocadas.
- [ ] Componente novo (se houver) catalogado em `/admin/components-preview`.
- [ ] Screenshot do estado final + resumo das decisões não explícitas no PRD.
````

### Observação sobre a Onda 1

Após a Fase 1 e o Passo 5 (backend scaffold), inicia-se a implementação da Onda 1 propriamente dita. Cada um dos 11 PRs segue o mesmo padrão (1 prompt por PR referenciando o PRD correspondente). Não documento esses 11 prompts aqui porque cada um nasce da revisão do PRD específico — melhor gerar on-demand.

---

## Resumo em Tabela

| Passo | Worktree | Output único | Pré-req | Esforço estimado |
|-------|----------|--------------|---------|------------------|
| 1 | atual | `roadmap-execucao.md` v1.1.0 | roadmap v1.0.0 | 1–2h |
| 2 | nova | `vanhora-decisoes-e-casos-de-uso.md` v1.1.0 | passo 1 | 1–2h |
| 3 | nova | 14 PRDs em `docs/prds/` | passos 1 + 2 | ~1 dia |
| 4 | nova | Tickets em destino decidido | passo 3 | ~0.5 dia |
| 5 | nova (backend) | Backend scaffold + migrations + endpoints Onda 1 | passo 4 | ~5–7 dias |
| 6 | nova (front, em paralelo com 5) | 3 PRs Fase 1 em `main` | passo 3 | ~3 dias (1 dev) |

**Total planejamento (passos 1–4):** ~2 dias.
**Total até Onda 1 implementável (passos 1–5):** ~10 dias.
**Fase 1 em paralelo (passo 6):** ~3 dias.

Depois do passo 5 + 6, implementação da Onda 1 começa (PRs individuais, não documentados aqui).

---

## Como usar este documento

1. **Executar sequencialmente.** Cada passo depende do anterior; não pular.
2. **1 worktree por passo.** Isolar contexto evita decisão silenciosa cruzada.
3. **Copiar o prompt do passo, colar no Orca, revisar o output antes de passar.**
4. **Se o agente perguntar durante um passo, responder e NÃO adiantar o próximo** — manter 1 output por worktree.
5. **Versionamento via Git** (não gerar CHANGELOG separado neste doc também — segue a mesma convenção do doc base).

---

## Apêndice — Histórico de Revisões

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2026-10-08 | Documento inicial. 6 passos definidos com prompts prontos. Passo 1 pré-carregado com decisões D21–D30 (todas as sugestões aceitas pelo Kaik). |
