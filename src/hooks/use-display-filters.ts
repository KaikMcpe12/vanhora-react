import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  DEFAULT_SORT,
  type DisplayFilters,
  isDefaultSort,
  type Period,
  type RatingFilter,
  type ScheduleSort,
  type SortDirection,
  type SortField,
} from '@/lib/types/filters'

const VALID_SORT_FIELDS: SortField[] = ['departure_time', 'price', 'rating', 'duration']
const VALID_SORT_DIRECTIONS: SortDirection[] = ['asc', 'desc']
const VALID_PERIODS: Period[] = ['dawn', 'morning', 'afternoon', 'evening']
const VALID_RATINGS: RatingFilter[] = ['any', '3+', '4+', '5']

function parseSort(raw: string | null): ScheduleSort {
  if (!raw) return DEFAULT_SORT
  const [field, direction] = raw.split(':')
  if (
    VALID_SORT_FIELDS.includes(field as SortField) &&
    VALID_SORT_DIRECTIONS.includes(direction as SortDirection)
  ) {
    return { field: field as SortField, direction: direction as SortDirection }
  }
  return DEFAULT_SORT
}

export function useDisplayFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const sort = useMemo(
    () => parseSort(searchParams.get('sort')),
    [searchParams],
  )

  const filters: DisplayFilters = useMemo(() => {
    const rawPeriods = searchParams.get('periods')?.split(',').filter(Boolean) ?? []
    const rawRating = searchParams.get('min_rating') as RatingFilter | null
    return {
      periods: rawPeriods.filter((p): p is Period => VALID_PERIODS.includes(p as Period)),
      priceMin: searchParams.get('price_min') ? Number(searchParams.get('price_min')) : null,
      priceMax: searchParams.get('price_max') ? Number(searchParams.get('price_max')) : null,
      cooperatives: searchParams.get('cooperatives')?.split(',').filter(Boolean) ?? [],
      minRating: rawRating && VALID_RATINGS.includes(rawRating) ? rawRating : 'any',
      durationMaxMinutes: searchParams.get('duration_max')
        ? Number(searchParams.get('duration_max'))
        : null,
      stopsCities: searchParams.get('stops')?.split(',').filter(Boolean) ?? [],
    }
  }, [searchParams])

  const setSort = useCallback(
    (s: ScheduleSort) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (isDefaultSort(s)) {
            next.delete('sort')
          } else {
            next.set('sort', `${s.field}:${s.direction}`)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setFilters = useCallback(
    (updates: Partial<DisplayFilters>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const merged = { ...filters, ...updates }

          merged.periods.length > 0
            ? next.set('periods', merged.periods.join(','))
            : next.delete('periods')

          merged.priceMin != null
            ? next.set('price_min', String(merged.priceMin))
            : next.delete('price_min')
          merged.priceMax != null
            ? next.set('price_max', String(merged.priceMax))
            : next.delete('price_max')

          merged.cooperatives.length > 0
            ? next.set('cooperatives', merged.cooperatives.join(','))
            : next.delete('cooperatives')

          merged.minRating !== 'any'
            ? next.set('min_rating', merged.minRating)
            : next.delete('min_rating')

          merged.durationMaxMinutes != null
            ? next.set('duration_max', String(merged.durationMaxMinutes))
            : next.delete('duration_max')

          merged.stopsCities.length > 0
            ? next.set('stops', merged.stopsCities.join(','))
            : next.delete('stops')

          return next
        },
        { replace: true },
      )
    },
    [setSearchParams, filters],
  )

  const resetAll = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        ;['periods', 'price_min', 'price_max', 'cooperatives', 'min_rating',
          'duration_max', 'stops', 'sort'].forEach((k) => next.delete(k))
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filters.periods.length > 0) n++
    if (filters.priceMin != null || filters.priceMax != null) n++
    if (filters.cooperatives.length > 0) n++
    if (filters.minRating !== 'any') n++
    if (filters.durationMaxMinutes != null) n++
    if (filters.stopsCities.length > 0) n++
    return n
  }, [filters])

  const isDefaultFilters = activeFilterCount === 0 && isDefaultSort(sort)

  return {
    filters,
    sort,
    setSort,
    setFilters,
    resetAll,
    activeFilterCount,
    isDefaultFilters,
  }
}

export type UseDisplayFiltersReturn = ReturnType<typeof useDisplayFilters>
