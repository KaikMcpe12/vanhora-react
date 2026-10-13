# PRD — Chore — Higiene mock: auto-filtro `cooperative_id` em páginas compartilhadas

> **Versão:** 0.1.0 — 2026-10-08
> **Status:** 🟡 draft
> **Fase:** Fase 1 — Pré-backend
> **Persona:** Role `cooperative` (via usuário autenticado como cooperativa)
> **Natureza:** Chore de higiene — não é UC de produto. Alinha mock com comportamento JWT que o backend vai enforçar (`api-spec.md §3.3`, §3.4, §3.7).

## 1. Resumo

As páginas compartilhadas `RoutesPage` e `SchedulesPage` (reusadas em `/admin/*` e `/cooperative/*`) hoje não filtram automaticamente por `cooperative_id` no mock para role `cooperative`. O backend vai enforçar isso via JWT. Este chore alinha o mock com o comportamento esperado, prevenindo vazamento inter-cooperativa durante dev.

## 2. Problema real + usuário impactado

**Persona:** usuário role `cooperative` logado no portal (uma coop específica, com `cooperativeId` conhecido no `AppPortalUser`).

**Problema:** auditoria 2026-09 (`auditoria-completude-2026-09.md`, referenciada no doc base §2.3) classificou a cooperativa como "cumpre com ressalva de higiene (`cooperative_id` não filtrado em páginas compartilhadas no mock — backend enforça via JWT)". Durante dev e QA, cooperativa consegue ver rotas/horários de outra cooperativa — descolamento perigoso vs produção.

## 3. Fonte canônica

- **Doc base:** `../vanhora-decisoes-e-casos-de-uso.md` §2.3 "Cobertura por Persona" linha "Cooperativa" (linha ~98).
- **Doc base — contratos de role:** `api-spec.md §3.3`, §3.4, §3.7 (enforcement por JWT no backend).
- **Roadmap:** `../roadmap-execucao.md` §3 Fase 1 item 3 + §3.2 "Critério de pronto" + §2.1 (0 dependências).

## 4. User stories

1. **Como** usuário role `cooperative` em `/cooperative/routes`, **quero** ver só as rotas da minha cooperativa, **para** o mock refletir a realidade do backend.
2. **Como** usuário role `cooperative` em `/cooperative/schedules`, **quero** ver só os horários das minhas rotas, **para** não ter falsa impressão sobre volume total do sistema.
3. **Como** usuário role `admin`, **quero** continuar vendo tudo (rotas e horários de todas as cooperativas), **para** o filtro automático não me prejudicar.
4. **Como** desenvolvedor da plataforma, **quero** o filtro aplicado **antes** de `useTableFilters` consumir a lista, **para** `cooperative_id` não aparecer na URL do usuário role `cooperative` (seria redundante com o JWT real).
5. **Como** QA testando dev, **quero** que trocar o role no mock (de `admin` para `cooperative`) imediatamente mude a listagem, **para** validar visualmente o enforcement.
6. **Como** desenvolvedor do backend, **quero** uma nota explícita no mock sobre o enforcement JWT real, **para** não re-implementar lógica no backend achando que o mock já cobre.

## 5. Requisitos funcionais

- **RF1** — Em `RoutesPage` (compartilhada entre `/admin/*` e `/cooperative/*`), quando o `role` do `AppPortalOutletContext` é `cooperative`, filtrar o array de rotas por `route.cooperativeId === user.cooperativeId` **antes** de passar para `useTableFilters`.
- **RF2** — Em `SchedulesPage`, mesma lógica: filtrar schedules por `schedule.cooperativeId === user.cooperativeId` quando role é `cooperative`.
- **RF3** — `cooperative_id` **não aparece na URL** quando a role é `cooperative` (é inferido pelo contexto, não é filtro ajustável).
- **RF4** — Role `admin` **não é afetado** — continua vendo tudo.
- **RF5** — Role `driver` **não é afetado** — essas páginas não são acessíveis via navegação `driver` (ver `app-portal-navigation.ts`).
- **RF6** — Comentário inline no código próximo ao filtro: `// Backend enforça via JWT (api-spec.md §3.3/3.4/3.7). Mock replica para alinhar comportamento em dev.`
- **RF7** — Zero regressão nos testes de teclado Tab/Enter/Space nas páginas tocadas.
- **RF8** — Nenhuma mudança no shape de `useTableFilters`, nenhum breaking change em consumidores.

## 6. Requisitos não-funcionais

