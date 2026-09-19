import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  type AdminCooperative,
  MOCK_ADMIN_COOPERATIVES,
} from '@/lib/data/mock-admin-cooperatives'
import { queryKeys } from '@/lib/query-keys'

const API_DELAY = 300
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface ListCooperativesFilters {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface CooperativeOption {
  id: string
  name: string
  brandColor: string
}

export interface CreateCooperativePayload {
  name: string
  phone: string
  site?: string
  logoUrl?: string
  brandColor: string
  description?: string
}

export const mockCooperativesApi = {
  async listCooperatives(
    filters: ListCooperativesFilters = {},
  ): Promise<{ data: AdminCooperative[]; total: number; avgRating: number }> {
    await delay(API_DELAY)
    const { search = '', status = '', page = 1, pageSize = 20 } = filters

    let filtered = [...MOCK_ADMIN_COOPERATIVES]

    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q))
    }

    if (status) {
      filtered = filtered.filter((c) => c.status === status)
    }

    const total = filtered.length
    const avgRating =
      filtered.length > 0
        ? filtered.reduce((sum, c) => sum + c.rating, 0) / filtered.length
        : 0

    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return { data, total, avgRating: Math.round(avgRating * 10) / 10 }
  },

  async getCooperativeOptions(): Promise<CooperativeOption[]> {
    await delay(API_DELAY)
    // exclui inativas — não devem ser opção de atribuição/filtro
    return MOCK_ADMIN_COOPERATIVES.filter((c) => c.status !== 'inactive').map(
      (c) => ({ id: c.id, name: c.name, brandColor: c.brandColor }),
    )
  },

  async createCooperative(
    payload: CreateCooperativePayload,
  ): Promise<AdminCooperative> {
    await delay(API_DELAY)

    const newCoop: AdminCooperative = {
      // novas cooperativas recebem UUID v4 real (contrato api-spec.md §1.2)
      id: crypto.randomUUID(),
      name: payload.name,
      phone: payload.phone,
      site: payload.site,
      logoUrl: payload.logoUrl,
      brandColor: payload.brandColor,
      description: payload.description,
      status: 'active',
      routeCount: 0,
      driverCount: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    }

    MOCK_ADMIN_COOPERATIVES.push(newCoop)
    return newCoop
  },

  async updateCooperative(
    id: string,
    payload: Partial<CreateCooperativePayload>,
  ): Promise<AdminCooperative> {
    await delay(API_DELAY)

    const coop = MOCK_ADMIN_COOPERATIVES.find((c) => c.id === id)
    if (!coop) throw new Error('Cooperativa não encontrada')

    Object.assign(coop, payload)
    return coop
  },

  async toggleCooperativeStatus(
    id: string,
    newStatus: AdminCooperative['status'],
  ): Promise<AdminCooperative> {
    await delay(API_DELAY)

    const coop = MOCK_ADMIN_COOPERATIVES.find((c) => c.id === id)
    if (!coop) throw new Error('Cooperativa não encontrada')

    coop.status = newStatus
    return coop
  },

  async getCooperativeStats(): Promise<{
    activeCount: number
    totalRoutes: number
    avgRating: number
  }> {
    await delay(API_DELAY)
    const active = MOCK_ADMIN_COOPERATIVES.filter((c) => c.status === 'active')
    const avg =
      active.length > 0
        ? active.reduce((sum, c) => sum + c.rating, 0) / active.length
        : 0
    return {
      activeCount: active.length,
      totalRoutes: active.reduce((sum, c) => sum + c.routeCount, 0),
      avgRating: Math.round(avg * 10) / 10,
    }
  },
}

export function useAdminCooperatives(filters: ListCooperativesFilters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.list(filters),
    queryFn: () => mockCooperativesApi.listCooperatives(filters),
  })
}

/** Fonte única de opções de cooperativa (React Query, sem loading fake). */
export function useCooperativeOptions() {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.options(),
    queryFn: () => mockCooperativesApi.getCooperativeOptions(),
    staleTime: 5 * 60_000,
  })
}

export function useCooperativeStats() {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.stats(),
    queryFn: () => mockCooperativesApi.getCooperativeStats(),
  })
}

export function useCreateCooperative() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCooperativePayload) =>
      mockCooperativesApi.createCooperative(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.cooperatives.all(),
      }),
  })
}

export function useUpdateCooperative() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<CreateCooperativePayload>
    }) => mockCooperativesApi.updateCooperative(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.cooperatives.all(),
      }),
  })
}

export function useToggleCooperativeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      newStatus,
    }: {
      id: string
      newStatus: AdminCooperative['status']
    }) => mockCooperativesApi.toggleCooperativeStatus(id, newStatus),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.cooperatives.all(),
      }),
  })
}
