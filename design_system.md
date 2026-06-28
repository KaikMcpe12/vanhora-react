# Design System — Vanhora (estado atual + plano de evolução)

> **Nota sobre fontes.** O arquivo `guia_inspiracao_vanhora.md` citado na tarefa **não existe** no repositório.
> Esta análise usa como "guia de inspiração" o documento `docs/design-refactor-plan.md`, que carrega o
> princípio norteador do produto: usuário **leigo**, no **celular**, com um único objetivo — *"descobrir
> quando a próxima van sai e para onde"* — e cujas referências declaradas são **Google Maps, Moovit/Rome2rio
> e Nubank/iFood** (resultado imediato, cards com countdown, linha do tempo, bottom navigation). Onde este doc
> fala em *"absorção em menos de 2 segundos"*, é a tradução operacional desse princípio.
>
> Telas analisadas: **Home pública** (`/` → `HeroSection` + seções abaixo do fold), **Listagem de horários**
> (`/schedules` → `Schedules` + `ScheduleTabs`), **Card de horário** (`ScheduleCard`, `FavoriteCard`) e
> **Detalhes** (`ScheduleDialog`). Mobile e desktop.

---

## 1. Tokens de design atuais

Não existe `tailwind.config.ts` — o projeto usa **Tailwind v4** com tokens em CSS variables dentro de
`src/style.css` (`:root`, `.dark`, e exposição via `@theme inline`). ShadCN: style `new-york`, base `neutral`.

### 1.1 Cores — padronizadas (tokens semânticos)

Definidas em `src/style.css` e expostas como `--color-*`. Modo claro / escuro completos.

| Token | Light (oklch) | Uso |
|---|---|---|
| `--background` | `0.9751 0.0127 244.25` (azul-acinzentado claro) | fundo de página |
| `--foreground` | `0.3729 0.0306 259.73` | texto principal |
| `--card` / `--popover` | `1 0 0` (branco puro) | superfícies |
| `--primary` | `0.7227 0.192 149.58` (verde) | CTA, marca |
| `--secondary` | `0.9514 0.025 236.82` | superfícies secundárias |
| `--muted` / `--muted-foreground` | `0.967…` / `0.551…` | texto auxiliar |
| `--accent` | `0.9505 0.0507 163.05` | realces |
| `--destructive` | `0.6368 0.2078 25.33` (vermelho) | erro/destrutivo |
| `--border` / `--input` / `--ring` | border `0.9276…`, ring = primary | bordas, foco |
| `--chart-1..5`, `--sidebar-*` | escala verde / tokens de sidebar | gráficos, portal |

### 1.2 Cores — **hardcoded fora do padrão** (dívida)

Os componentes de domínio **não usam** os tokens semânticos para status; usam paleta Tailwind crua e até hex
literais. Isso fragmenta a linguagem de status e o dark mode.

| Local | Valor hardcoded | Deveria ser |
|---|---|---|
| `schedule-card.tsx` STATUS_CONFIG | `bg-emerald-500`, `bg-blue-500`, `bg-muted` | token de status compartilhado |
| `schedule-card.tsx` | `linear-gradient(135deg,#166534,#16a34a)` e `#4b5563/#6b7280` (hex inline) | gradiente tokenizado / fallback de cooperativa |
| `schedule-card.tsx` preço | `text-emerald-600 dark:text-emerald-400` | `text-primary` ou token de preço |
| `schedule-card.tsx` botão | `border-emerald-500 text-emerald-600 hover:bg-emerald-50` | `variant` próprio ou `text-primary` |
| `schedule-card.tsx` cancelado | `bg-red-500`, `text-white` | `Badge variant="destructive"` |
| `schedule-tabs.tsx` colorMap | `emerald-*/blue-*/gray-*` repetidos em active/icon/hover | mapa de status central |
| `favorite-card.tsx` STATUS_STRIPE | `bg-emerald-500/bg-blue-500/bg-muted-foreground/30` | mesmo mapa de status |
| `advance-filter.tsx` | `bg-yellow-100 text-yellow-800` (rating) | token de aviso |
| use-schedule-tabs `TAB_CONFIG` | classes `emerald/blue/muted` embutidas | idem |

