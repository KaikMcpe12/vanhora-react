# 04: Banner de cancelamento em favoritos (HomeFeedSection)

**PRD de origem:** [`../../prds/fase1-02-uc-pa1-banner-cancelamento.md`](../../prds/fase1-02-uc-pa1-banner-cancelamento.md) (UC-PA1)

**Milestone:** Fase 1 — Pré-backend

**What to build:** passageiro abrindo a home com favoritos cancelados hoje vê banner amarelo discreto ("1/N dos seus favoritos hoje está cancelado"). Clique no banner leva para `/schedules/favorites?status=cancelled`. Botão X dispensa persistindo em `localStorage` até virar o dia. Zero favoritos → banner não aparece e não há chamada de rede. API falhando → banner silencioso.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 0.5d

**Labels:** `fase1`, `front`, `passageiro`

## Acceptance criteria

- [ ] Banner aparece **só se** há ≥1 favorito com `badge: "cancelled"` para a data hoje.
- [ ] Mensagem adapta plural: "1 dos seus favoritos hoje está cancelado" / "N dos seus favoritos hoje estão cancelados".
- [ ] Tom `warning` via `StatusChip` + ícone `AlertCircle` (Lucide).
- [ ] Clique no corpo do banner leva para `/schedules/favorites?status=cancelled`.
- [ ] Botão X persiste `localStorage.vanhora_cancelled_banner_dismissed = <today ISO>` e remove banner do DOM.
- [ ] Dia seguinte: localStorage fica stale e banner reaparece se condição persistir.
- [ ] Zero favoritos no `localStorage` → nenhuma chamada de rede, nenhum banner.
- [ ] API 500/timeout → `console.error` + banner não renderiza (sem toast).
- [ ] Botão X ≥44×44px. Banner com `role="status"` e `aria-live="polite"`.
- [ ] Catalogação do banner em `/admin/components-preview`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
