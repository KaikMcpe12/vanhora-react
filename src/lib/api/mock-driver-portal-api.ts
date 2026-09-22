import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { MOCK_ADMIN_DELAYS } from '@/lib/data/mock-admin-delays'
import {
  type DriverProfile,
  type DriverRoute,
  type DriverScheduleEntry,
  MOCK_DRIVER_PROFILE,
  MOCK_DRIVER_ROUTES,
  MOCK_DRIVER_SCHEDULES_TODAY,
  MOCK_DRIVER_SCHEDULES_WEEKLY,
} from '@/lib/data/mock-driver-portal'
import { queryKeys } from '@/lib/query-keys'
import type { DelayCause } from '@/lib/schemas/report-delay'

export interface ReportDelayPayload {
  routeId: string
  routeCode: string
  routeName: string
  scheduleId?: string
  cause: DelayCause
  delayMinutes: number
  severity: 'low' | 'medium' | 'high'
  reason?: string
}

const API_DELAY = 300
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

let driverProfileState: DriverProfile = { ...MOCK_DRIVER_PROFILE }

export const mockDriverPortalApi = {
  async getProfile(): Promise<DriverProfile> {
    await delay(API_DELAY)
    return { ...driverProfileState }
  },

  async updateProfile(
    data: Partial<Pick<DriverProfile, 'name' | 'phone'>>,
  ): Promise<DriverProfile> {
    await delay(API_DELAY)
    driverProfileState = { ...driverProfileState, ...data }
    return { ...driverProfileState }
  },

  async getRoutes(): Promise<DriverRoute[]> {
    await delay(API_DELAY)
    return MOCK_DRIVER_ROUTES
  },

  async getSchedulesToday(): Promise<DriverScheduleEntry[]> {
    await delay(API_DELAY)
    return MOCK_DRIVER_SCHEDULES_TODAY
  },

  async getSchedulesWeekly(): Promise<DriverScheduleEntry[]> {
    await delay(API_DELAY)
    return MOCK_DRIVER_SCHEDULES_WEEKLY
  },

  async reportDelay(payload: ReportDelayPayload): Promise<void> {
    await delay(API_DELAY)
    const newEntry = {
      id: `delay-driver-${Date.now()}`,
      routeCode: payload.routeCode,
      routeName: payload.routeName,
      cooperativeId: driverProfileState.cooperativeId,
      cooperativeName: driverProfileState.cooperativeName,
      delayMinutes: payload.delayMinutes,
      reason: payload.reason?.trim() ?? '',
      severity: payload.severity,
      cause: payload.cause,
      reportedBy: driverProfileState.name,
      reportedAt: new Date().toISOString(),
      status: 'pending' as const,
    }
    MOCK_ADMIN_DELAYS.push(newEntry)
  },
}

export function useDriverProfile() {
  return useQuery({
    queryKey: queryKeys.driver.portal.profile(),
    queryFn: () => mockDriverPortalApi.getProfile(),
  })
}

export function useUpdateDriverProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Pick<DriverProfile, 'name' | 'phone'>>) =>
      mockDriverPortalApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.driver.portal.profile(),
      })
    },
  })
}

export function useDriverRoutes() {
  return useQuery({
    queryKey: queryKeys.driver.portal.routes(),
    queryFn: () => mockDriverPortalApi.getRoutes(),
  })
}

export function useDriverSchedulesToday() {
  return useQuery({
    queryKey: queryKeys.driver.portal.schedulesToday(),
    queryFn: () => mockDriverPortalApi.getSchedulesToday(),
  })
}

export function useDriverSchedulesWeekly() {
  return useQuery({
    queryKey: queryKeys.driver.portal.schedulesWeekly(),
    queryFn: () => mockDriverPortalApi.getSchedulesWeekly(),
  })
}

export function useReportDelay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReportDelayPayload) =>
      mockDriverPortalApi.reportDelay(payload),
    onSuccess: () => {
      // invalida a lista de atrasos no admin para refletir o novo registro
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.delays.all() })
      toast.success('Atraso reportado com sucesso')
    },
  })
}