**Conflito semântico importante:** o `design-refactor-plan.md` define a tríade de status como
**emerald (ativo) / amber (atraso) / slate (passado)**. O código real usa **emerald / blue / gray-muted** —
ou seja, "próximos" é **azul**, não amber, e "decorrido" é **gray/muted**, não slate. A semântica de cor de
status **ainda não está unificada nem alinhada ao guia**.

### 1.3 Tipografia

- Padronizado: `--font-sans: 'Fira Sans'`, `--font-mono: 'Fira Code'`, `--font-serif` (fallback). Carregadas
  no `index.html`.
- Horários usam `tabular-nums` (bom) mas **não** usam `font-mono` — o guia pede Fira Code para horários/códigos.
  Apenas `tripCode` usa `font-mono`. ➜ inconsistência leve.
- Escalas de título são **hardcoded por tela** (`text-3xl…text-6xl` no hero, `text-3xl md:text-4xl` na
  listagem, `text-3xl` nas seções). Não há tokens de escala tipográfica — cada tela redefine.

### 1.4 Espaçamentos

- Sem tokens próprios; usa a escala default do Tailwind. Paddings de card variam ad-hoc
  (`px-4 pt-3.5`, `py-3`, `pl-6`, `p-4`, `p-6`). Sem ritmo vertical padronizado entre cards.

### 1.5 Raios de borda

- Padronizado: `--radius: 0.625rem` → `--radius-sm/md/lg/xl` derivados em `@theme inline`.
- **Hardcoded fora do padrão:** cards usam `rounded-2xl`/`rounded-xl`/`rounded-4xl` literais em vez de
  `rounded-lg`/`rounded-xl` ligados ao token. `ScheduleCard` = `rounded-2xl`, `FavoriteCard` = `rounded-xl`,
  hero card = `rounded-4xl`. ➜ raios inconsistentes entre os dois cards de horário.

### 1.6 Sombras

- **Diretriz do projeto (CLAUDE.md / guia): Flat Design, sem `shadow-*` em cards; usar bordas coloridas.**
- **Violação atual generalizada:** `ScheduleCard` usa `shadow-sm` + `hover:shadow-lg`; `ScheduleSearch`
  `shadow-lg`; `HeroSection` form `shadow-xl` e card `shadow-2xl`; `PopularRouteCard` `shadow-sm hover:shadow-md`;
  `AdvanceFilter`/`ScheduleTabs` `shadow-sm`. O `FavoriteCard` é o **único** próximo do flat (usa
  `border-l` colorido via stripe + `hover:shadow-md` residual). ➜ a regra "sem sombra" está, na prática,
  **não cumprida** nas telas principais.

---

## 2. Inventário de componentes existentes

> Observação: vários nomes pedidos na tarefa **não existem como componentes nomeados**. Mapeei cada um ao
> equivalente real (ou marquei como inexistente).

### ScheduleCard — `src/components/schedule-card.tsx`
- **Props:** `{ schedule: Schedule }`.
- **Usado em:** `schedule-tab-content.tsx` (grid das tabs em `/schedules`).
- **Variantes (por estado interno, não por prop):** `upcoming-soon` (badge emerald "Disponível"),
  `upcoming` (badge azul "Em breve"), `past` (badge muted "Encerrado", `opacity-70` + grayscale),
  `badge==='cancelled'` (badge vermelho "Cancelado", preço riscado). Favoritar via `useFavorites` + toast.
- **Estrutura:** banner de imagem da cooperativa (h-32) + overlay nome/rating + coração; bloco de horários
  (departure/arrival grandes) com linha tracejada de duração; rodapé preço + botão "Ver Detalhes" (abre `ScheduleDialog`).
- **Dívida:** sombras, cores hardcoded, `rounded-2xl`, sem countdown (mostra rótulo estático).

