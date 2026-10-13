# 02: Command palette core (UC-A17)

**PRD de origem:** [`../../prds/onda1-04-uc-a17-command-palette.md`](../../prds/onda1-04-uc-a17-command-palette.md)

**Milestone:** Onda 1 — Bloco Z

**What to build:** usuário logado em `/admin/*`, `/cooperative/*` ou `/driver/*` passa a abrir uma command palette com `Cmd+K` (Mac) ou `Ctrl+K` (Windows/Linux). O overlay mostra input com autofocus, lista navegável por teclado (↑/↓ + Enter + Esc), tem `role="dialog"` e devolve o foco ao fechar. Nenhum comando no catálogo ainda — isso é o ticket 03. Usuário sem role (não logado, portal público) → palette não abre.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-z`, `front`, `transversal`

## Acceptance criteria

- [ ] Hook global `useCommandPalette` controla estado aberto/fechado.
- [ ] Atalho `Cmd+K` em Mac e `Ctrl+K` em Windows/Linux abre o overlay (detecção via `event.metaKey`/`event.ctrlKey` ou `navigator.platform`).
- [ ] Overlay usa `cmdk` (já dependência via `SearchableSelect`), `role="dialog"`, `aria-modal="true"`.
- [ ] Input principal com `autoFocus` ao abrir.
- [ ] Esc fecha + devolve foco ao elemento que estava focado antes do atalho.
- [ ] Clique fora fecha.
- [ ] Lista navegável por `↑/↓`; Enter dispara ação do item selecionado.
- [ ] Alvos ≥44×44px em cada item da lista.
- [ ] Palette **NÃO abre** no portal público (passageiro sem login).
- [ ] Palette **NÃO abre** se `role === undefined` (defensivo).
- [ ] Catalogado em `/admin/components-preview`.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
