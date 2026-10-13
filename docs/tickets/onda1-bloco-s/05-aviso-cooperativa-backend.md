# 05: UC-F1 — Backend aviso cooperativa→passageiro

**PRD de origem:** [`../../prds/onda1-08-uc-f1-aviso-cooperativa-passageiro.md`](../../prds/onda1-08-uc-f1-aviso-cooperativa-passageiro.md)

**Milestone:** Onda 1 — Bloco S

**What to build:** base de backend para avisos por rota. Adicionar `announcement_text varchar(280) NULL` e `announcement_expires_at timestamp NULL` em `routes`. Validação cross-field Zod: `expires_at` obrigatório quando `text` presente, `text` 1–280 chars, `expires_at` em ISO 8601 futuro. `PUT /api/admin/routes/:id` passa a aceitar os 2 campos. GETs (`/api/schedules`, `/api/routes/:id`, `/api/admin/routes`) retornam os 2 campos **apenas** quando `expires_at > now()` — backend filtra expiração automaticamente.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-s`, `back`

## Acceptance criteria

- [ ] Migration adiciona `routes.announcement_text varchar(280) NULL` e `routes.announcement_expires_at timestamp NULL`.
- [ ] Index parcial sugerido: `CREATE INDEX idx_routes_announcement ON routes(announcement_expires_at) WHERE announcement_expires_at IS NOT NULL`.
- [ ] Validação Zod cross-field: `expires_at IS NOT NULL` obrigatório quando `text IS NOT NULL` (422 se violado).
- [ ] Validação Zod: `text` 1–280 chars.
- [ ] Validação Zod: `expires_at` ISO 8601 **futuro** (rejeita passado).
- [ ] Texto puro apenas — sem markdown, sem HTML (prevenção XSS §6.3).
- [ ] `PUT /api/admin/routes/:id` aceita os 2 campos (aditivo).
- [ ] GETs filtram automaticamente: se `expires_at <= now()`, retorna `announcement_text: null` + `announcement_expires_at: null`.
- [ ] Rota suspensa (`status = 'suspended'`) com aviso: backend **continua** retornando (contexto útil).
- [ ] Testes backend verdes.