### FavoriteCard — `src/pages/home/schedules/components/favorite-card.tsx`
- **Props:** `{ favorite: Favorite; onRemove?: (id: string) => void }`. Tipo `Favorite` declarado localmente
  (duplica campos de `Schedule`).
- **Usado em:** lista de favoritos da sidebar (`favorite-schedule.tsx`) e telas de favoritos.
- **Variantes:** mesmos 4 estados; layout **linear horizontal** (mais denso) com **stripe vertical colorida à
  esquerda** (`w-2`, `STATUS_STRIPE`) — é o componente mais próximo da diretriz flat/border-colorida.
- **É o protótipo informal do `CooperativeColorStripe`/status-stripe**, mas a stripe codifica **status**, não
  **cooperativa**.

### StatusBadge — **não existe como componente** ⚠️
- A lógica de badge está **inline e duplicada**: `STATUS_CONFIG` em `schedule-card.tsx`, `colorMap` +
  `TAB_CONFIG` em `schedule-tabs.tsx`/`use-schedule-tabs.ts`, `STATUS_STRIPE` em `favorite-card.tsx`.
- Existe um primitivo genérico `Badge` (`src/components/ui/badge.tsx`, CVA: default/secondary/destructive/
  outline/ghost/link) **mas não tem variantes de status de horário** e quase não é usado nos cards.

### SearchForm — equivalentes: `ScheduleSearch` + `HeroSection` (form) ⚠️ duplicado
- `ScheduleSearch` (`src/components/schedule-search.tsx`): origem/destino (`CityPicker`) + data + Buscar/Limpar;
  usa `useScheduleFilters` (URL-first), toasts e `setTimeout` de 1200ms simulando latência. Grid 4 colunas no desktop.
- `HeroSection` (`src/pages/home/homepage/hero-section.tsx`): **outro** formulário de busca, com `useForm`
  local próprio (não compartilha o hook), navega para `/schedules?...`. ➜ **dois formulários de busca
  divergentes** (campos, validação e estilo diferentes).

### FilterPanel — equivalente: `AdvanceFilter` — `src/components/advance-filter.tsx`
- **Props:** nenhuma (consome `useScheduleFilters`). Campos: cooperativa (`CooperativePicker`), dias da semana
  (`Toggle`), faixa de preço (min/max), avaliação mínima (`Slider`). Mostra contador de filtros ativos.
- **Usado em:** `schedules.tsx` dentro de um `Collapsible` na sidebar.
- **Dívida (vs guia):** no mobile fica **escondido** dentro de Collapsible na sidebar — o guia pede
  **bottom sheet/drawer** (`Sheet`) acessível. `shadow-sm`. Rating chip `bg-yellow-100` hardcoded.

### Tabs de categoria temporal — `ScheduleTabs` + `use-schedule-tabs.ts`
- `ScheduleTabs` (`src/pages/home/schedules/components/schedule-tabs.tsx`): 3 abas
  **Partindo Agora / Próximos / Decorridos**, cada uma faz seu próprio `useSchedules`. Aba default derivada do
  horário atual (`getCurrentActiveRange`), estado na URL (`?tab=`).
- `TAB_CONFIG` (`use-schedule-tabs.ts`): metadados (ícone Zap/Calendar/Clock, label, cor, classes).
- **Dívida (vs guia):** o plano de refator pede **unificar leaving-now + upcoming** numa lista única ordenada e
  rebaixar "Decorridos"; hoje são 3 abas de igual peso (`grid-cols-3`), o que o guia classifica como ruído para
  o leigo. Cores não batem com a tríade emerald/amber/slate.

### Primitivos shadcn em uso (suporte)
Button (CVA: 6 variantes × 8 tamanhos), Badge, Tabs (default/line), Dialog, Sheet, Collapsible, Slider, Toggle,
Input/InputGroup, Label, Select, Popover/Command (pickers), Skeleton, Avatar, Separator, Alert, Sonner (toast).

