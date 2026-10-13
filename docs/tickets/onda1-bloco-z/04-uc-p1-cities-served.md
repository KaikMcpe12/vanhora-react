# 04: UC-P1 — `/about` consome `GET /api/cities/served`

**PRD de origem:** [`../../prds/onda1-01-uc-p1-cities-served.md`](../../prds/onda1-01-uc-p1-cities-served.md) (UC-P1 — Onda 1 por D21)

**Milestone:** Onda 1 — Bloco Z

**What to build:** página `/about` passa a consumir `GET /api/cities/served` para listar cidades atendidas, substituindo o array hardcoded em `about.tsx:126`. Hook `useCitiesServed()` com React Query, `staleTime` 1h. Loading com skeleton; error silencioso com fallback para a lista estática atual. Edge case `cities: []` → mensagem "Em breve, atendemos novas cidades" em vez de seção vazia.

**Blocked by:** Backend inicial expor `GET /api/cities/served` (dependência externa a este milestone)

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-z`, `front`, `passageiro`

## Acceptance criteria

- [ ] Hook `useCitiesServed()` criado com React Query, `staleTime` 1h.
- [ ] `/about` consome o hook; constante hardcoded em `about.tsx:126` removida no mesmo PR (sem coexistência — convenção §9.3).
- [ ] Loading: skeleton de 6 placeholders de cidade.
- [ ] Error (4xx/5xx/timeout): fallback para lista estática + `console.error` com contexto; sem toast.
- [ ] Edge case `cities: []`: mensagem "Em breve, atendemos novas cidades".
- [ ] Lista semântica (`<ul>`), cada item com `aria-label` completo.
- [ ] Skeleton tem `aria-busy="true"` e `aria-label="Carregando cidades"`.
- [ ] Grid responsivo (ex: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
