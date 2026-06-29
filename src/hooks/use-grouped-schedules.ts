import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { mockSchedulesAPI } from '@/lib/api/mock-schedules-api'
import type { ScheduleFiltersSchema } from '@/lib/schemas/schedule-filters'
import {
  groupSchedules,
  type GroupedSchedules,
  type SortMode,
} from '@/lib/utils/group-schedules'

export interface UseGroupedSchedulesReturn {
  grouped: GroupedSchedules | null
  isLoading: boolean
  isError: boolean
  totalCount: number
}

export function useGroupedSchedules(
  filters: Partial<ScheduleFiltersSchema>,
  sortMode: SortMode = 'earliest',
): UseGroupedSchedulesReturn {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedules-grouped', filters],
    queryFn: () =>
      mockSchedulesAPI({
        origin: filters.origin,
        destination: filters.destination,
        date: filters.date,
        cooperative: filters.cooperative,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        rating: filters.minRating,
        dayOfWeek: filters.dayOfWeek,
        page: 0,
        limit: 9999, // busca tudo para agrupamento client-side
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const grouped = useMemo(() => {
    if (!data) return null
    return groupSchedules(data.schedules, sortMode, filters.date)
  }, [data, sortMode, filters.date])

  return {
    grouped,
    isLoading,
    isError,
    totalCount: data?.meta.totalCount ?? 0,
  }
}
