import {
  createParser,
  parseAsArrayOf,
  parseAsFloat,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'nuqs'
import { useCallback, useEffect, useMemo } from 'react'

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
const VALID_SORT_DIRS: SortDirection[] = ['asc', 'desc']
const VALID_PERIODS: Period[] = ['dawn', 'morning', 'afternoon', 'evening']
const VALID_RATINGS: RatingFilter[] = ['any', '3+', '4+', '5']

const SORT_STORAGE_KEY = 'vh_last_sort'

// parser customizado para o formato "campo:direção" do sort (ex: "price:asc")
const parseAsSort = createParser<ScheduleSort>({
  parse: (raw) => {
    const [field, dir] = raw.split(':')
    if (
      VALID_SORT_FIELDS.includes(field as SortField) &&
      VALID_SORT_DIRS.includes(dir as SortDirection)
    ) {
      return { field: field as SortField, direction: dir as SortDirection }
    }
    return null
  },
  serialize: ({ field, direction }) => `${field}:${direction}`,
  eq: (a, b) => a.field === b.field && a.direction === b.direction,
})

// parsers mapeados para os nomes de params existentes na url (snake_case)
const displayParsers = {
  periods: parseAsArrayOf(parseAsString).withDefault([]),
  price_min: parseAsFloat,
  price_max: parseAsFloat,
  cooperatives: parseAsArrayOf(parseAsString).withDefault([]),
  min_rating: parseAsString.withDefault('any'),
  duration_max: parseAsFloat,
  stops: parseAsArrayOf(parseAsString).withDefault([]),
}

export function useDisplayFilters() {
  const [sort, setSort] = useQueryState(
    'sort',
    parseAsSort.withDefault(DEFAULT_SORT).withOptions({ history: 'replace' }),
  )

  const [urlDisplay, setUrlDisplay] = useQueryStates(displayParsers, {
    history: 'replace',
  })

  // sincroniza localStorage → url apenas na montagem, quando não há sort explícito na url
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('sort')) return
    try {
      const stored = localStorage.getItem(SORT_STORAGE_KEY)
      if (!stored) return
      const [field, dir] = stored.split(':')
      if (
        VALID_SORT_FIELDS.includes(field as SortField) &&
        VALID_SORT_DIRS.includes(dir as SortDirection)
      ) {
        const parsed: ScheduleSort = {
          field: field as SortField,
          direction: dir as SortDirection,
        }
        if (!isDefaultSort(parsed)) void setSort(parsed)
      }
    } catch {
      // ignore erros de localStorage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSetSort = useCallback(
    (s: ScheduleSort) => {
      try {
        if (isDefaultSort(s)) localStorage.removeItem(SORT_STORAGE_KEY)
        else localStorage.setItem(SORT_STORAGE_KEY, `${s.field}:${s.direction}`)
      } catch {
        // ignore
      }
      void setSort(isDefaultSort(s) ? null : s)
    },
    [setSort],
  )

  // atualiza filtros de display parcialmente; nuqs faz merge automaticamente
  const setFilters = useCallback(
    (updates: Partial<DisplayFilters>) => {
      const mapped: Parameters<typeof setUrlDisplay>[0] = {}

      if ('periods' in updates) mapped.periods = updates.periods?.length ? updates.periods : null
      if ('priceMin' in updates) mapped.price_min = updates.priceMin ?? null
      if ('priceMax' in updates) mapped.price_max = updates.priceMax ?? null
      if ('cooperatives' in updates)
        mapped.cooperatives = updates.cooperatives?.length ? updates.cooperatives : null
      if ('minRating' in updates) mapped.min_rating = updates.minRating ?? null
      if ('durationMaxMinutes' in updates) mapped.duration_max = updates.durationMaxMinutes ?? null
      if ('stopsCities' in updates)
        mapped.stops = updates.stopsCities?.length ? updates.stopsCities : null

      void setUrlDisplay(mapped)
    },
    [setUrlDisplay],
  )

  const resetAll = useCallback(() => {
    void setSort(null)
    void setUrlDisplay({
      periods: null,
      price_min: null,
      price_max: null,
      cooperatives: null,
      min_rating: null,
      duration_max: null,
      stops: null,
    })
  }, [setSort, setUrlDisplay])

  // mapeia o estado da url (snake_case) para a interface DisplayFilters (camelCase)
  const filters: DisplayFilters = useMemo(
    () => ({
      periods: urlDisplay.periods.filter((p): p is Period =>
        VALID_PERIODS.includes(p as Period),
      ),
      priceMin: urlDisplay.price_min,
      priceMax: urlDisplay.price_max,
      cooperatives: urlDisplay.cooperatives,
      minRating: VALID_RATINGS.includes(urlDisplay.min_rating as RatingFilter)
        ? (urlDisplay.min_rating as RatingFilter)
        : 'any',
      durationMaxMinutes: urlDisplay.duration_max,
      stopsCities: urlDisplay.stops,
    }),
    [urlDisplay],
  )

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
    setSort: handleSetSort,
    setFilters,
    resetAll,
    activeFilterCount,
    isDefaultFilters,
  }
}

export type UseDisplayFiltersReturn = ReturnType<typeof useDisplayFilters>
