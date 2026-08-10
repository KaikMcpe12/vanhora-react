import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import {
  COOP_NOW,
  type CoopOperation,
  type CoopOperationView,
  type CoopPanelKpis,
  getActiveOperations,
  getDelaysByRoute,
  getNextDepartures,
  getOnTimeHistory,
  getPanelKpis,
  getSeverityDistribution,
  type OnTimePoint,
  type RouteDelayCount,
  type SeverityCount,
} from '@/lib/data/mock-cooperative-operations'
import {
  type CooperativePortalStats,
  type CooperativeProfileData,
  MOCK_COOP_PORTAL_STATS,
  MOCK_COOP_PROFILE,
} from '@/lib/data/mock-cooperative-portal'
import { queryKeys } from '@/lib/query-keys'

export interface CoopOperationalPanel {
  operations: CoopOperationView[]
  nextDepartures: CoopOperation[]
  kpis: CoopPanelKpis
  onTimeHistory: OnTimePoint[]
  delaysByRoute: RouteDelayCount[]
  severityDistribution: SeverityCount[]
}

const API_DELAY = 300
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const mockCoopPortalApi = {
  async getStats(): Promise<CooperativePortalStats> {
    await delay(API_DELAY)
    return MOCK_COOP_PORTAL_STATS
  },

  async getOperationalPanel(): Promise<CoopOperationalPanel> {
    await delay(API_DELAY)
    return {
      operations: getActiveOperations(COOP_NOW),
      nextDepartures: getNextDepartures(COOP_NOW),
      kpis: getPanelKpis(COOP_NOW),
      onTimeHistory: getOnTimeHistory(),
      delaysByRoute: getDelaysByRoute(),
      severityDistribution: getSeverityDistribution(),
    }
  },

  async getProfile(cooperativeId: string): Promise<CooperativeProfileData> {
    await delay(API_DELAY)
    // tenta usar dados do admin se disponíveis, senão fallback para o mock fixo
    const admin = MOCK_ADMIN_COOPERATIVES.find((c) => c.id === cooperativeId)
    if (admin) {
      return {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        site: admin.site ?? '',
        description: admin.description ?? '',
        brandColor: admin.brandColor,
        status: admin.status,
        createdAt: admin.createdAt,
      }
    }
    return MOCK_COOP_PROFILE
  },

  async updateProfile(
    cooperativeId: string,
    data: Partial<
      Pick<CooperativeProfileData, 'name' | 'phone' | 'site' | 'description'>
    >,
  ): Promise<CooperativeProfileData> {
    await delay(API_DELAY)
    const idx = MOCK_ADMIN_COOPERATIVES.findIndex((c) => c.id === cooperativeId)
    if (idx !== -1) {
      const coop = MOCK_ADMIN_COOPERATIVES[idx]
      if (data.name !== undefined) coop.name = data.name
      if (data.phone !== undefined) coop.phone = data.phone
      if (data.site !== undefined) coop.site = data.site
      if (data.description !== undefined) coop.description = data.description
    }
    return mockCoopPortalApi.getProfile(cooperativeId)
  },
}

export function useCoopPortalStats() {
  return useQuery({
    queryKey: queryKeys.cooperative.portal.stats(),
    queryFn: () => mockCoopPortalApi.getStats(),
  })
}

export function useCoopOperationalPanel() {
  return useQuery({
    queryKey: queryKeys.cooperative.portal.operationalPanel(),
    queryFn: () => mockCoopPortalApi.getOperationalPanel(),
    refetchInterval: 30_000,
  })
}

export function useCoopProfile(cooperativeId: string) {
  return useQuery({
    queryKey: queryKeys.cooperative.portal.profile(cooperativeId),
    queryFn: () => mockCoopPortalApi.getProfile(cooperativeId),
  })
}

export function useUpdateCoopProfile(cooperativeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      data: Partial<
        Pick<CooperativeProfileData, 'name' | 'phone' | 'site' | 'description'>
      >,
    ) => mockCoopPortalApi.updateProfile(cooperativeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.cooperative.portal.profile(cooperativeId),
      })
    },
  })
}
