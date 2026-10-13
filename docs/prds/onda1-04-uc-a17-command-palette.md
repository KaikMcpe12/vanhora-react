# PRD — UC-A17 — Command palette (Cmd+K)

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Onda 1 — Contrato + backend inicial (Bloco Z — zero contrato novo)
> **Persona:** Admin + Cooperativa + Motorista (filtrado por role)
> **Decisões relacionadas:** D25 (acoplamento soft com UC-A18).

## 1. Resumo

Atalho global `Cmd+K` / `Ctrl+K` que abre palette com comandos comuns (navegar, criar, resolver). Reduz navegação em admin pesado. Catálogo estático em TypeScript (adicionar comando é 1 linha). Zero backend. Acoplamento com UC-A18 é **soft** por D25 — command palette **pode** listar `?today`/`?mine` mas não é obrigatório.

## 2. Problema real + usuário impactado

**Persona:** usuário admin (gestão pesada, 7 páginas CRUD) e, em menor grau, cooperativa (CRUD próprio) e motorista (atalhos básicos).

**Problema:** admin trafega entre muitas páginas (dashboard, cidades, cooperativas, usuários, rotas, horários, atrasos). Navegação por menu lateral + múltiplos cliques é lenta para "ir para rota R-204" ou "criar novo horário".

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §5.2 "UC-A17 — Command palette (Cmd+K)" (linhas ~607–637).
- **Doc base — D25 (acoplamento soft):** §3.7 (linha ~182).
- **Roadmap:** `../roadmap-execucao.md` §4.1 "Bloco Z" linha UC-A17 + §6.1 R7.

## 4. User stories

1. **Como** admin precisando ir para rota R-204, **quero** apertar `Cmd+K`, digitar "rota 204", pressionar Enter, **para** navegar sem passar pelo menu.
2. **Como** admin criando novo usuário, **quero** apertar `Cmd+K` → "novo usuário" → Enter, **para** abrir o modal direto.
3. **Como** cooperativa vendo o palette, **quero** ver apenas comandos do meu escopo, **para** não ser confundido por ações admin-only.
4. **Como** motorista navegando pelo palette, **quero** ver apenas comandos próprios (reportar atraso, iniciar viagem), **para** interface limpa.
5. **Como** usuário sem role (não logado), **quero** que o palette NÃO abra, **para** não vazar comandos privados.
6. **Como** usuário digitando "novo horário", "add schedule" ou "+ horário", **quero** chegar ao mesmo comando, **para** não precisar memorizar o label exato.
7. **Como** usuário sem Mac, **quero** `Ctrl+K` funcionar no Windows/Linux, **para** paridade entre plataformas.
8. **Como** usuário com palette aberto, **quero** fechar com Esc ou clique fora, **para** reflexo instintivo.

## 5. Requisitos funcionais

- **RF1** — Atalho global: `Cmd+K` (Mac) / `Ctrl+K` (Windows/Linux). Detecção via `navigator.platform` ou `event.metaKey` / `event.ctrlKey`.
- **RF2** — Usar `cmdk` (já é dependência via `SearchableSelect` — convenção §9.1).
- **RF3** — Catálogo de comandos em `src/lib/command-palette/commands.ts`. Cada comando: `{ id, label, icon, action, visibleIfRole, keywords }`.
- **RF4** — Hook global `useCommandPalette` com atalho de teclado + estado aberto/fechado.
- **RF5** — Comandos filtrados por role:
  - `admin` vê tudo.
  - `cooperative` vê só comandos de escopo próprio (ex: "novo horário", "ir para minhas rotas").
  - `driver` vê comandos próprios (ex: "reportar atraso", "iniciar viagem" quando UC-4.5 na Onda 2).
- **RF6** — Comando de navegação tem ícone de seta (`ArrowRight` ou similar); comando de ação tem ícone de ação (`Plus`, `Edit`, etc.).
- **RF7** — Comandos de "ir para X" fazem `navigate()`; "criar Y" abrem modal (reusando os modais existentes).
- **RF8** — Fecha com `Esc` ou clique fora (padrão `cmdk`).
- **RF9** — Keywords permitem múltiplas formas de achar o mesmo comando (ex: "novo horário", "add schedule", "+ horário" todos levam ao mesmo).
- **RF10** — **NÃO** mostrar palette no portal público (passageiro) — apenas em `/admin/*`, `/cooperative/*`, `/driver/*`.
- **RF11** — Catalogar `CommandPalette` em `/admin/components-preview` (convenção §9.3).
- **RF12** — Acoplamento com UC-A18 (D25 — soft): PODE listar `?today`/`?mine` como comandos (ex: "Hoje em /schedules", "Minha fila em /delays"). **Não obrigatório** — fica a critério do implementador.

