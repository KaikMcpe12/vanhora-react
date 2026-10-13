# PRD — UC-A18 + UC-F4 — Deep-links nomeados (`?today` / `?mine`) + `resolved_by` em delays

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco D — bundle)
> **Persona:** Admin + Cooperativa + Motorista
> **Decisões relacionadas:** D30 (bundle = 1 UC macro, pode virar 2 tickets filhos no Passo 4); D25 (acoplamento soft com UC-A17).
> **Nota de estrutura:** bundle de dois UCs. Seções mescladas; sub-UC marcado apenas onde a regra diverge (§5 RF, §7 fluxo, §8 schema). Instrução D30 e briefing confirmam.

## 1. Resumo

Dois UCs entrelaçados que entregam, juntos, triagem rápida de operação:
- **UC-A18:** atalhos nomeados `?today` e `?mine` em URLs de listagens, com items de menu "Hoje" e "Minha fila".
- **UC-F4:** rastreamento de resolução de atrasos (2 colunas aditivas em `delays` + endpoints `PATCH /:id/resolve` e `/:id/reopen`), necessários para o atalho `?mine` do admin funcionar (triagem alta prioridade = `resolved_by IS NULL AND severity = 'high'`).

## 2. Problema real + usuário impactado

**Persona:** admin em triagem de atrasos; cooperativa monitorando operação; motorista acessando seus próprios atrasos.

**Problema (UC-A18):** admin/coop com filtros frequentes de "hoje" e "escopo meu" precisa clicar várias vezes. URL nomeada reduz navegação.
**Problema (UC-F4):** hoje atraso reportado não tem conceito de "resolvido". Admin não tem fila de triagem — tudo parece pendente para sempre.

## 3. Fonte canônica

- **Doc base UC-A18:** `../vanhora-decisoes-e-casos-de-uso.md` §5.2 "UC-A18 — Deep-links nomeados (`?today`, `?mine`)" (linhas ~640–672).
- **Doc base UC-F4:** `../vanhora-decisoes-e-casos-de-uso.md` §5.2 "UC-F4 — Filtro `?mine` para admin via `resolved_by`" (linhas ~675–706).
- **Doc base — Schema:** §7.2 item 15 (linha ~1106).
- **Doc base — Endpoints:** §7.3 item 12 (linha ~1129).
- **Doc base — D25 (soft com A17):** §3.7 (linha ~182).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco D" linha UC-A18+F4 + §6.1 R8.

## 4. User stories

1. **Como** admin visitando `/admin/schedules?today`, **quero** o `today` ser traduzido para `?date=<ISO>` resolvido no cliente, **para** o link vir pré-aplicado.
2. **Como** admin acessando `/admin/delays?mine`, **quero** ver atrasos pendentes de alta severidade (`resolved_by IS NULL AND severity = 'high'`), **para** triagem rápida.
3. **Como** cooperativa acessando `/admin/delays?mine`, **quero** ver só atrasos da minha coop (filtro redundante com JWT), **para** foco imediato.
4. **Como** motorista acessando `?mine` em delays, **quero** ver meus atrasos (`reported_by = self`), **para** paridade com UC-A13.
5. **Como** admin, **quero** itens novos no menu lateral: "Hoje" (admin + coop em `/schedules`) e "Minha fila" (todas personas em `/delays`), **para** atalho visível.
6. **Como** admin olhando atraso, **quero** botão "Marcar como resolvido" no `delay-detail-dialog`, **para** encerrar triagem.
7. **Como** cooperativa resolvendo atraso próprio, **quero** mesma ação permitida, **para** autonomia.
8. **Como** motorista, **quero NÃO** poder resolver atraso (só admin + cooperative podem), **para** separação de papel.
9. **Como** admin resolvendo atraso que não deveria ter resolvido, **quero** reabrir via `/:id/reopen`, **para** correção.
10. **Como** admin vendo atraso resolvido, **quero** badge "Resolvido" + nome do resolver + data, **para** rastreabilidade.
11. **Como** admin usando command palette (UC-A17 — D25 soft), **quero** PODER escolher mostrar os atalhos `?today`/`?mine` como comandos, **para** paridade opcional com menu lateral.

## 5. Requisitos funcionais

### Para UC-A18 (deep-links nomeados)

- **RF-A18.1** — Reader de query param `?today`:
  - Interceptar na página consumidora (`/admin/schedules`, `/cooperative/schedules`).
  - Substituir por `?date=<ISO today>` via `nuqs` (rewrite sem recarregar).
  - Fonte: hora local do cliente.
