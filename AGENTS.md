# AGENTS.md - VanHora React Project Guide

## 📋 Visão Geral do Projeto

**VanHora** é uma plataforma React para consulta de horários de topiques (vans de transporte intermunicipal) com foco no público do Nordeste brasileiro.

### 🎯 Estado Atual

**COMPLETO**: Landing page moderna e atrativa implementada com todas as 8 seções funcionais. Sistema de consulta de horários com área pública (home) e área autenticada (app). Sistema de favoritos refatorado com arquitetura URL-first para filtros. Design mobile-first com acessibilidade verificada e build otimizado para produção.

---

## 🏗️ Arquitetura e Estrutura

### Stack Tecnológico

```
Frontend: React 19 + TypeScript + Vite
CSS: Tailwind CSS v4 + ShadCN/UI
Estado: TanStack React Query
Navegação: React Router Dom v7
Icons: Lucide React + React Icons
Forms: React Hook Form + Zod
HTTP: Axios
```

## 🗄️ Arquitetura do Banco de Dados

### Entidades Principais

#### 🏙️ **Cities** (Cidades)

Representa as cidades contempladas pelo sistema.

| Campo        | Tipo       | Descrição           |
| ------------ | ---------- | ------------------- |
| `id`         | UUID       | Identificador único |
| `name`       | VARCHAR    | Nome da cidade      |
| `state`      | VARCHAR(2) | Estado (CE)         |
| `deleted_at` | TIMESTAMP  | Soft delete         |

**Relacionamentos:**

- 1:N com `routes` (origem)
- 1:N com `routes` (destino)
- 1:N com `routes_stop` (paradas)

---

#### 🚐 **Cooperatives** (Cooperativas)

Cooperativas de transporte que operam as rotas.

| Campo          | Tipo      | Descrição           |
| -------------- | --------- | ------------------- |
| `id`           | UUID      | Identificador único |
| `name`         | VARCHAR   | Nome da cooperativa |
| `phone_number` | VARCHAR   | Telefone de contato |
| `logo_url`     | VARCHAR   | Logo da cooperativa |
| `site`         | VARCHAR   | Website             |
| `deleted_at`   | TIMESTAMP | Soft delete         |

**Relacionamentos:**

- 1:N com `routes`
- 1:N com `users` (funcionários)

---

#### 🛣️ **Routes** (Rotas)

Rotas operadas pelas cooperativas.

| Campo            | Tipo      | Descrição                         |
| ---------------- | --------- | --------------------------------- |
| `id`             | UUID      | Identificador único               |
| `name`           | VARCHAR   | Nome descritivo da rota           |
| `cooperative_id` | UUID FK   | Cooperativa responsável           |
| `active_days`    | VARCHAR[] | Dias de operação                  |
| `drive_id`       | UUID FK   | Motorista padrão                  |
| `status`         | ENUM      | `active`, `inactive`, `suspended` |
| `price`          | DECIMAL   | Preço da passagem                 |
| `deleted_at`     | TIMESTAMP | Soft delete                       |

**Relacionamentos:**

- N:1 com `cooperatives`
- 1:N com `schedules`
- 1:N com `routes_stop` (paradas)
- 1:N com `ratings`
- 1:N com `favorites`
- 1:N com `delays`

---

#### 🕐 **Schedules** (Horários)

Horários de partida das rotas.

| Campo            | Tipo      | Descrição                                |
| ---------------- | --------- | ---------------------------------------- |
| `id`             | UUID      | Identificador único                      |
| `route_id`       | UUID FK   | Rota associada                           |
| `departure_time` | TIME      | Horário de partida (HH:mm)               |
| `day_of_week`    | VARCHAR   | Dia da semana (`monday`, `tuesday`, ...) |
| `status`         | ENUM      | `active`, `cancelled`, `suspended`       |
| `notes`          | TEXT      | Observações                              |
| `deleted_at`     | TIMESTAMP | Soft delete                              |

**Relacionamentos:**

- N:1 com `routes`
- 1:N com `schedules_exceptions`
- 1:N com `delays`

**Índices:**

