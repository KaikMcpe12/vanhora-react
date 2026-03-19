# AGENTS.md - VanHora React Project Guide

## 📋 Visão Geral do Projeto

**VanHora** é uma plataforma React para consulta de horários de topiques (vans de transporte intermunicipal) com foco no público do Nordeste brasileiro.

### 🎯 Estado Atual

**COMPLETO**: Landing page moderna e atrativa implementada com todas as 8 seções funcionais. Sistema de consulta de horários com área pública (home) e área autenticada (app). Design mobile-first com acessibilidade verificada e build otimizado para produção.

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

### Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes ShadCN/UI
│   ├── theme/          # Componentes de tema
│   ├── header-home.tsx # Header específico
│   ├── schedule-*.tsx  # Componentes de horários
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── _layouts/       # Layouts (home, app, auth)
│   ├── home/           # Páginas públicas
│   ├── app/            # Área autenticada
│   ├── auth/           # Autenticação
│   └── 404.tsx
├── lib/                # Utilitários e configurações
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
```

### Componentes Específicos Existentes

```
header-home.tsx         # Header atual (pode ser base)
schedule-card.tsx       # Card de horários (referência)
schedule-dialog.tsx     # Modal de detalhes
schedule-filter.tsx     # Filtros de busca
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

## 📝 Convenções e Boas Práticas

### Nomenclatura

- **Componentes**: PascalCase (`HeroSection`)
- **Arquivos**: kebab-case (`hero-section.tsx`)
- **CSS Classes**: Tailwind + custom com prefixo
- **Variáveis**: camelCase (`isLoading`)

### Props e TypeScript

```typescript
interface ComponentProps {
  className?: string      # Sempre opcional
  children?: ReactNode   # Quando aplicável
  // ... outras props específicas
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("default-classes", className)} {...props}>
      {/* conteúdo */}
    </div>
  )
}
```

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

---

## 🔧 Comandos de Desenvolvimento

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run format       # Prettier
npm run lint         # ESLint
npm run preview      # Preview do build
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

## 📚 Recursos e Referências

- [ShadCN/UI Docs](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Router v7](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

---

> **Última atualização**: $(date)
> **Status**: Landing page completa e pronta para uso. Todos os testes de responsividade, acessibilidade e qualidade foram realizados com sucesso.
