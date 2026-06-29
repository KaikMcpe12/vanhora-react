import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { mockSchedulesAPI } from '@/lib/api/mock-schedules-api'
import type { ScheduleFiltersSchema } from '@/lib/schemas/schedule-filters'
import type { Schedule } from '@/lib/types/schedule'
import type { DisplayFilters, ScheduleSort } from '@/lib/types/filters'
import {
  applyDisplayFilters,
  sortSchedules,
} from '@/lib/utils/apply-display-filters'
import {
  groupSchedules,
  type GroupedSchedules,
} from '@/lib/utils/group-schedules'

export interface UseGroupedSchedulesReturn {
  grouped: GroupedSchedules | null
  rawSchedules: Schedule[]   // all fetched schedules (pre-filter), for range computation
  isLoading: boolean
  isError: boolean
  totalCount: number
}

export function useGroupedSchedules(
  searchFilters: Partial<ScheduleFiltersSchema>,
  displayFilters: DisplayFilters,
  sort: ScheduleSort,
): UseGroupedSchedulesReturn {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['schedules-grouped', searchFilters],
    queryFn: () =>
      mockSchedulesAPI({
        origin: searchFilters.origin,
        destination: searchFilters.destination,
        date: searchFilters.date,
        cooperative: searchFilters.cooperative,
        priceMin: searchFilters.priceMin,
        priceMax: searchFilters.priceMax,
        rating: searchFilters.minRating,
        dayOfWeek: searchFilters.dayOfWeek,
        page: 0,
        limit: 9999,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const rawSchedules: Schedule[] = data?.schedules ?? []

  const grouped = useMemo(() => {
    if (!data) return null

    // Apply client-side display filters
    const filtered = applyDisplayFilters(rawSchedules, displayFilters)

    // Group by temporal window (nextDeparture always by time, regardless of sort)
    const groups = groupSchedules(filtered, searchFilters.date)

    // Apply sort to urgent, later, cancelled (not nextDeparture — invariant)
    return {
      nextDeparture: groups.nextDeparture,
      urgent: sortSchedules(groups.urgent, sort),
      later: sortSchedules(groups.later, sort),
      cancelled: sortSchedules(groups.cancelled, sort),
    }
  }, [data, displayFilters, sort, searchFilters.date])

  return {
    grouped,
    rawSchedules,
    isLoading,
    isError,
    totalCount: data?.meta.totalCount ?? 0,
  }
}
