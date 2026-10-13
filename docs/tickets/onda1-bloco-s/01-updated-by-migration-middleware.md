# 01: UC-A6 — Migration `updated_by/updated_at` (5 tabelas) + middleware Fastify

**PRD de origem:** [`../../prds/onda1-05-uc-a6-updated-by.md`](../../prds/onda1-05-uc-a6-updated-by.md)

**Milestone:** Onda 1 — Bloco S

**What to build:** base de infraestrutura de trilha mínima. 10 colunas aditivas (`updated_by uuid NULL FK` + `updated_at timestamp NULL`) em 5 tabelas (routes, schedules, users, cooperatives, cities). Middleware Fastify `onRequest` extrai `jwt.sub` → repositório popula ambas as colunas em todo PUT/PATCH antes do commit. Response de GET das 5 entidades passa a incluir `updated_by: { id, name } | null` + `updated_at: ISO 8601 | null`. **Entrar cedo** na onda para que PUT/PATCH subsequentes já carreguem a trilha.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-s`, `back`, `fullstack`

## Acceptance criteria

- [ ] Migration adiciona 10 colunas (2 × 5 tabelas): `routes`, `schedules`, `users`, `cooperatives`, `cities`.
- [ ] Colunas são `updated_by uuid NULL FK users(id)` e `updated_at timestamp NULL`.
- [ ] Nenhuma mudança destrutiva (coluna é NULL por default; backfill não necessário).
- [ ] Middleware Fastify `onRequest` extrai `jwt.sub` → popula `request.updatedBy`.
- [ ] Repositório, antes de commit de PUT/PATCH, aplica `updated_by = request.updatedBy` + `updated_at = NOW()`.
- [ ] **Nenhum** endpoint pode escrever direto nas 5 tabelas sem passar pelo middleware (hooks de integridade no repositório).
- [ ] `updated_by` **nunca** é aceito via body (impede spoofing).
- [ ] Response GET das 5 entidades inclui `updated_by: { id, name } | null` + `updated_at: ISO 8601 | null`.
- [ ] Se autor foi soft-deletado: response retorna `{ id, name: null, deleted: true }`.
- [ ] Campo `password_hash` em `users` dispara `updated_at` (decisão doc base: qualquer mudança é mudança).
- [ ] `created_at` nunca é alterado por este fluxo.
- [ ] Logging DEBUG: cada mutation registra `updatedBy` para audit futuro.
- [ ] Testes do backend verdes.
