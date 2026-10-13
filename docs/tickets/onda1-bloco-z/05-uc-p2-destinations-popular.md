# 05: UC-P2 — `PopularRoutesSection` consome `GET /api/destinations/popular`

**PRD de origem:** [`../../prds/onda1-02-uc-p2-destinations-popular.md`](../../prds/onda1-02-uc-p2-destinations-popular.md) (UC-P2 — Onda 1 por D21)

**Milestone:** Onda 1 — Bloco Z

**What to build:** home passa a mostrar 6 destinos realmente populares via `GET /api/destinations/popular`. Hook `usePopularDestinations({ limit, date })`, cache 15min, fallback para lista estática em erro. `brand_color` da cooperativa primária é aplicado em borda/chip do card. Cidade sem schedules ativos no dia é excluída pelo backend — front não re-ordena nem re-filtra. Edge case destinos < 6: renderiza só os retornados (sem placeholders).

**Blocked by:** Backend inicial expor `GET /api/destinations/popular`

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-z`, `front`, `passageiro`

## Acceptance criteria

- [ ] Hook `usePopularDestinations({ limit, date })` criado; chama `GET /api/destinations/popular?limit=6&date=<today>`.
- [ ] Cache cliente `staleTime` 15min.
- [ ] `PopularRoutesSection` consome o hook; array hardcoded removido no mesmo PR.
- [ ] Loading: skeleton de 6 cards.
- [ ] Error: fallback para lista estática + `console.error`; sem toast.
- [ ] Response com `destinations.length < 6`: renderizar apenas os retornados sem placeholders fake.
- [ ] `brand_color` da `primary_cooperative` aplicado como borda ou chip no card (reuso padrão PR8).
- [ ] Cada card é um link navegável (`<a>` ou `Link`), não `<div onClick>`.
- [ ] Cada card com `aria-label` completo (ex: "Juazeiro do Norte, 8 horários, a partir de R$ 18, Cooperativa Sertão Expresso").
- [ ] Grid responsivo (ex: `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`).
- [ ] Mudança de `?date=<outra>` recalcula destinos.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
