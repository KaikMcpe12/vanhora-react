# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite)
npm run build      # tsc -b && vite build
npm run lint       # eslint --fix + prettier --fix
npm run format     # prettier --write src/**
npx tsc --noEmit   # type-check without emitting
```

There are no tests in this project.

## Architecture

**vanhora-react** is a multi-role SaaS portal for intercity van transportation cooperatives (Brazil/Ceará). It is a pure frontend — no backend exists yet; data comes from mock files in `src/lib/data/`.

### Routing structure

`src/routes.tsx` defines three distinct portal prefixes, each sharing the same layout (`AppPortalLayout`) but with a different role injected via outlet context:

| Prefix | Role | Layout |
|--------|------|--------|
| `/admin/*` | `admin` | `AppPortalLayout` |
| `/cooperative/*` | `cooperative` | `AppPortalLayout` |
| `/driver/*` | `driver` | `AppPortalLayout` |
| `/` | — | `HomeLayout` |
| `/sign-in` | — | `AuthLayout` |

### Role system (`src/pages/app-portal/app-portal-navigation.ts`)

All portal logic is driven by `AppPortalRole = 'admin' | 'cooperative' | 'driver'`. Navigation items declare which roles can see them via a `roles` array. Helper functions (`getAppPortalNavigationItems`, `canAccessAppPortalPath`, `getAppPortalPageLabel`) filter items by role at runtime.

The outlet context shape passed by `AppPortalLayout` to every nested page:
```ts
{ role: AppPortalRole; user: AppPortalUser; basePath: string }
```
Pages access it with `useOutletContext<AppPortalOutletContext>()`.

### Shared pages

Pages reused across roles live in `src/pages/app-portal/<feature>/`. Role-specific entry points (`admin/routes.tsx`, `cooperative/routes.tsx`) are thin wrappers that just re-export the shared page component. This is the established pattern for any page that multiple roles share.

### Component library

UI primitives live in `src/components/ui/` and follow the **shadcn/ui** pattern — each file exports a single component built with CVA (`class-variance-authority`) + Radix UI primitives. Add new components with `npx shadcn add <component>`.

- `cn()` from `src/lib/utils.ts` is the only utility for merging Tailwind classes.
- Icons: **Lucide React** only (no `react-icons` in new code).
- Tailwind v4 is configured via `@tailwindcss/vite` plugin — no `tailwind.config.ts` file. Theme tokens live in `src/style.css` under `@theme inline`.

### Data fetching

TanStack Query (`src/lib/react-query.ts`) is configured with 5 min stale time and `refetchOnWindowFocus: false`. API calls use axios pointed at `env.VITE_API_URL`. Env vars are validated at startup via Zod in `src/env.ts`.

All current data is mocked: `src/lib/data/mock-*.ts` and `src/lib/api/mock-schedules-api.ts`.

### Forms

React Hook Form + Zod schemas from `src/lib/schemas/`. Resolvers via `@hookform/resolvers/zod`.

### Design conventions

- **Flat Design** — no `shadow-*` on cards; use colored borders (`border-l-4`, `border-t-[3px]`) for status emphasis.
- **Font**: Fira Sans (body) + Fira Code (mono), loaded via Google Fonts in `index.html`.
- Status semantic colors: active → emerald, suspended → amber, inactive → slate.
- Button sizes on cards: `size="sm"` with `rounded-full` (not `size="xs"` with `h-8` override).
- The Pencil design file lives at `/home/kaik/Documentos/pencil/vanhora.pen` — design in Pencil first, then reflect in code.
