import { useQuery } from '@tanstack/react-query'

import {
  type AdminDashboardStats,
  MOCK_ADMIN_DASHBOARD,
} from '@/lib/data/mock-dashboard'

const API_DELAY = 300

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockDashboardApi = {
  async getAdminStats(): Promise<AdminDashboardStats> {
    await delay(API_DELAY)
    return MOCK_ADMIN_DASHBOARD
  },
}

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => mockDashboardApi.getAdminStats(),
  })
}
