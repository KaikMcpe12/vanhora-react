# PRDs — VanHora

Índice de Product Requirements Documents por UC. Cada PRD é um arquivo autônomo que herda escopo, decisões e convenções de dois documentos canônicos:

- `../vanhora-decisoes-e-casos-de-uso.md` v1.1.0 (lei — decisões, UCs, escopo negativo, schema)
- `../roadmap-execucao.md` v1.1.0 (mapa — dependências, esforço, riscos)

Nenhum PRD pode contradizer os documentos canônicos. Em dúvida, a hierarquia é: **doc base > roadmap > PRD**.

## Índice de PRDs

Legenda de status:
- 🟡 `draft` — primeira versão, não revisado.
- 🟢 `aprovado` — revisado e autorizado para implementação.
- 🔵 `em implementação` — PR aberto ou em desenvolvimento.
- ⚫ `concluído` — merge em `main` + "feito quando" verde.

### Fase 1 — Pré-backend (2 UCs + 1 chore)

| # | Arquivo | UC | Persona | Status |
|---|---------|-----|---------|--------|
| 1 | [`fase1-01-uc-p4-pa2-tabs-temporais.md`](./fase1-01-uc-p4-pa2-tabs-temporais.md) | UC-P4+PA2 — Tabs Partindo Agora / Próximos / Decorridos em `/schedules` (absorve UC-P3) | Público / Passageiro | 🟡 draft |
| 2 | [`fase1-02-uc-pa1-banner-cancelamento.md`](./fase1-02-uc-pa1-banner-cancelamento.md) | UC-PA1 — Banner de cancelamento em favoritos (`HomeFeedSection`) | Público / Passageiro | 🟡 draft |
| 3 | [`fase1-03-higiene-mock-cooperative-filter.md`](./fase1-03-higiene-mock-cooperative-filter.md) | Chore — Auto-filtro `cooperative_id` em páginas compartilhadas | Cooperativa (role) | 🟡 draft |

### Onda 1 — Contrato + backend inicial (11 UCs)

| # | Arquivo | UC | Persona | Status |
|---|---------|-----|---------|--------|
| 1 | [`onda1-01-uc-p1-cities-served.md`](./onda1-01-uc-p1-cities-served.md) | UC-P1 — `/about` consome `GET /api/cities/served` | Público / Passageiro | 🟡 draft |
| 2 | [`onda1-02-uc-p2-destinations-popular.md`](./onda1-02-uc-p2-destinations-popular.md) | UC-P2 — `PopularRoutesSection` consome `GET /api/destinations/popular` | Público / Passageiro | 🟡 draft |
| 3 | [`onda1-03-uc-a13-driver-my-delays.md`](./onda1-03-uc-a13-driver-my-delays.md) | UC-A13 — Histórico próprio de atrasos (`/driver/my-delays`) | Motorista | 🟡 draft |
| 4 | [`onda1-04-uc-a17-command-palette.md`](./onda1-04-uc-a17-command-palette.md) | UC-A17 — Command palette (Cmd+K) | Admin + Cooperativa + Motorista | 🟡 draft |
| 5 | [`onda1-05-uc-a6-updated-by.md`](./onda1-05-uc-a6-updated-by.md) | UC-A6 — `updated_by` / `updated_at` embrionário | Admin + Cooperativa | 🟡 draft |
| 6 | [`onda1-06-uc-a7-schedules-temporary-driver.md`](./onda1-06-uc-a7-schedules-temporary-driver.md) | UC-A7 — Horário temporário com motorista substituto | Cooperativa | 🟡 draft |
| 7 | [`onda1-07-uc-a10-rotas-orfas.md`](./onda1-07-uc-a10-rotas-orfas.md) | UC-A10 — Sinalizar rotas órfãs (motorista inativo) | Admin + Cooperativa | 🟡 draft |
| 8 | [`onda1-08-uc-f1-aviso-cooperativa-passageiro.md`](./onda1-08-uc-f1-aviso-cooperativa-passageiro.md) | UC-F1 — Aviso da cooperativa para passageiro público | Cooperativa → Passageiro | 🟡 draft |
| 9 | [`onda1-09-uc-a1-cancelar-horarios-bulk.md`](./onda1-09-uc-a1-cancelar-horarios-bulk.md) | UC-A1 — Cancelar N horários de motorista em janela de datas | Admin + Cooperativa | 🟡 draft |
| 10 | [`onda1-10-uc-a2-excecao-intervalo.md`](./onda1-10-uc-a2-excecao-intervalo.md) | UC-A2 — Exceção em intervalo de datas (recesso) | Admin + Cooperativa | 🟡 draft |
| 11 | [`onda1-11-uc-a18-f4-deep-links-resolved.md`](./onda1-11-uc-a18-f4-deep-links-resolved.md) | UC-A18 + UC-F4 — Deep-links nomeados (`?today`/`?mine`) + `resolved_by` em delays | Admin + Cooperativa + Motorista | 🟡 draft |