### Componentes ausentes pedidos na tarefa
`RouteCard` (público) → só existe `PopularRouteCard` (privado em `popular-routes-section.tsx`, não reutilizável).
`CountdownBadge`, `CooperativeColorStripe`, `RouteTimeline`, `RelativeTimeDisplay`, `OfflineIndicator` → **não
existem** (ver §5).

---

## 3. Hierarquia visual por tela

Legenda: **N1** = primeiro elemento que o olho captura, **N2** = segundo, **N3** = contexto/secundário.

### Home (`/`)
| Nível | Atual |
|---|---|
| N1 | Headline "Encontre horários… em **tempo real**" (text-6xl, black) |
| N2 | Formulário de busca (card com `shadow-xl`) |
| N3 | Ilustração de van (desktop), e abaixo do fold: PopularRoutes, HowItWorks, PartnerCoops, FinalCTA |

**Desalinhamento c/ guia:** para o leigo no celular o **objetivo é buscar** — mas N1 é texto de marketing e o
form é N2. O guia (`design-refactor-plan.md`, problema #1/#2) aponta que a home tem "muito conteúdo antes da
busca" e form com 3 campos. Para *absorção < 2s*, **o formulário deveria ser N1**. No mobile a ilustração some,
mas as 4 seções de marketing empurram o objetivo para baixo.

### Listagem (`/schedules`)
| Nível | Atual |
|---|---|
| N1 | `SchedulesHero`: breadcrumb + título "Horários Disponíveis" + `ScheduleSearch` (banner gradiente, ocupa topo inteiro) |
| N2 | As 3 abas temporais (`grid-cols-3`, igual peso) |
| N3 | Cards de horário; sidebar de filtros/favoritos (desktop) |

**Desalinhamento c/ guia:** o que o usuário quer (a **próxima van** / cards) está em **N3**, atrás de um hero
grande e de uma faixa de abas de peso igual. No mobile a sidebar de filtros/favoritos **desaparece** (vira
Collapsible no topo) — favoritos "enterrados". O dado crítico de cada card (**horário + countdown**) compete
com um **banner de imagem da cooperativa de h-32** que domina o card visualmente. ➜ para absorção < 2s, o
**horário/contagem deveria ser N1 do card**, não a foto.

### Detalhes (`ScheduleDialog`)
| Nível | Atual |
|---|---|
| N1 | Nome da cooperativa + rating + status badge |
| N2 | Horários (departure → arrival) + preço |
| N3 | `cities` (paradas, hoje texto simples), dias de operação, contato, descrição, avaliações |

**Desalinhamento c/ guia:** as **paradas** (`cities: ['Nova Russas','Sucesso','Crateús']`) são exibidas como
texto, não como **linha do tempo vertical** (referência Moovit). O countdown/tempo relativo não aparece. A
hierarquia privilegia a cooperativa sobre "quando sai / por onde passa".

---

## 4. Gaps vs diretrizes do guia

1. **Tempo relativo vs absoluto.** Hoje tudo é **absoluto** (`departureTime` "15:30", labels estáticos
   "Disponível"/"Em breve"). O guia/inspiração (Moovit) pede **tempo relativo/countdown** ("Em 8 min",
   "Partindo agora"). Não há cálculo de "faltam X min" em nenhum card — só agrupamento em abas. **Gap total.**
2. **Color-coding por cooperativa.** Inexistente. As cores codificam **status** (emerald/blue/muted). Cada
   cooperativa só se diferencia por **imagem/nome** no banner. Não há cor estável por cooperativa para
   reconhecimento rápido. **Gap.**
3. **Contraste em ambiente externo (sol).** Texto crítico fica **sobre imagem** com gradiente
   (`drop-shadow`) no `ScheduleCard` — contraste imprevisível sob luz forte. Muitos auxiliares em
   `text-[10px]`/`text-[9px]` e `text-muted-foreground` (baixo contraste). Para uso de rua, o horário deveria
   ser texto escuro de alto contraste sobre superfície sólida, não branco sobre foto. **Gap.**
4. **Indicador offline.** Não existe. App é mock/SPA; nenhum aviso de "sem conexão / dados podem estar
   desatualizados", embora o público use 3G/4G instável na estrada. **Gap.**
5. **Microinterações de expansão de card.** Cards abrem um **Dialog** (modal cheio) em vez de **expandir
   in-place**. Há apenas `hover:shadow`/`hover:scale` no coração. Sem expand/accordion animado mostrando
   paradas. As animações existem (`fadeIn`, `slideIn`, `collapsible-*` em `style.css`) mas não são usadas para
   expansão de card. **Gap parcial.**

Gaps estruturais adicionais já citados: **sombras** violando o flat design (§1.6); **dois formulários de busca**
divergentes (§2); **lógica de status duplicada** em 4 lugares (§2); **filtros/favoritos escondidos no mobile** (§3).

---

## 5. Componentes faltantes — proposta de assinatura

> Objetivo: centralizar a linguagem de status, introduzir tempo relativo e color-coding, e suportar as
> microinterações pedidas. Todos seguem o padrão do projeto (shadcn + CVA, `cn()`, Lucide, tokens semânticos).

```ts
// src/components/countdown-badge.tsx
// Substitui os labels estáticos. Calcula tempo relativo ao vivo e escolhe a cor de status.
export type DepartureState = 'boarding' | 'soon' | 'scheduled' | 'departed' | 'cancelled'

export interface CountdownBadgeProps {
  /** ISO 8601 ou Date do horário de partida */
  departure: string | Date
  /** janela (min) abaixo da qual vira "soon"/"boarding". default: 60 */
  soonThresholdMinutes?: number
  /** força um estado (ex.: cancelado) ignorando o cálculo de tempo */
  stateOverride?: DepartureState
  /** "Em 8 min" | "Partindo agora" | "08:00" — controla o texto */
  format?: 'relative' | 'absolute' | 'auto' // default 'auto'
  /** intervalo de re-render do contador em ms. default 30000 */
  tickMs?: number
  className?: string
}
```

```ts
// src/components/cooperative-color-stripe.tsx
// Faixa/realce de cor ESTÁVEL por cooperativa (reconhecimento rápido), separada do status.
export interface CooperativeColorStripeProps {
  cooperativeId: string
  /** se ausente, deriva uma cor determinística a partir do id (hash → paleta de marca) */
  color?: string
  orientation?: 'vertical' | 'horizontal' // default 'vertical'
  /** espessura em px (vertical) ou altura (horizontal). default 8 */
  thickness?: number
  /** rótulo curto opcional (sigla) sobreposto */
  abbr?: string
  className?: string
}
```

```ts
// src/components/route-timeline.tsx
// Linha do tempo vertical de paradas (estilo Moovit) para os Detalhes.
export interface RouteStop {
  id: string
  name: string
  /** horário previsto na parada (ISO/HH:mm), opcional */
  time?: string
  kind?: 'origin' | 'stop' | 'destination'
}

export interface RouteTimelineProps {
  stops: RouteStop[]
  /** índice da parada "atual"/atingida, para destacar progresso */
  currentIndex?: number
  /** cor da linha — tipicamente a CooperativeColorStripe */
  accentColor?: string
  dense?: boolean // default false
  className?: string
}
```

```ts
// src/components/relative-time-display.tsx
// Texto de tempo relativo reutilizável (pt-BR), auto-atualizável. Base do CountdownBadge.
export interface RelativeTimeDisplayProps {
  value: string | Date
  /** 'until' = "em 8 min" (futuro) | 'since' = "há 8 min" (passado) | 'auto' */
  direction?: 'until' | 'since' | 'auto' // default 'auto'
  /** acima deste limite (min) cai para horário absoluto. default 720 (12h) */
  absoluteAfterMinutes?: number
  tickMs?: number // default 30000
  className?: string
}
```

```ts
// src/components/offline-indicator.tsx
// Banner/badge global de status de conexão + frescor dos dados.
export interface OfflineIndicatorProps {
  /** timestamp da última sincronização bem-sucedida */
  lastSyncedAt?: string | Date
  /** força estado offline (testes); default = navigator.onLine */
  isOffline?: boolean
  /** 'banner' fixo no topo | 'inline' dentro de uma lista. default 'banner' */
  variant?: 'banner' | 'inline'
  onRetry?: () => void
  className?: string
}
```

> Pré-requisito transversal: extrair um **`scheduleStatus` central** (mapa único de estado → cor/label/ícone)
> em `src/lib/` e alinhar à tríade do guia (**emerald / amber / slate**), consumido por `CountdownBadge`,
> `ScheduleCard`, `FavoriteCard` e `ScheduleTabs` para acabar com a duplicação da §2.

---

## 6. Plano de refator priorizado (3 fases)

### Fase A — Máximo impacto visual, mínimo risco de quebra
*(só toca em classes/estilo e centralização de tokens; nenhuma mudança de API ou de fluxo de dados)*
1. **Tokenizar status:** criar o mapa único de status (estado → cor/label/ícone) e fazer
   `STATUS_CONFIG`/`colorMap`/`STATUS_STRIPE`/`TAB_CONFIG` apontarem para ele. Alinhar à tríade
   emerald/amber/slate do guia.
2. **Aplicar flat design:** remover `shadow-*` dos cards/painéis (`ScheduleCard`, `ScheduleSearch`,
   `AdvanceFilter`, `ScheduleTabs`, `PopularRouteCard`, hero) e substituir por **borda colorida** de status
   (padrão da stripe do `FavoriteCard`).
3. **Padronizar raios:** unificar cards em `rounded-xl` ligado ao token (`--radius`); remover `rounded-2xl/4xl`.
4. **Hierarquia do card:** rebaixar o banner de imagem h-32 e **promover horário + status** a N1 (texto sólido
   de alto contraste, `font-mono` nos horários) — endereça contraste externo e absorção < 2s.
5. **Substituir hex inline** (`#166534`…) por gradiente/token e remover paleta crua (`bg-red-500`,
   `bg-yellow-100`) por `Badge variant` / tokens.

### Fase B — Componentes novos a criar
*(introduz comportamento novo; ver assinaturas na §5)*
1. **`RelativeTimeDisplay`** (base) → **`CountdownBadge`** (consome o status central): tempo relativo ao vivo
   nos cards. Maior salto de alinhamento ao guia.
2. **`CooperativeColorStripe`:** color-coding estável por cooperativa, separado do status.
3. **`OfflineIndicator`:** banner global no layout (`_layouts/home.tsx`) + frescor de dados.
4. **`RouteTimeline`:** linha do tempo vertical de paradas no `ScheduleDialog` (a partir de `cities`).
5. **`StatusBadge` formal** e **`RouteCard` público reutilizável** (extrair de `PopularRouteCard`).
6. **Unificar busca:** `HeroSection` passa a usar o mesmo `ScheduleSearch`/`useScheduleFilters`.

### Fase C — Polish / ajustes finos
1. **Microinteração de expansão in-place** do card (accordion animado com `collapsible-*` já existente)
   como alternativa/antecâmara do Dialog, revelando `RouteTimeline`.
2. **Reorganizar abas:** unificar *leaving-now + upcoming* numa lista ordenada e rebaixar *Decorridos*
   (peso visual menor), conforme guia.
3. **Filtros/favoritos no mobile:** mover `AdvanceFilter` para `Sheet` (bottom sheet) e favoritos para acesso
   direto (bottom navigation), conforme `design-refactor-plan.md`.
4. **Tipografia/escala:** definir tokens de escala de título e aplicar `tabular-nums` + `font-mono`
   consistentemente em todos os horários.
5. **Acessibilidade/contraste:** auditar `text-[9px]/[10px]` e usos de `text-muted-foreground` em dado
   crítico; garantir AA sob luz forte.
```
