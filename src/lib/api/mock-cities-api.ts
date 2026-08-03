import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  type AdminCity,
  MOCK_ADMIN_CITIES,
} from '@/lib/data/mock-admin-cities'

const API_DELAY = 300
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

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

    const newCity: AdminCity = {
      id: `city-${Date.now()}`,
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

    if (payload.name !== undefined) city.name = payload.name
    if (payload.state !== undefined) city.state = payload.state

    return city
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
    queryKey: ['admin', 'cities', filters],
    queryFn: () => mockCitiesApi.listCities(filters),
  })
}

export function useCityStats() {
  return useQuery({
    queryKey: ['admin', 'cities', 'stats'],
    queryFn: () => mockCitiesApi.getCityStats(),
  })
}

export function useCreateCity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { name: string; state: string }) =>
      mockCitiesApi.createCity(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cities'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cities'] }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'cities'] }),
  })
}