## 6. Requisitos não-funcionais

- **Performance:** catálogo estático em TypeScript — zero overhead no bundle. Hook de atalho global pesa <1KB.
- **Acessibilidade:**
  - Palette tem `role="dialog"` + `aria-modal="true"`.
  - Input principal tem `autoFocus` ao abrir.
  - Lista navegável via `↑/↓` (default `cmdk`).
  - Enter dispara ação.
  - Esc fecha + devolve foco ao elemento que estava antes do atalho.
  - Alvos ≥44×44px em cada item.
- **Mobile-first:** `Cmd+K` é teclado — em mobile o palette pode ter CTA secundário no header (ícone de busca) para abertura via toque. Opcional nesta primeira versão.

## 7. Fluxo UX detalhado

1. Usuário logado em `/admin/*`, `/cooperative/*` ou `/driver/*` aperta `Cmd+K` (ou `Ctrl+K`).
2. `useCommandPalette` detecta → abre overlay centralizado.
3. Input de busca autofocus; placeholder: "Buscar comando ou destino…".
4. Lista de comandos filtrada por role aparece abaixo (todos visíveis se busca vazia).
5. Usuário digita "rota 204" → filtro `cmdk` fuzzy-matcha os `label` e `keywords`.
6. Enter no comando selecionado:
   - Navegação: `navigate("/admin/routes?highlight=<r204-uuid>")` + fecha palette.
   - Ação: abre modal + fecha palette.
7. Esc ou clique fora fecha palette; foco volta ao elemento anterior.
8. Edge case — usuário sem role (ex: pré-login): atalho é no-op (palette não abre).
9. Edge case — comando pede permissão que o usuário não tem: oculto pelo `visibleIfRole`.
10. Edge case — colisão de atalho com browser (R7 roadmap): logar aviso no `components-preview`, oferecer fallback `Ctrl+/` se detectar colisão. Baixa prioridade.

## 8. Mudanças de API/schema

**Nenhuma.** Zero backend.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: admin navega para rota via palette**
```
Dado que o admin está em /admin/dashboard
Quando pressiona Cmd+K
  E digita "rota 204"
  E pressiona Enter no comando "Ir para rota R-204"
Então o palette fecha
  E a URL muda para /admin/routes?highlight=<r204-uuid>
  E o foco volta ao elemento que estava focado antes do atalho
```

**Cenário 2 — Edge case: cooperative não vê comandos admin-only**
```
Dado que o usuário tem role "cooperative"
Quando pressiona Cmd+K
Então o palette abre
  E a lista NÃO inclui "Deletar cooperativa" (admin-only)
  E a lista inclui "Novo horário" (coop pode criar)
```

**Cenário 3 — Erro: palette não abre no portal público**
```
Dado que o usuário está em / (home pública, sem login)
Quando pressiona Cmd+K
Então nada acontece
  E o palette não renderiza
```

## 10. Escopo negativo

Herdado integral de `vanhora-decisoes-e-casos-de-uso.md` §5.2 UC-A17 "Escopo Negativo":

- **NÃO** adicionar busca "fuzzy" por entidades (ex: "pedro silva" → vai para usuário Pedro Silva). PR separado se precisar.
- **NÃO** adicionar histórico de comandos recentes nesta primeira versão.
- **NÃO** permitir customização pelo usuário (alias etc).
- **NÃO** mostrar o command palette no portal público.

Reforço §6.3: sem IA sugerindo comandos. Catálogo é estático.

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.2:
- **Nenhuma dependência de backend.**
- **A17 ~> A18 (D25 — soft):** command palette pode listar atalhos nomeados de UC-A18. Não bloqueia.
- Pode subir cedo no Bloco Z paralelo a UC-A13.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6.1:
- **R7 (baixo):** `Cmd+K` pode colidir com atalhos nativos do browser (Firefox em alguns OS). Mitigação: documentar no `components-preview`; oferecer fallback `Ctrl+/` se detectar colisão.

## Perguntas residuais

Nenhuma.
