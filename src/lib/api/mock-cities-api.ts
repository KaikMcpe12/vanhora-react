import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  type AdminCity,
  MOCK_ADMIN_CITIES,
} from '@/lib/data/mock-admin-cities'
import { queryKeys } from '@/lib/query-keys'

const API_DELAY = 300
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Erros simulados que espelham o contrato do back (api-spec.md §3.6).
export class CityConflictError extends Error {
  code = 'CITY_CONFLICT' as const
  constructor(name: string, state: string) {
    super(`Já existe uma cidade com o nome "${name}" em ${state}.`)
  }
}

export class CityInUseError extends Error {
  code = 'CITY_IN_USE' as const
  constructor(name: string, routeCount: number) {
    super(
      `A cidade "${name}" está vinculada a ${routeCount} rota${routeCount > 1 ? 's' : ''}.`,
    )
  }
}

interface ListCitiesFilters {
  search?: string
  status?: 'active' | 'inactive' | ''
  page?: number
  pageSize?: number
}

export const mockCitiesApi = {
  async listCities(
    filters: ListCitiesFilters = {},
  ): Promise<{ data: AdminCity[]; total: number }> {
    await delay(API_DELAY)
    const { search = '', status = '', page = 1, pageSize = 20 } = filters

    let filtered = [...MOCK_ADMIN_CITIES]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q))
    }

    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }

    const total = filtered.length
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return { data, total }
  },

  async createCity(payload: {
    name: string
    state: string
  }): Promise<AdminCity> {
    await delay(API_DELAY)

    const norm = (s: string) => s.trim().toLowerCase()
    const dup = MOCK_ADMIN_CITIES.find(
      (c) =>
        norm(c.name) === norm(payload.name) && c.state === payload.state,
    )
    if (dup) throw new CityConflictError(payload.name, payload.state)

    const newCity: AdminCity = {
      id: crypto.randomUUID(),
      name: payload.name,
      state: payload.state,
      status: 'active',
      routeCount: 0,
      createdAt: new Date().toISOString(),
    }

    MOCK_ADMIN_CITIES.push(newCity)
    return newCity
  },

  async updateCity(
    id: string,
    payload: Partial<{ name: string; state: string }>,
  ): Promise<AdminCity> {
    await delay(API_DELAY)

    const city = MOCK_ADMIN_CITIES.find((c) => c.id === id)
    if (!city) throw new Error('Cidade não encontrada')

    const nextName = payload.name ?? city.name
    const nextState = payload.state ?? city.state
    const norm = (s: string) => s.trim().toLowerCase()
    const dup = MOCK_ADMIN_CITIES.find(
      (c) =>
        c.id !== id &&
        norm(c.name) === norm(nextName) &&
        c.state === nextState,
    )
    if (dup) throw new CityConflictError(nextName, nextState)

    if (payload.name !== undefined) city.name = payload.name
    if (payload.state !== undefined) city.state = payload.state

    return city
  },

  async deleteCity(id: string): Promise<void> {
    await delay(API_DELAY)

    const idx = MOCK_ADMIN_CITIES.findIndex((c) => c.id === id)
    if (idx === -1) throw new Error('Cidade não encontrada')

    const city = MOCK_ADMIN_CITIES[idx]
    if (city.routeCount > 0) {
      throw new CityInUseError(city.name, city.routeCount)
    }

    MOCK_ADMIN_CITIES.splice(idx, 1)
  },

  async toggleCityStatus(
    id: string,
    newStatus: 'active' | 'inactive',
  ): Promise<AdminCity> {
    await delay(API_DELAY)

    const city = MOCK_ADMIN_CITIES.find((c) => c.id === id)
    if (!city) throw new Error('Cidade não encontrada')

    city.status = newStatus
    return city
  },

  async getCityStats(): Promise<{
    total: number
    withRoutes: number
    inactive: number
  }> {
    await delay(API_DELAY)
    return {
      total: MOCK_ADMIN_CITIES.length,
      withRoutes: MOCK_ADMIN_CITIES.filter((c) => c.routeCount > 0).length,
      inactive: MOCK_ADMIN_CITIES.filter((c) => c.status === 'inactive').length,
    }
  },
}

export function useAdminCities(filters: ListCitiesFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.cities.list(filters),
    queryFn: () => mockCitiesApi.listCities(filters),
  })
}

export function useCityStats() {
  return useQuery({
    queryKey: queryKeys.admin.cities.stats(),
    queryFn: () => mockCitiesApi.getCityStats(),
  })
}

export function useCreateCity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; state: string }) =>
      mockCitiesApi.createCity(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities.all() }),
  })
}

export function useUpdateCity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<{ name: string; state: string }>
    }) => mockCitiesApi.updateCity(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities.all() }),
  })
}

export function useToggleCityStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      newStatus,
    }: {
      id: string
      newStatus: 'active' | 'inactive'
    }) => mockCitiesApi.toggleCityStatus(id, newStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities.all() }),
  })
}

export function useDeleteCity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mockCitiesApi.deleteCity(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities.all() }),
  })
}
