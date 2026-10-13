# PRD — UC-A6 — `updated_by` / `updated_at` embrionário (trilha mínima)

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco S — contrato aditivo independente)
> **Persona:** Admin + Cooperativa (consumidores do label; backend aplica em todas as entidades)

## 1. Resumo

Resposta a "quem alterou o motorista da R-204?" sem criar tabela de auditoria completa (5.1 descartado — D15). Adiciona 2 colunas (`updated_by`, `updated_at`) em 5 tabelas (routes, schedules, users, cooperatives, cities = 10 colunas aditivas) + middleware Fastify que popula em todo PUT/PATCH + UI mostra "Última alteração por X em DD/MM/AAAA HH:MM" no detalhe de cada entidade.

## 2. Problema real + usuário impactado

**Persona:** admin coordenando múltiplas cooperativas, cooperativa gerenciando própria frota.

**Problema:** quando algo muda (ex: motorista de uma rota, status de uma cooperativa), ninguém sabe quem fez a alteração nem quando. Hoje: zero trilha. Resolver sem UC-5.1 (auditoria completa, descartado D15) exige o mínimo: autor + data da última alteração.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.2 "UC-A6 — `updated_by` / `updated_at` embrionário" (linhas ~573–605).
- **Doc base — Schema:** §7.2 item 14 (10 colunas) linha ~1105.
- **Doc base — D15 (auditoria completa descartada):** §3.3 linha ~135.
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco S" linha UC-A6 + §6.1 R6.

## 4. User stories

1. **Como** admin investigando mudança suspeita, **quero** ver "última alteração por Fulano em 15/10 14:30" no detalhe da rota, **para** identificar o autor sem abrir log.
2. **Como** cooperativa consultando sua rota, **quero** ver quem na cooperativa alterou (admin ou outro user coop), **para** confirmar se foi ação interna.
3. **Como** admin olhando entidade recém-criada, **quero** ver "sem alterações registradas" em vez de uma data falsa, **para** não confundir criação com edição.
4. **Como** admin alterando usuário cujo criador foi deletado (soft-delete), **quero** ver "por usuário removido" em vez de UUID solto, **para** mensagem legível.
5. **Como** desenvolvedor do backend, **quero** middleware único que popula ambos os campos automaticamente, **para** nenhum endpoint esquecer de setar.
6. **Como** admin reatribuindo motorista via UC-A8 (Onda 2), **quero** a trilha gravar a reatribuição automaticamente, **para** auditabilidade do fluxo.

## 5. Requisitos funcionais

- **RF1** — Adicionar 2 colunas em 5 tabelas (10 colunas aditivas, zero destrutivas):
  - `updated_by uuid NULL` (FK para `users.id`)
  - `updated_at timestamp NULL`
  - Tabelas: `routes`, `schedules`, `users`, `cooperatives`, `cities`.
- **RF2** — Middleware Fastify `onRequest` extrai `jwt.sub` → popula `request.updatedBy`. Repositório consome esse valor em todo PUT/PATCH antes do commit, setando ambas as colunas.
- **RF3** — Toda operação `PUT`/`PATCH` seta ambas automaticamente. **Nenhum endpoint pode escrever direto nessas tabelas sem passar pelo middleware.**
- **RF4** — Response de GET das 5 entidades inclui ambos os campos (quando não-nulos). Front recebe `updated_by: { id, name }` ou `null` + `updated_at` ISO 8601.
- **RF5** — UI mostra no detalhe (`cooperative-detail-panel.tsx`, `route-detail.tsx`, equivalentes para schedules/users/cities): *"Última alteração por {Nome do Usuário} em {DD/MM/AAAA HH:MM}"*.
- **RF6** — Se `updated_by IS NULL` (entidade nunca editada): mostrar *"sem alterações registradas"*.
- **RF7** — Se `updated_by` referencia usuário soft-deleted: backend retorna `{ id, name: null, deleted: true }` → front mostra *"por usuário removido"*.
- **RF8** — Edge case `updated_at < created_at` (impossível, defensivo): usar `created_at` como fallback na UI.
- **RF9** — Campo `password_hash` em `users` **dispara `updated_at`** (decisão explícita do doc base: "qualquer mudança é mudança"). UI nunca revela o que mudou — apenas autor + data (R6).
- **RF10** — `created_at` continua existindo (nunca alterado). Este UC adiciona ao lado, não substitui.

## 6. Requisitos não-funcionais