### Onda 2 — Pós-MVP backend (não gerado nesta fase)

7 UCs ficam para a próxima rodada de PRDs, após MVP do backend em produção. Lista no roadmap `../roadmap-execucao.md` §5.

## Como usar

### Para leitor

1. Abra o PRD do UC alvo.
2. Confira §3 "Fonte canônica" para rastrear a decisão original no doc base.
3. Siga as 12 seções em ordem. §10 "Escopo negativo" é regra, não sugestão.

### Para proponente de mudança

PRDs são versionados via Git. Qualquer mudança substantiva (regra de negócio, requisito, critério BDD) exige:
1. Edição do PRD afetado + bump de versão `0.X.0` → `0.(X+1).0` no cabeçalho.
2. Verificação de contradição com doc base e roadmap. Se contradizer, atualize antes **o canônico** (doc base/roadmap) e depois o PRD.
3. Registro no histórico de revisões (seção opcional no fim de cada PRD).

### Para implementador

PRD é o documento que você segue durante o PR. Checklist mínimo antes de abrir PR:
- Todas as regras RF* implementadas.
- Todos os critérios BDD passam (podem virar testes de teclado/manuais quando não há stack de teste).
- Nenhum item do §10 "Escopo negativo" presente no diff.
- Catalogação em `/admin/components-preview` quando o PRD cria componente novo (padrão PR3a+).
- `npx tsc --noEmit`, `npm run lint`, `npm run build` verdes.

## Convenções técnicas obrigatórias (herança do doc base §9)

Todo PRD assume as convenções do doc base §9 sem repetir — mencionadas explicitamente apenas quando divergem ou precisam de ênfase. Resumo:

- **Front-end:** `AdminTable`, `AdminPagination`, `AdminKPICard`, `AdminConfirmDialog`, `AdminEmptyState`, `AdminFilterBar`, `StatusChip` (com `*_STATUS_META`), `SeverityBadge` (via `severityFromMinutes()`), `CooperativePicker`, `WeekdayPicker`, `SearchableSelect`, `useTableFilters` sobre `nuqs`, `useFormDialogState`. Flat design (sem shadow em cards). Cor + ícone + texto em todo status. Alvos ≥44×44px. Lucide React para ícones.
- **Back-end:** base URL `/api/*`. JWT access 15min + refresh 7d com rotação. Paginação zero-indexed (exceção `/admin/users` 1-indexed). UUID v4 em todos os IDs. Response de erro `{ error: { code, message, details? } }`. Backend enforça escopo por role via JWT.
- **Padrão de PR:** "Feito quando" como checklist verificável; delete do antigo no mesmo PR que cria substituto (sem coexistência); testes de teclado obrigatórios; catalogação em `components-preview`.

## Versionamento

Cada PRD tem seu próprio versionamento `0.X.0` no cabeçalho. O índice (este README) acompanha a mudança de status (🟡 → 🟢 → 🔵 → ⚫) mas não o conteúdo dos PRDs. Versionamento via Git.
