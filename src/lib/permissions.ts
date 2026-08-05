/**
 * Matriz de permissões por papel (role-based access control).
 *
 * Cada recurso declara quais papéis podem executar cada ação.
 * Use `can()` para checar em runtime, e `<Can>` para condicionar JSX.
 *
 * @example
 *   can('cooperative', 'routes', 'create') // → true
 *   can('driver', 'routes', 'delete')       // → false
 */

import type { AppPortalRole } from '@/pages/app-portal/app-portal-navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResourceKey =
  | 'dashboard'
  | 'routes'
  | 'schedules'
  | 'cities'
  | 'cooperatives'
  | 'users'
  | 'delays'
  | 'driver-profile'
  | 'driver-routes'
  | 'driver-schedules'
  | 'delay-report'

export type ActionKey = 'view' | 'create' | 'edit' | 'delete' | 'export'

type PermissionMatrix = Partial<
  Record<ResourceKey, Partial<Record<ActionKey, AppPortalRole[]>>>
>

// ─── Matrix ───────────────────────────────────────────────────────────────────

export const PERMISSIONS: PermissionMatrix = {
  dashboard: {
    view: ['admin', 'cooperative', 'driver'],
  },

  routes: {
    view: ['admin', 'cooperative', 'driver'],
    create: ['admin', 'cooperative'],
    edit: ['admin', 'cooperative'],
    delete: ['admin'],
    export: ['admin'],
  },

  schedules: {
    view: ['admin', 'cooperative', 'driver'],
    create: ['admin', 'cooperative'],
    edit: ['admin', 'cooperative'],
    delete: ['admin'],
    export: ['admin'],
  },

  cities: {
    view: ['admin'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin'],
  },

  cooperatives: {
    view: ['admin'],
    create: ['admin'],
    edit: ['admin'],
    delete: ['admin'],
  },

  users: {
    view: ['admin', 'cooperative'],
    create: ['admin', 'cooperative'],
    edit: ['admin', 'cooperative'],
    delete: ['admin'],
  },

  delays: {
    view: ['admin', 'cooperative'],
    // create = reportar atraso, feito pelo motorista via delay-report
    edit: ['admin'],
    delete: ['admin'],
  },

  // Recursos exclusivos do portal de motorista
  'driver-profile': {
    view: ['driver'],
    edit: ['driver'],
  },
  'driver-routes': {
    view: ['driver'],
  },
  'driver-schedules': {
    view: ['driver'],
  },
  'delay-report': {
    create: ['driver'],
  },
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Retorna `true` se o papel `role` pode executar `action` no recurso `resource`.
 * Retorna `false` se o recurso/ação não existir na matriz.
 */
export function can(
  role: AppPortalRole,
  resource: ResourceKey,
  action: ActionKey,
): boolean {
  return PERMISSIONS[resource]?.[action]?.includes(role) ?? false
}