```sql
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_day ON schedules(day_of_week);
CREATE INDEX idx_schedules_time ON schedules(departure_time);
```

---

#### 🚫 **Schedules_Exceptions** (Exceções de Horários)

Cancelamentos ou alterações pontuais em datas específicas (feriados, manutenção, etc).

| Campo            | Tipo      | Descrição                                |
| ---------------- | --------- | ---------------------------------------- |
| `id`             | UUID      | Identificador único                      |
| `schedule_id`    | UUID FK   | Horário afetado                          |
| `exception_date` | DATE      | Data da exceção                          |
| `type`           | ENUM      | `cancelled`, `suspended`, `special_time` |
| `reason`         | VARCHAR   | Motivo da exceção                        |
| `created_at`     | TIMESTAMP | Data de criação                          |

**Relacionamentos:**

- N:1 com `schedules`

**Exemplos de uso:**

```sql
-- Natal: horário cancelado
INSERT INTO schedules_exceptions
  (schedule_id, exception_date, type, reason)
VALUES
  ('uuid', '2024-12-25', 'cancelled', 'Feriado - Natal');

-- Ano Novo: horário especial
INSERT INTO schedules_exceptions
  (schedule_id, exception_date, type, reason)
VALUES
  ('uuid', '2025-01-01', 'special_time', 'Horário reduzido - Ano Novo');
```

---

#### 📍 **Routes_Stop** (Paradas de Rotas)

Paradas intermediárias das rotas.

| Campo                | Tipo     | Descrição                         |
| -------------------- | -------- | --------------------------------- |
| `id`                 | UUID     | Identificador único               |
| `route_id`           | UUID FK  | Rota                              |
| `city_id`            | UUID FK  | Cidade da parada                  |
| `position`           | INTEGER  | Ordem da parada                   |
| `departure_time`     | TIME     | Horário de partida desta parada   |
| `estimated_duration` | INTERVAL | Tempo estimado até próxima parada |

**Relacionamentos:**

- N:1 com `routes`
- N:1 com `cities`

**Descrição:**  
Permite definir rotas com múltiplas paradas. Exemplo: Fortaleza → Sobral → Ipueiras.

---

#### ⭐ **Ratings** (Avaliações)

Avaliações de rotas feitas pelos usuários.

| Campo         | Tipo      | Descrição                         |
| ------------- | --------- | --------------------------------- |
| `id`          | UUID      | Identificador único               |
| `schedule_id` | UUID FK   | Horário avaliado                  |
| `stars`       | INTEGER   | Avaliação (1-5)                   |
| `date_ata`    | TIMESTAMP | Data da avaliação                 |
| `session_id`  | UUID      | Identificação do usuário (cookie) |

**Relacionamentos:**

- N:1 com `schedules`

**Lógica:**

- Usuários **sem conta** podem avaliar (identificados por `session_id` + IP)
- 1 avaliação por rota por sessão
- Pode atualizar avaliação existente

---

#### 👥 **Users** (Usuários)

Usuários com permissões administrativas (cooperativas, motoristas, admins).

| Campo            | Tipo      | Descrição                        |
| ---------------- | --------- | -------------------------------- |
| `id`             | UUID      | Identificador único              |
| `name`           | VARCHAR   | Nome completo                    |
| `email`          | VARCHAR   | Email (único)                    |
| `password_hash`  | VARCHAR   | Senha hasheada                   |
| `cooperative_id` | UUID FK   | Cooperativa (se aplicável)       |
| `role`           | ENUM      | `admin`, `cooperative`, `driver` |
| `deleted_at`     | TIMESTAMP | Soft delete                      |

**Relacionamentos:**

- N:1 com `cooperatives`
- 1:N com `delays` (reportados por)

**Roles:**

- `admin`: Acesso total à plataforma
- `cooperative`: Gerencia horários e rotas da própria cooperativa
- `driver`: Reporta atrasos e ocorrências de suas rotas, ver os horários e rotas da própria cooperativa ao qual faz parte

---

#### ⏰ **Delays** (Atrasos)

Atrasos reportados em tempo real.

