# AGENTS.md - VanHora Quick Guide

## Objetivo

VanHora e uma plataforma React para consulta de horarios de transporte intermunicipal.

## Stack Principal

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + ShadCN/UI
- React Router v7
- TanStack React Query
- React Hook Form + Zod

## Rotas de Alto Nivel

- Publico: `/`
- Autenticacao: `/sign-in`
- Area app geral: `/app`
- Area portal por role:
  - `/admin`
  - `/cooperative`
  - `/driver`

## Regras de Organizacao

- `src/components/ui/`: apenas componentes globais de UI.
- `src/components/`: componentes globais reutilizaveis entre dominios.
- `src/pages/<dominio>/`: componentes e configuracoes locais de dominio.
- Layouts compartilhados continuam em `src/pages/_layouts/`.

Para App Portal:

- arquivos locais ficam em `src/pages/app-portal/`
- subdividir por role em:
  - `src/pages/app-portal/admin/`
  - `src/pages/app-portal/cooperative/`
  - `src/pages/app-portal/driver/`

## Referencias Detalhadas

- Banco de dados: `docs/database.md`
- Roles e navegacao: `docs/roles-navigation.md`
- Design system: `docs/design-system.md`
- Padroes de desenvolvimento: `docs/development-patterns.md`
