import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  MOCK_ADMIN_DELAYS,
  MOCK_DELAY_STATS,
  type AdminDelay,
  type AdminDelayStats,
} from '@/lib/data/mock-admin-delays'

const API_DELAY = 300
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface ListDelaysFilters {
  search?: string
  period?: '24h' | '7d' | '30d' | ''
  severity?: AdminDelay['severity'] | ''
  cooperativeId?: string
  status?: 'pending' | 'resolved' | ''
  page?: number
  pageSize?: number
}

function getPeriodMs(period: string): number {
  if (period === '24h') return 24 * 3_600_000
  if (period === '7d') return 7 * 86_400_000
  if (period === '30d') return 30 * 86_400_000
  return Infinity
}

export const mockDelaysApi = {
  async listDelays(
    filters: ListDelaysFilters = {},
  ): Promise<{ data: AdminDelay[]; total: number }> {
    await delay(API_DELAY)
    const {
      search = '',
      period = '30d',
      severity = '',
      cooperativeId = '',
      status = '',
      page = 1,
      pageSize = 20,
    } = filters

    const cutoffMs = getPeriodMs(period)
    const now = Date.now()

    let filtered = MOCK_ADMIN_DELAYS.filter((d) => {
      const age = now - new Date(d.reportedAt).getTime()
      if (age > cutoffMs) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        const hay = `${d.routeCode} ${d.routeName} ${d.cooperativeName}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      if (severity && d.severity !== severity) return false
      if (cooperativeId && d.cooperativeId !== cooperativeId) return false
      if (status && d.status !== status) return false

      return true
    })

    const total = filtered.length
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return { data, total }
  },

  async resolveDelay(id: string): Promise<AdminDelay> {
    await delay(API_DELAY)

    const delay_ = MOCK_ADMIN_DELAYS.find((d) => d.id === id)
    if (!delay_) throw new Error('Atraso não encontrado')

    delay_.status = 'resolved'
    delay_.resolvedAt = new Date().toISOString()
    return delay_
  },

  async reopenDelay(id: string): Promise<AdminDelay> {
    await delay(API_DELAY)

    const delay_ = MOCK_ADMIN_DELAYS.find((d) => d.id === id)
    if (!delay_) throw new Error('Atraso não encontrado')

    delay_.status = 'pending'
    delay_.resolvedAt = undefined
    return delay_
  },

  async getDelayStats(): Promise<AdminDelayStats> {
    await delay(API_DELAY)
    return MOCK_DELAY_STATS
  },
}

export function useAdminDelays(filters: ListDelaysFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'delays', filters],
    queryFn: () => mockDelaysApi.listDelays(filters),
  })
}

export function useAdminDelayStats() {
  return useQuery({
    queryKey: ['admin', 'delays', 'stats'],
    queryFn: () => mockDelaysApi.getDelayStats(),
  })
}

export function useResolveDelay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mockDelaysApi.resolveDelay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'delays'] })
    },
  })
}

export function useReopenDelay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mockDelaysApi.reopenDelay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'delays'] })
    },
  })
}