- **RF-A18.2** — `?today` + `?date=<outra>` juntos → `?date` tem prioridade (specific wins). `?today` é descartado.
- **RF-A18.3** — Reader de `?mine` em `/admin/delays`:
  - Role `cooperative`: aplica `cooperativeId = <user.cooperativeId>` (redundante com JWT, explícito na UI).
  - Role `admin`: aplica `resolved_by IS NULL AND severity = 'high'` (triagem alta prioridade).
  - Role `driver`: aplica `reported_by = <user.id>` (idêntico ao escopo automático do backend).
- **RF-A18.4** — `?mine` em contexto não-aplicável (ex: `/admin/users?mine`): ignorar o param silenciosamente.
- **RF-A18.5** — Menu lateral: itens novos:
  - "Hoje" (admin + coop em `/schedules`) com ícone `Calendar`.
  - "Minha fila" (todas as personas em `/delays`) com ícone `Inbox` ou `ListChecks`.
- **RF-A18.6** — D25 (soft): command palette (UC-A17) PODE listar esses atalhos como comandos. Não obrigatório.

### Para UC-F4 (resolved_by em delays)

- **RF-F4.1** — Schema: adicionar 2 colunas aditivas em `delays`:
  - `resolved_by uuid NULL FK` para `users.id`.
  - `resolved_at timestamp NULL`.
- **RF-F4.2** — Endpoint `PATCH /api/admin/delays/:id/resolve`:
  - Sem body (consome JWT para popular `resolved_by = jwt.sub` e `resolved_at = now()`).
  - Idempotente: resolver 2× não erro — re-registra `resolved_at`.
  - Roles permitidos: `admin`, `cooperative`.
  - Role `driver` → 403.
  - Delay com `deleted_at IS NOT NULL` → 404.
- **RF-F4.3** — Endpoint `PATCH /api/admin/delays/:id/reopen`:
  - Sem body.
  - Seta `resolved_by = NULL` e `resolved_at = NULL`.
  - Idempotente: reabrir já reaberto não erro.
  - Mesmos roles permitidos.
- **RF-F4.4** — `GET /api/admin/delays` aceita filtro `?resolved=true|false|all` (default `all`).
- **RF-F4.5** — Delay resolvido **não some** da listagem — ganha badge "Resolvido" (`StatusChip` tone `success`) + nome do resolver.
- **RF-F4.6** — `delay-detail-dialog` ganha botão:
  - "Marcar como resolvido" (visível quando `resolved_by IS NULL`).
  - "Reabrir" (visível quando `resolved_by IS NOT NULL`).
  - Para role `driver`: ambos ocultos (read-only — mesma UX do UC-A13).
- **RF-F4.7** — Index parcial para fila `?mine` admin: `CREATE INDEX idx_delays_pending ON delays(created_at DESC) WHERE resolved_by IS NULL AND deleted_at IS NULL`.

## 6. Requisitos não-funcionais

- **Performance:** index parcial em `delays` acelera fila `?mine` admin. Rewrite de `?today` acontece no `useEffect` do consumidor, sem recarregar.
- **Acessibilidade:**
  - Botões "Marcar como resolvido" / "Reabrir" com `aria-label` completo + `aria-pressed` para estado.
  - Itens de menu novos com `aria-label` descritivo.
  - Alvos ≥44×44px.
- **Mobile-first:** itens de menu lateral em drawer. `delay-detail-dialog` já responsivo (PR anterior).
- **Observability:** backend loga cada resolve/reopen com `jwt.sub` + `delay_id`.

## 7. Fluxo UX detalhado

### Fluxo UC-A18

1. Admin clica em "Hoje" no menu lateral.
2. Navegador vai para `/admin/schedules?today`.
3. Página monta; `useEffect` detecta `today` → `nuqs` reescreve URL para `?date=2026-10-20` (ISO).
4. Hook `useSchedules({ date: '2026-10-20' })` dispara.
5. Lista renderiza horários de hoje.
6. Admin clica em "Minha fila" no menu lateral.
7. Navegador vai para `/admin/delays?mine`.
8. Reader detecta role = admin → aplica filtros compostos (`resolved=false, severity=high`).
9. Lista renderiza fila de triagem.

### Fluxo UC-F4

