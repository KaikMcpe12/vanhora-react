# 03: Catálogo de comandos filtrado por role (UC-A17)

**PRD de origem:** [`../../prds/onda1-04-uc-a17-command-palette.md`](../../prds/onda1-04-uc-a17-command-palette.md)

**Milestone:** Onda 1 — Bloco Z

**What to build:** o command palette passa a ter catálogo de comandos reais, filtrado por role do usuário. Admin vê tudo, cooperativa só comandos de escopo próprio, motorista só comandos próprios. Comandos de navegação fazem `navigate()`; comandos de ação abrem modais reusando os existentes. Keywords permitem múltiplas formas de encontrar o mesmo comando ("novo horário" vs "add schedule" vs "+ horário"). Acoplamento com UC-A18 (D25 — soft): opcional listar `?today`/`?mine` como comandos.

**Blocked by:** 02

**Status:** ready-for-agent

**Estimativa:** 1.5d

**Labels:** `onda1`, `bloco-z`, `front`, `transversal`

## Acceptance criteria

- [ ] Catálogo estático em `src/lib/command-palette/commands.ts`. Cada comando: `{ id, label, icon, action, visibleIfRole, keywords }`.
- [ ] Filtro `visibleIfRole`: admin vê tudo; cooperativa vê escopo próprio; motorista vê comandos próprios.
- [ ] Comando de navegação tem ícone de seta (ex: `ArrowRight` da Lucide); comando de ação tem ícone de ação (ex: `Plus`, `Edit`).
- [ ] Comandos "ir para X" fazem `navigate()`; "criar Y" abrem o modal correspondente existente.
- [ ] Keywords permitem múltiplas formas (ex: um comando "Novo horário" é achável por "add schedule", "+ horário", "novo horário").
- [ ] Role `driver` só vê comandos próprios (ex: "Reportar atraso"; "Iniciar viagem" só chega na Onda 2 via UC-4.5).
- [ ] **D25:** command palette **pode** listar atalhos `?today`/`?mine` como comandos — não obrigatório; se incluir, labels claros ("Hoje em /schedules", "Minha fila em /delays").
- [ ] Portal público permanece sem palette.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.
