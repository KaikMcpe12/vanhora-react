/**
 * Fábrica centralizada de query keys para React Query.
 *
 * Regras:
 * - Cada domínio expõe `.all()` que retorna o prefixo raiz — usar para
 *   invalidações amplas (ex: após mutação que afeta toda uma entidade).
 * - Keys de listagem recebem `filters` como objeto para que o React Query
 *   diferencie páginas com parâmetros distintos automaticamente.
 * - Keys de detalhe recebem `id` string.
 *
 * @example
 *   // query
 *   queryKey: queryKeys.admin.routes.list(filters)
 *
 *   // invalidação após mutação
 *   queryClient.invalidateQueries({ queryKey: queryKeys.admin.routes.all() })
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyParams = Record<string, any>

export const queryKeys = {
  schedules: {
    /** ['schedules'] — invalida todas as queries de schedules */
    all: () => ['schedules'] as const,
    /** ['schedules', params] — lista paginada (infinite) */
    list: (params?: AnyParams) => ['schedules', params] as const,
    /** ['schedules-grouped', filters] — view agrupada por janela temporal */
    grouped: (filters?: AnyParams) => ['schedules-grouped', filters] as const,
    /** ['schedule', id] — detalhe de um único horário */
    detail: (id: string) => ['schedule', id] as const,
    /** ['rating-check', scheduleId] — check se usuário já avaliou */
    ratingCheck: (scheduleId: string) => ['rating-check', scheduleId] as const,
  },

  admin: {
    /** ['admin'] — invalida todo o namespace admin */
    all: () => ['admin'] as const,

    dashboard: {
      stats: () => ['admin', 'dashboard', 'stats'] as const,
    },

    routes: {
      all: () => ['admin', 'routes'] as const,
      list: (filters?: AnyParams) => ['admin', 'routes', filters] as const,
      detail: (id: string) => ['admin', 'routes', 'detail', id] as const,
    },

    cities: {
      all: () => ['admin', 'cities'] as const,
      list: (filters?: AnyParams) => ['admin', 'cities', filters] as const,
      stats: () => ['admin', 'cities', 'stats'] as const,
    },

    cooperatives: {
      all: () => ['admin', 'cooperatives'] as const,
      list: (filters?: AnyParams) =>
        ['admin', 'cooperatives', filters] as const,
      stats: () => ['admin', 'cooperatives', 'stats'] as const,
      options: () => ['admin', 'cooperatives', 'options'] as const,
      // detalhe master-detail — 4 endpoints isolados (api-spec §3.5)
      detail: (id: string) =>
        ['admin', 'cooperatives', 'detail', id] as const,
      routes: (id: string) =>
        ['admin', 'cooperatives', 'routes', id] as const,
      drivers: (id: string) =>
        ['admin', 'cooperatives', 'drivers', id] as const,
      delays: (id: string) =>
        ['admin', 'cooperatives', 'delays', id] as const,
    },

    delays: {
      all: () => ['admin', 'delays'] as const,
      list: (filters?: AnyParams) => ['admin', 'delays', filters] as const,
      detail: (id: string) => ['admin', 'delays', 'detail', id] as const,
      stats: () => ['admin', 'delays', 'stats'] as const,
    },
  },

  users: {
    all: () => ['users'] as const,
    list: (params?: AnyParams) => ['users', params] as const,
    stats: (role: string, cooperativeId: string | null) =>
      ['users', 'stats', role, cooperativeId] as const,
    driverSchedules: (driverId: string | undefined) =>
      ['driver-schedules', driverId] as const,
  },

  cooperative: {
    portal: {
      stats: () => ['cooperative', 'portal', 'stats'] as const,
      profile: (id: string) =>
        ['cooperative', 'portal', 'profile', id] as const,
      operationalPanel: () =>
        ['cooperative', 'portal', 'operational-panel'] as const,
    },
  },

  driver: {
    portal: {
      profile: () => ['driver', 'portal', 'profile'] as const,
      routes: () => ['driver', 'portal', 'routes'] as const,
      schedulesToday: () => ['driver', 'portal', 'schedules-today'] as const,
    },
  },

  geo: {
    userCity: () => ['user-city'] as const,
  },
}