1. Admin em `/admin/delays?mine` abre um atraso.
2. `delay-detail-dialog` abre com botão "Marcar como resolvido" visível (porque `resolved_by IS NULL`).
3. Admin clica → `PATCH /api/admin/delays/:id/resolve`.
4. Backend seta `resolved_by = <admin.id>` + `resolved_at = now()`. Response 200.
5. Dialog refetch → agora mostra badge "Resolvido por Admin em DD/MM HH:MM" + botão "Reabrir".
6. Fila `?mine` do admin refetch → atraso **some** da fila (filtro `resolved=false`), mas continua na listagem geral com badge.
7. Edge case — cooperativa resolve atraso próprio: permitido (não é admin-only). Mesmo fluxo.
8. Edge case — motorista tenta resolver: botão não renderiza. Se chamada direta (via console/outra UI): 403.
9. Edge case — delay deletado: 404.
10. Edge case — loop resolve/reopen entre 2 admins (R8 roadmap): aceitável; UC-A6 registra última ação (`updated_by`/`updated_at` em `delays`).

## 8. Mudanças de API/schema

### UC-A18
- **Nenhuma mudança de schema.**
- **Nenhum endpoint novo** no backend especificamente para A18 (ler query param é do front).

### UC-F4
- **Schema (§7.2 item 15 doc base):** 2 colunas aditivas em `delays`:
  - `delays.resolved_by uuid NULL FK`
  - `delays.resolved_at timestamp NULL`
- **Endpoints novos (§7.3 item 12 doc base):**
  - `PATCH /api/admin/delays/:id/resolve`
  - `PATCH /api/admin/delays/:id/reopen`
- **Filtro aditivo:** `GET /api/admin/delays` ganha `?resolved=true|false|all` (default `all`).

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path UC-A18: admin acessa fila "Minha fila"**
```
Dado que o admin tem 10 atrasos no sistema (5 severity high, 5 medium; 3 resolvidos)
Quando ele clica em "Minha fila" no menu lateral
Então a URL muda para /admin/delays?mine
  E o reader interpreta mine para admin como { resolved: false, severity: high }
  E a listagem renderiza 5 - X atrasos (os high pendentes)
```

**Cenário 2 — Happy path UC-F4: admin resolve atraso**
```
Dado que o admin abriu um delay com resolved_by = NULL
  E o delay-detail-dialog mostra o botão "Marcar como resolvido"
Quando o admin clica no botão
Então o front dispara PATCH /api/admin/delays/:id/resolve
  E o backend seta resolved_by = admin.id, resolved_at = now
  E o dialog refetch mostra badge "Resolvido por Admin em DD/MM HH:MM"
  E o botão vira "Reabrir"
  E o atraso some da fila ?mine (se admin estava em /admin/delays?mine)
```

**Cenário 3 — Erro UC-F4: motorista tenta resolver**
```
Dado que o motorista abre delay-detail-dialog em /driver/my-delays
Quando ele inspeciona a UI
Então os botões "Marcar como resolvido" e "Reabrir" NÃO renderizam
Quando ele dispara chamada direta PATCH /api/admin/delays/:id/resolve (via console/dev tool)
Então o backend retorna 403 com error.code = "driver_cannot_resolve"
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.2 UC-A18 + UC-F4 "Escopo Negativo":

- **NÃO** criar sistema de "URLs favoritas" por usuário.
- **NÃO** adicionar outros atalhos nomeados nesta primeira versão (`?this-week`, `?urgent` etc).
- **NÃO** persistir estado de "triagem alta" (`?mine` admin) no backend como preferência.
- **NÃO** adicionar status intermediário "em análise" / "ignorado". Só pendente/resolvido.
- **NÃO** criar fluxo de aprovação (resolver ≠ precisa 2 pessoas).
- **NÃO** adicionar comentário obrigatório ao resolver — ação simples, 1 clique.
- **NÃO** usar `resolved_by` em outra entidade — campo específico de `delays`.

Reforço §6.3: sem notificação externa; sem IA sugerindo prioridade.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2 Bloco D:
- **Nenhuma dependência direta** entre UC-A18 e UC-F4 (bundle por conveniência de contrato).
- **Independente de UC-A1/A2** (outra parte do Bloco D).
- **~> UC-A17 (D25 soft):** command palette pode listar `?today`/`?mine`. Não bloqueia.
- **~> UC-A6:** PATCH /resolve e /reopen passam pelo middleware de updated_by/updated_at (cobertura implícita por A6).
- **UC-A13:** badge "Resolvido" da UC-A13 depende de `resolved_by` deste UC. Se UC-A13 subir antes, badge renderiza como "pendente".

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6.1:
- **R8 (baixo):** admin A resolve, admin B reabre, admin A resolve de novo — loop sem auditoria granular. Mitigação: UC-A6 (`updated_by`/`updated_at` em `delays`) cobre a última ação. Aceitar.

## Perguntas residuais

Nenhuma.
