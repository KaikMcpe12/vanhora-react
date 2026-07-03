// TODO: quando backend existir, mover filtragem para query params do servidor
// ver api-spec.md seção 2.4 (GET /api/cooperatives)
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type CoopSortField = 'name' | 'route_count' | 'rating'
export type CoopSortDirection = 'asc' | 'desc'
export type CoopSort = { field: CoopSortField; direction: CoopSortDirection }
export type CoopRatingFilter = 'any' | '3+' | '4+' | '5'

export const DEFAULT_COOP_SORT: CoopSort = { field: 'route_count', direction: 'desc' }

const VALID_SORT_FIELDS: CoopSortField[] = ['name', 'route_count', 'rating']
const VALID_SORT_DIRECTIONS: CoopSortDirection[] = ['asc', 'desc']
const VALID_RATINGS: CoopRatingFilter[] = ['any', '3+', '4+', '5']

export const COOP_SORT_OPTIONS: { sort: CoopSort; label: string }[] = [
  { sort: { field: 'route_count', direction: 'desc' }, label: 'Mais rotas' },
  { sort: { field: 'route_count', direction: 'asc' }, label: 'Menos rotas' },
  { sort: { field: 'rating', direction: 'desc' }, label: 'Melhor avaliação' },
  { sort: { field: 'rating', direction: 'asc' }, label: 'Pior avaliação' },
  { sort: { field: 'name', direction: 'asc' }, label: 'Nome (A-Z)' },
  { sort: { field: 'name', direction: 'desc' }, label: 'Nome (Z-A)' },
]

function serializeSort(s: CoopSort): string {
  return `${s.field}:${s.direction}`
}

function parseCoopSort(raw: string | null): CoopSort {
  if (!raw) return DEFAULT_COOP_SORT
  const [field, direction] = raw.split(':')
  if (
    VALID_SORT_FIELDS.includes(field as CoopSortField) &&
    VALID_SORT_DIRECTIONS.includes(direction as CoopSortDirection)
  ) {
    return { field: field as CoopSortField, direction: direction as CoopSortDirection }
  }
  return DEFAULT_COOP_SORT
}

function isDefaultSort(s: CoopSort): boolean {
  return s.field === DEFAULT_COOP_SORT.field && s.direction === DEFAULT_COOP_SORT.direction
}

export function useCooperativesFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const cities = useMemo(
    () => searchParams.get('cities')?.split(',').filter(Boolean) ?? [],
    [searchParams],
  )
  const minRating = useMemo((): CoopRatingFilter => {
    const raw = searchParams.get('min_rating') as CoopRatingFilter | null
    return raw && VALID_RATINGS.includes(raw) ? raw : 'any'
  }, [searchParams])
  const sort = useMemo(() => parseCoopSort(searchParams.get('sort')), [searchParams])

  const setQ = useCallback(
    (v: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (v) next.set('q', v)
          else next.delete('q')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setCities = useCallback(
    (v: string[]) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (v.length) next.set('cities', v.join(','))
          else next.delete('cities')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setMinRating = useCallback(
    (v: CoopRatingFilter) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (v !== 'any') next.set('min_rating', v)
          else next.delete('min_rating')
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setSort = useCallback(
    (s: CoopSort) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (isDefaultSort(s)) next.delete('sort')
          else next.set('sort', serializeSort(s))
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const resetAll = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        ;['q', 'cities', 'min_rating', 'sort'].forEach((k) => next.delete(k))
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (q) n++
    if (cities.length) n++
    if (minRating !== 'any') n++
    if (!isDefaultSort(sort)) n++
    return n
  }, [q, cities, minRating, sort])

  return { q, cities, minRating, sort, setQ, setCities, setMinRating, setSort, resetAll, activeFilterCount }
}