- **Performance:** middleware é O(1) por request. Nenhum impacto em throughput.
- **Observability:** backend loga `updatedBy` em cada mutation (DEBUG level). Ajuda audit futuro.
- **Acessibilidade:** label de "Última alteração" tem `aria-label` completo (ex: "Última alteração por Fulano em 15 de outubro de 2026 às 14:30").
- **Internacionalização:** data formatada em pt-BR (`DD/MM/AAAA HH:MM`).
- **Segurança:** `updated_by` vem exclusivamente do JWT — não é aceito via body (impede spoofing).

## 7. Fluxo UX detalhado

1. Admin edita motorista de uma rota via `RouteFormDrawer`.
2. Front envia `PUT /api/admin/routes/:id` com body do campo alterado.
3. Backend: middleware `onRequest` extrai `jwt.sub` → popula `request.updatedBy = <admin.id>`.
4. Repositório antes do commit: `UPDATE routes SET ..., updated_by = $1, updated_at = NOW() WHERE id = $2`.
5. Response 200.
6. Front refetch (ou optimistic update + reconcile) → vê `updated_by: { id, name: 'Fulano' }` + `updated_at: '2026-10-15T14:30:00Z'`.
7. UI do detalhe mostra *"Última alteração por Fulano em 15/10/2026 14:30"*.
8. Edge case — entidade recém-criada: `updated_by IS NULL`. UI mostra *"sem alterações registradas"*.
9. Edge case — autor foi soft-deletado: response traz `{ id, name: null, deleted: true }`. UI mostra *"por usuário removido"*.
10. Edge case — admin trocou a senha de outro admin: `updated_at` dispara. UI do detalhe mostra *"Última alteração por X em DD/MM HH:MM"* **sem revelar o campo**.

## 8. Mudanças de API/schema

- **Schema (§7.2 item 14 doc base):** 10 colunas aditivas em 5 tabelas:
  - `routes.updated_by uuid NULL FK`, `routes.updated_at timestamp NULL`
  - `schedules.updated_by uuid NULL FK`, `schedules.updated_at timestamp NULL`
  - `users.updated_by uuid NULL FK`, `users.updated_at timestamp NULL`
  - `cooperatives.updated_by uuid NULL FK`, `cooperatives.updated_at timestamp NULL`
  - `cities.updated_by uuid NULL FK`, `cities.updated_at timestamp NULL`
- **Response de GET** das 5 entidades inclui `updated_by: { id, name } | null` + `updated_at: ISO 8601 | null`.
- **Endpoints:** zero novo. Mudança é no response e no middleware.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: admin altera motorista da rota, trilha é gravada**
```
Dado que o admin Fulano está logado
  E a rota R-204 nunca foi editada antes (updated_by = NULL)
Quando ele muda o motorista da rota via RouteFormDrawer e salva
Então o DB registra routes.updated_by = Fulano.id e updated_at = now
  E o detalhe da rota mostra "Última alteração por Fulano em DD/MM/AAAA HH:MM"
  E created_at permanece inalterado
```

**Cenário 2 — Edge case: entidade sem alteração ainda**
```
Dado que a cidade "Juazeiro" foi criada mas nunca editada
Quando o admin abre o detalhe de Juazeiro
Então o detalhe mostra "sem alterações registradas"
  E created_at continua visível em outra área do detalhe
```

**Cenário 3 — Erro: autor soft-deleted**
```
Dado que a rota R-204 foi alterada pelo usuário Beto
  E Beto depois foi soft-deletado
Quando o admin abre o detalhe de R-204
Então a UI mostra "Última alteração por usuário removido em DD/MM/AAAA HH:MM"
  E não há link clicável para o perfil do Beto
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.2 UC-A6 "Escopo Negativo":

- **NÃO** criar tabela `audit_log` com histórico completo (D15 descartou 5.1).
- **NÃO** mostrar diff ("campo X foi de A para B") — apenas autor e data.
- **NÃO** permitir filtrar listagens por `updated_by` ou `updated_at`.
- **NÃO** armazenar IP ou user-agent.

Reforço §6.3: sem auditoria granular. UC-A6 é embrião, não substituto de 5.1.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2:
- **Nenhuma dependência interna** no Bloco S.
- **A6 ~> toda operação de PUT/PATCH subsequente da Onda 1:** entrar **cedo** na onda minimiza retrabalho (middleware precisa estar vivo quando UC-A1, A7, A10, F1, A18+F4 começam a executar PUT/PATCH).
- Recomendação sequência (§4.3 roadmap): Semana 1, Dev1.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6.1 R6:
- **R6 (baixo):** `password_hash` em `users` dispara `updated_at` — pode gerar "ruído" visual quando última ação foi troca de senha. Mitigação: UI nunca revela o campo alterado (regra do doc base). Risco mitigado por design.

## Perguntas residuais

Nenhuma.