| Campo           | Tipo      | Descrição               |
| --------------- | --------- | ----------------------- |
| `id`            | UUID      | Identificador único     |
| `schedule_id`   | UUID FK   | Horário afetado         |
| `route_id`      | UUID FK   | Rota afetada            |
| `delay_minutes` | INTEGER   | Minutos de atraso       |
| `reason`        | TEXT      | Motivo do atraso        |
| `reported_by`   | UUID FK   | Usuário que reportou    |
| `date`          | TIMESTAMP | Data/hora do atraso     |
| `severity`      | ENUM      | `low`, `medium`, `high` |
| `created_at`    | TIMESTAMP | Data de criação         |

**Relacionamentos:**

- N:1 com `schedules`
- N:1 com `routes`
- N:1 com `users` (reporter)

**Severidade:**

- `low`: < 15 minutos
- `medium`: 15-30 minutos
- `high`: > 30 minutos

---

## ✨ Funcionalidades

### 🌐 Públicas (Sem Login)

- Consultar horários por origem/destino/data
- Filtrar por cooperativa, faixa de preço, avaliação
- Ver detalhes de horários (paradas, duração, preço)
- Avaliar rotas (1-5 estrelas)
- Favoritar horários (localStorage)
- Ver cancelamentos e exceções
- Receber notificações de atrasos (em desenvolvimento)

### 🔐 Administrativas

#### Cooperativas

- Gerenciar rotas e horários
- Adicionar/editar paradas
- Cadastrar exceções (feriados, manutenção)
- Visualizar avaliações
- Dashboard de estatísticas

#### Motoristas

- Reportar atrasos em tempo real
- Ver rota do dia
- Histórico de viagens

#### Admins

- Gerenciar cooperativas
- Moderar avaliações
- Visualizar analytics
- Logs do sistema

---

## 🧭 Roles e Navegação Admin (Oficial)

> Identificadores técnicos de role: `admin`, `cooperative`, `driver`.
> Na UI, os nomes devem permanecer em português.

### ADMIN (Acesso total)

**Menu Principal**

- Dashboard (estatísticas gerais)
- Cidades (CRUD cidades)
- Cooperativas (CRUD cooperativas)
- Usuários (CRUD todos usuários)

**Dados de Transporte**

- Rotas (CRUD todas rotas)
- Horários (CRUD todos horários)
- Atrasos (visualizar todos)

### COOPERATIVE (Cooperativa)

**Menu Principal**

- Dashboard (estatísticas da cooperativa)
- Minha Cooperativa (editar dados próprios)
- Usuários (gerenciar motoristas/funcionários)

**Dados de Transporte**

- Rotas (CRUD rotas próprias)
- Horários (CRUD horários próprios)
- Atrasos (visualizar atrasos próprios)

### DRIVER (Motorista)

**Menu Principal**

- Dashboard (agenda do dia)
- Meu Perfil (editar dados pessoais)

**Dados de Transporte**

- Minhas Rotas (visualizar rotas atribuídas)
- Meus Horários (visualizar horários do dia)
- Reportar Atraso (criar/editar atrasos)

### Dashboards Personalizados

**Admin Dashboard**

- Total de cooperativas ativas
- Total de rotas cadastradas
- Total de horários hoje
- Atrasos reportados (últimas 24h)
- Avaliações médias (todas cooperativas)
- Gráfico: Horários por dia da semana
- Gráfico: Cooperativas mais avaliadas
- Últimos atrasos reportados

**Cooperative Dashboard**

- Total de rotas ativas
- Total de horários cadastrados
- Avaliação média (suas rotas)
- Total de avaliações recebidas
- Gráfico: Horários por dia da semana
- Gráfico: Avaliações (distribuição 1-5 estrelas)
- Próximos horários (hoje)
- Atrasos reportados (últimos 7 dias)
- Motoristas ativos

**Driver Dashboard**

- Horários de hoje (lista cronológica)
- Rota atual (se estiver em viagem)
- Próximo horário
- Histórico de atrasos (últimos 30 dias)
- Botão rápido: Reportar Atraso

---

## 🔍 Padrão URL-First para Filtros

