import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query-keys'
import type { RouteFormValues } from '@/lib/schemas/route-schema'

const API_DELAY = 250
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export type RouteRowStatus = 'active' | 'suspended' | 'inactive'

export interface RouteStop {
  city: string
  time?: string
}

export interface AdminRouteRow {
  id: string
  name: string
  code: string
  cooperativeName: string
  cooperativeId?: string
  origin: string
  destination: string
  status: RouteRowStatus
  price: number
  activeDays: string[]
  driverName?: string
  scheduleCount: number
  stops: RouteStop[]
}

/**
 * Fonte única das rotas (lista + edição). Espelha `GET /api/admin/routes` e
 * `GET/PUT /api/admin/routes/:id` da api-spec. Mutável em memória (mock).
 */
const ROUTES_STORE: AdminRouteRow[] = [
  {
    id: 'route-expresso-norte',
    name: 'Expresso Norte',
    code: 'R-204',
    cooperativeName: 'Metro Transportes',
    cooperativeId: 'coop-metro',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    status: 'active',
    price: 30,
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    driverName: 'João Silva',
    scheduleCount: 3,
    stops: [
      { city: 'Terminal Central', time: '06:00' },
      { city: 'Shopping Metrô', time: '06:20' },
      { city: 'Zona Industrial', time: '06:45' },
    ],
  },
  {
    id: 'route-linha-sul',
    name: 'Linha Sul Express',
    code: 'R-319',
    cooperativeName: 'Expresso São Francisco',
    cooperativeId: 'coop-expresso',
    origin: 'Praça da Sé',
    destination: 'Aeroporto Int.',
    status: 'suspended',
    price: 45,
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    scheduleCount: 2,
    stops: [
      { city: 'Praça da Sé', time: '05:30' },
      { city: 'Aeroporto Int.', time: '06:15' },
    ],
  },
  {
    id: 'route-trans-leste',
    name: 'Trans Leste',
    code: 'R-402',
    cooperativeName: 'Metro Transportes',
    cooperativeId: 'coop-metro',
    origin: 'Vila Maria',
    destination: 'Centro Empresarial',
    status: 'active',
    price: 35,
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    driverName: 'Marcos Oliveira',
    scheduleCount: 4,
    stops: [
      { city: 'Vila Maria', time: '07:00' },
      { city: 'Centro Empresarial', time: '07:40' },
    ],
  },
  {
    id: 'route-noturna-a',
    name: 'Rota Noturna A',
    code: 'N-07',
    cooperativeName: 'Cooperativa Vale',
    cooperativeId: 'coop-vale',
    origin: 'Campus Univ.',
    destination: 'Estação Metro',
    status: 'inactive',
    price: 25,
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    scheduleCount: 1,
    stops: [
      { city: 'Campus Univ.', time: '22:00' },
      { city: 'Estação Metro', time: '22:30' },
    ],
  },
]

export interface RouteFormPayload {
  name: string
  code: string
  cooperativeName: string
  cooperativeId?: string
  origin: string
  destination: string
  price: number
  activeDays: string[]
  driverName?: string
  status: RouteRowStatus
  stops: RouteStop[]
}

interface ListRoutesFilters {
  search?: string
  status?: string
  cooperative?: string
}

/** Normaliza os valores do form para o payload da API (limpa strings vazias). */
export function routeValuesToPayload(values: RouteFormValues): RouteFormPayload {
  return {
    ...values,
    driverName: values.driverName || undefined,
    stops: values.stops.map((s) => ({ city: s.city, time: s.time || undefined })),
  }
}

export const mockRoutesApi = {
  async listRoutes(filters: ListRoutesFilters = {}): Promise<AdminRouteRow[]> {
    await delay(API_DELAY)
    const { search = '', status = '', cooperative = '' } = filters
    let filtered = [...ROUTES_STORE]
    if (cooperative) {
      filtered = filtered.filter((r) => r.cooperativeName === cooperative)
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter((r) =>
        [r.name, r.code, r.origin, r.destination, r.cooperativeName]
          .join(' ')
          .toLowerCase()
          .includes(q),
      )
    }
    return filtered
  },

  async getRoute(id: string): Promise<AdminRouteRow | undefined> {
    await delay(API_DELAY)
    return ROUTES_STORE.find((r) => r.id === id)
  },

  async createRoute(payload: RouteFormPayload): Promise<AdminRouteRow> {
    await delay(API_DELAY)
    const newRoute: AdminRouteRow = {
      ...payload,
      id: `route-${Date.now()}`,
      code: payload.code?.trim() || `R-${Math.floor(100 + Math.random() * 900)}`,
      scheduleCount: 0,
    }
    ROUTES_STORE.unshift(newRoute)
    return newRoute
  },

  async updateRoute(id: string, payload: RouteFormPayload): Promise<AdminRouteRow> {
    await delay(API_DELAY)
    const route = ROUTES_STORE.find((r) => r.id === id)
    if (!route) throw new Error('Rota não encontrada')
    Object.assign(route, payload)
    return route
  },

  async toggleRouteStatus(
    id: string,
    newStatus: RouteRowStatus,
  ): Promise<AdminRouteRow> {
    await delay(API_DELAY)
    const route = ROUTES_STORE.find((r) => r.id === id)
    if (!route) throw new Error('Rota não encontrada')
    route.status = newStatus
    return route
  },
}

export function useRoutesList(filters: ListRoutesFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.routes.list(filters),
    queryFn: () => mockRoutesApi.listRoutes(filters),
  })
}

export function useRoute(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.routes.detail(id as string),
    queryFn: () => mockRoutesApi.getRoute(id as string),
    enabled: !!id,
  })
}

export function useCreateRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RouteFormPayload) => mockRoutesApi.createRoute(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.routes.all() }),
  })
}

export function useUpdateRoute() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RouteFormPayload }) =>
      mockRoutesApi.updateRoute(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.routes.all() }),
  })
}

export function useToggleRouteStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: RouteRowStatus }) =>
      mockRoutesApi.toggleRouteStatus(id, newStatus),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.routes.all() }),
  })
}