- **Performance:** `useMemo` sobre a lista filtrada antes do `useTableFilters` (evita refiltrar a cada re-render).
- **Acessibilidade:** nenhuma mudança — chore é invisível para o usuário.
- **Manutenibilidade:** fonte única da verdade no mock (não duplicar a lógica em cada hook consumidor). Idealmente um helper `filterByUserScope(entities, user)` reutilizável.
- **Observability:** nenhuma — é mock. Em produção, o enforcement vem do JWT no backend.

## 7. Fluxo UX detalhado

Chore invisível ao usuário final. Fluxo técnico:

1. `AppPortalLayout` injeta `AppPortalOutletContext = { role, user, basePath }` nas páginas filhas.
2. `RoutesPage` e `SchedulesPage` consomem `useOutletContext<AppPortalOutletContext>()`.
3. Hook do mock (ex: `useRoutes()`, `useSchedules()`) retorna o array completo.
4. **Novo passo:** aplicar `filterByUserScope(array, user)`:
   - Se `role === 'admin'`: retorna array sem alteração.
   - Se `role === 'cooperative'`: filtra por `cooperativeId === user.cooperativeId`.
   - Se `role === 'driver'`: comportamento indefinido para essas páginas (não há navegação); seguro delegar para filtro existente ou retornar array vazio.
5. Array filtrado é consumido por `useTableFilters` normalmente.
6. UI não indica o filtro de scope (não há "chip removível" — é invisível).
7. Admin troca para role `cooperative` no mock (via dev tool ou user switcher): página re-renderiza com subset.

## 8. Mudanças de API/schema

**Nenhuma.** Chore é 100% client-side no mock. O backend já tem o enforcement como requisito via `api-spec.md §3.3/3.4/3.7` (role scoping no JWT) — este chore apenas alinha o mock com esse comportamento futuro.

## 9. Critérios de aceite BDD

**Cenário 1 — Happy path: cooperativa Alpha não vê rotas da cooperativa Beta**
```
Dado que o usuário autenticado tem role "cooperative" e cooperativeId = "alpha-uuid"
  E existem 10 rotas no mock, 4 da cooperativa Alpha e 6 da Beta
Quando o usuário abre /cooperative/routes
Então a tabela renderiza exatamente 4 rotas (todas da Alpha)
  E a URL não contém "?cooperative_id=alpha-uuid"
  E os filtros disponíveis em useTableFilters não oferecem "cooperativa" como campo
```

**Cenário 2 — Edge case: admin continua vendo tudo**
```
Dado que o usuário autenticado tem role "admin"
  E existem 10 rotas no mock (4 Alpha + 6 Beta)
Quando o usuário abre /admin/routes
Então a tabela renderiza 10 rotas
  E o filtro CooperativePicker continua disponível em useTableFilters
Quando o admin seleciona "Alpha" no CooperativePicker
Então a tabela renderiza 4 rotas (filtro manual, não automático)
```

**Cenário 3 — Erro / regressão: zero regressão de teclado**
```
Dado que o usuário é cooperative e está em /cooperative/schedules
Quando navega via Tab por toda a tabela
Então o foco segue a ordem documental sem skip ou armadilha
  E Enter em cada linha abre o detalhe (comportamento PR7 preservado)
  E Space em cada linha segue mesmo comportamento
  E focus-visible:ring-2 continua visível
```

## 10. Escopo negativo

Não há "Anti-alucinação" específica no doc base para este chore (não é UC). Reforço de regras globais §6.3 + bom senso:

- **NÃO** criar seletor de "scope" visível na UI — scope é inferido do contexto, não ajustável.
- **NÃO** adicionar `cooperative_id` ao schema de filtros persistentes (`nuqs`) para role `cooperative`.
- **NÃO** mudar comportamento do admin.
- **NÃO** criar nova entidade ou endpoint. Chore é client-side.
- **NÃO** adicionar logs/analytics do que foi filtrado (chore de higiene, não telemetria).
- **NÃO** aplicar o filtro em `/cooperative/dashboard` ou outras páginas específicas da coop — essas já são escopadas por design. Este chore cobre apenas páginas **compartilhadas** (RoutesPage, SchedulesPage).

## 11. Dependências

Herdado de `roadmap-execucao.md` §2.1 Fase 1:
- **Nenhuma dependência interna** — paralelo com UC-P4+PA2 e UC-PA1.
- **Nenhuma dependência de backend** — chore vive 100% no mock.

## 12. Riscos aplicáveis

Herdado de `roadmap-execucao.md` §6:
- **R11 (técnico, baixo):** se backend atrasar ou mudar o shape de JWT, este alinhamento pode ficar fora de sync. Mitigação: comentário inline explícito citando `api-spec.md §3.3/3.4/3.7` facilita o audit futuro.

## Perguntas residuais

Nenhuma.