Todos os filtros são sincronizados com a URL para:

- Compartilhamento de buscas
- Histórico do navegador
- Deep linking

---

## 📊 Dados e Schemas

### Dados Mock (Desenvolvimento)

lib/data/mock-cities.ts # Dados de cidades
lib/data/mock-cooperatives.ts # Dados de cooperativas
lib/data/mock-schedules.ts # Dados de horários
lib/data/mock-ratings.ts # Dados de avaliações

### Schemas de Validação

lib/schemas/schedule-filters.ts # Validação e conversão de filtros

### Tipos TypeScript

lib/types/schedule.ts # Tipos principais do projeto

**Principais tipos:**

- `Schedule`: Horário individual com dados de cooperativa
- `ScheduleFilters`: Objeto de filtros com validação Zod
- `ScheduleStatus`: 'upcoming-soon' | 'upcoming' | 'past'
- `ScheduleBadge`: 'available' | 'cancelled'
- `Rating`: Avaliação (1-5 estrelas)
- `RatingStats`: Estatísticas de avaliações

---

### Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes ShadCN/UI
│   ├── theme/          # Componentes de tema
│   ├── header-home.tsx # Header específico
│   ├── schedule-*.tsx  # Componentes de horários
│   └── ...
├── hooks/              # Custom hooks
│   ├── use-schedule-filters.ts  # Filtros URL-first
│   ├── use-schedules.ts         # Query de horários
│   └── use-favorites.ts         # Gerenciamento favoritos
├── pages/              # Páginas da aplicação
│   ├── _layouts/       # Layouts (home, app, auth)
│   ├── home/           # Páginas públicas
│   │   └── schedules/favorites/  # Sistema de favoritos
│   ├── app/            # Área autenticada
│   ├── auth/           # Autenticação
│   └── 404.tsx
├── lib/                # Utilitários e configurações
│   ├── api/            # Mock APIs e futuras integrações
│   └── data/           # Dados mock (cidades, rotas)
│   ├── queries/        # React Query hooks
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilitários
│   └── ...
├── assets/             # Imagens e arquivos estáticos
├── style.css           # Estilos globais + variáveis CSS
└── routes.tsx          # Configuração de rotas
```

---

## 🎨 Sistema de Design

### Configuração ShadCN/UI

- **Estilo**: "new-york"
- **Base Color**: neutral
- **CSS Variables**: habilitadas
- **Icon Library**: lucide
- **Aliases configurados**: @/components, @/lib, @/ui, @/hooks

### Sistema de Cores (CSS Variables)

#### Cores Principais Atuais

```css
/* Tema Claro */
--primary: oklch(0.7227 0.192 149.5793) /* Verde */
  --secondary: oklch(0.9514 0.025 236.8242) /* Azul claro */
  --background: oklch(0.9751 0.0127 244.2507) /* Branco */
  --foreground: oklch(0.3729 0.0306 259.7328) /* Preto suave */
  --muted-foreground: oklch(0.551 0.0234 264.3637) /* Cinza texto */
  --accent: oklch(0.9505 0.0507 163.0508) /* Accent verde claro */
  --destructive: oklch(0.6368 0.2078 25.3313) /* Vermelho erros */;
```

#### Variáveis Disponíveis

- **Card/Popover**: Fundos brancos para modais e cards
- **Border/Input**: Bordas cinzas claras consistentes
- **Ring**: Focus states em verde primário
- **Chart**: 5 variações de verde para gráficos
- **Sidebar**: Variáveis específicas para navegação lateral

### Tipografia

```css
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif; /* Atual */
```

---

## 📁 Organização de Componentes

### Componentes ShadCN/UI Disponíveis

```
✅ Badge, Button, Card, Checkbox
✅ Collapsible, Dialog, Input, InputGroup, Label
✅ NavigationMenu, Separator, Sheet
✅ Skeleton, Textarea, Toggle
✅ Alert, Command, Popover
✅ Slider, Sonner, Tabs
```

### Componentes Específicos Existentes

```
# Componentes Core de Busca
city-picker.tsx         # Seletor de cidades (padrão reusável)
cooperative-picker.tsx  # Seletor de cooperativas (novo - baseado em city-picker)
schedule-search.tsx     # Hero de busca com filtros básicos
advance-filter.tsx      # Filtros avançados (colapsível)
schedule-card.tsx       # Card de horário individual
schedule-card-skeleton.tsx  # Skeleton do card (loading)
schedule-dialog.tsx     # Modal de detalhes do horário
schedule-dialog-skeleton.tsx # Skeleton do modal (loading)
empty-state.tsx         # Componente genérico de estado vazio

