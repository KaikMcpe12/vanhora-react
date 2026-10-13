# 02: Tabs temporais em `/schedules`

**PRD de origem:** [`../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md`](../../prds/fase1-01-uc-p4-pa2-tabs-temporais.md)

**Milestone:** Fase 1 — Pré-backend

**What to build:** `/schedules` passa a renderizar 3 tabs horizontais ("Partindo Agora", "Próximos", "Decorridos") com default derivado do horário atual e persistência via `?tab=now|next|past`. "Decorridos" tem peso visual menor. Empty state honesto quando aba ativa fica vazia após filtros, com CTA secundário "Ver Próximos" que troca de aba sem alterar filtros.

**Blocked by:** 01 (filtro date/dayOfWeek funcional é pré-requisito)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `fase1`, `front`, `passageiro`

## Acceptance criteria

- [ ] 3 tabs renderizam em `/schedules` usando `Tabs` do shadcn, `grid-cols-3`.
- [ ] Classificação temporal client-side: Partindo Agora `-30min a +60min`; Próximos `>+60min` até 23:59; Decorridos `<-30min`.
- [ ] Default: se há schedules em "Partindo Agora", abre nessa; senão, abre "Próximos".
- [ ] Persistência via `?tab=now|next|past` (nuqs).
- [ ] "Decorridos" com `opacity-70` + `text-muted-foreground` no label da aba.
- [ ] Empty state renderiza quando aba ativa fica vazia após filtros, com mensagem contextual e CTA "Ver Próximos".
- [ ] CTA "Ver Próximos" troca `?tab=next` preservando outros filtros.
- [ ] Alvos de toque das abas ≥44×44px.
- [ ] Navegação por teclado (Tab + Enter/Space) funcional nas 3 abas.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
