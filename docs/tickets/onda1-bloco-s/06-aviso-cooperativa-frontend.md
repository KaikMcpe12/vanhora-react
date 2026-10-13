# 06: UC-F1 — Frontend aviso (admin edit + público view)

**PRD de origem:** [`../../prds/onda1-08-uc-f1-aviso-cooperativa-passageiro.md`](../../prds/onda1-08-uc-f1-aviso-cooperativa-passageiro.md)

**Milestone:** Onda 1 — Bloco S

**What to build:** cooperativa passa a poder editar o aviso de rota via `RouteFormDrawer` (seção colapsável "Aviso aos passageiros" com textarea 0/280, date-time picker e preview do banner). Passageiro público vê o aviso de duas formas: banner amarelo compacto no `ScheduleCard` daquela rota e bloco destacado em `/routes/:id`.

**Blocked by:** 05

**Status:** ready-for-agent

**Estimativa:** 1d

**Labels:** `onda1`, `bloco-s`, `front`, `cooperativa`, `passageiro`

## Acceptance criteria

- [ ] `RouteFormDrawer` ganha seção colapsável "Aviso aos passageiros" com:
  - Textarea com contador 0/280.
  - Date-time picker para `expires_at` (default sugerido hoje 23:59).
  - Preview inline do banner como aparecerá no `ScheduleCard`.
- [ ] Front replica a validação cross-field do backend (feedback imediato antes do submit).
- [ ] `ScheduleCard` renderiza banner compacto quando `announcement_text` presente:
  - Tom `warning` via `StatusChip`.
  - Ícone `Megaphone` ou `Info` (Lucide).
  - Texto truncado em 1 linha com tooltip full.
- [ ] `/routes/:id` renderiza bloco destacado maior com texto completo + validade "Válido até DD/MM HH:MM".
- [ ] Banner comunica via cor + ícone + texto; alvo ≥44×44px.
- [ ] Mobile: banner em 1 linha com truncate; tooltip (tap) revela texto completo.
- [ ] Catalogação do banner + bloco destacado em `/admin/components-preview`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