# Componentes de Rating/Avaliação
rating-stars.tsx        # Exibição de estrelas
rating-display.tsx      # Card de avaliação
rating-section.tsx      # Seção completa de avaliações

# Componentes de UI
header-home.tsx         # Header da área pública
theme-provider.tsx      # Provider de tema (dark/light)
theme-toggle.tsx        # Botão de toggle de tema
```

### Padrão de Criação de Componentes

1. **Componentes UI**: sempre em `components/ui/`
2. **Componentes Específicos**: em `components/`
3. **Componentes de Página**: dentro da pasta da página
4. **Layouts**: em `pages/_layouts/`

---

## 🛠️ Padrões de Desenvolvimento

### Estrutura de Páginas

```typescript
// Exemplo: src/pages/home/homepage/homepage.tsx
export function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />
      <SectionContent />
    </div>
  )
}
```

### Roteamento

```typescript
// src/routes.tsx - Estrutura atual
{
  path: '/',
  element: <Home />,        // Layout wrapper
  children: [
    { index: true, element: <HomePage /> },
    { path: 'about', element: <About /> },
    // ...
  ]
}
```

### Utilitários CSS

```typescript
// src/lib/utils.ts - clsx + tailwind-merge
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Animações Disponíveis

```css
/* style.css - Animações customizadas */
.animate-fade-in     /* fadeIn 0.8s */
.animate-slide-in    /* slideIn 1s */
.animate-collapsible-down / -up
```

---

### Estados e Dados

```typescript
// Mock data sempre em constantes
const MOCK_ROUTES = [...]

// Usar React Query para futuras APIs
const { data, isLoading } = useQuery({
  queryKey: ['schedules'],
  queryFn: fetchSchedules
})
```

### Arquitetura de Filtros (URL-first)

```
Formulário (RHF) → URL (searchParams) → filtersFromUrl (useMemo) → useSchedules → API
```

- **React Hook Form**: UX de edição, validação com Zod
- **URL (searchParams)**: Persistir estado, compartilhar links, back/forward
- **filtersFromUrl**: Derivar filtros da URL (reativo via useMemo)
- **useSchedules**: Enviar filtros para API via React Query

```typescript
// use-schedule-filters.ts - URL como fonte de verdade
const filtersFromUrl = useMemo(
  () => ({
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
  }),
  [searchParams],
)

// Componentes usam filtersFromUrl para queries (não watch())
const { schedules } = useSchedules(filtersFromUrl)
```

---

## 🚨 Pontos de Atenção

### 1. Compatibilidade

- ✅ **Manter**: componentes ShadCN/UI existentes funcionando
- ✅ **Reutilizar**: `schedule-card.tsx` como referência para novos cards
- ✅ **Preservar**: sistema de roteamento atual

### 2. Responsividade

- 📱 **Mobile First**: design responsivo obrigatório
- 🎯 **Breakpoints**: seguir sistema Tailwind
- ⚡ **Performance**: lazy loading de imagens

### 3. Acessibilidade

- 🎨 **Contraste**: manter ratios adequados
- ⌨️ **Navegação**: keyboard navigation
- 📖 **Semântica**: HTML semântico correto

### 4. SEO (futuro)

- 📄 **Meta tags**: preparar estrutura
- 🖼️ **Images**: alt texts descritivos
- 📊 **Structured data**: JSON-LD para horários

---

> **Última atualização**: $(date)
> **Status**: Landing page completa e pronta para uso. Todos os testes de responsividade, acessibilidade e qualidade foram realizados com sucesso.
