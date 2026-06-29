export type SortField = 'departure_time' | 'price' | 'rating' | 'duration'
export type SortDirection = 'asc' | 'desc'

export interface ScheduleSort {
  field: SortField
  direction: SortDirection
}

export const DEFAULT_SORT: ScheduleSort = {
  field: 'departure_time',
  direction: 'asc',
}

export const SORT_OPTIONS: { sort: ScheduleSort; label: string }[] = [
  { sort: { field: 'departure_time', direction: 'asc' }, label: 'Mais cedo primeiro' },
  { sort: { field: 'departure_time', direction: 'desc' }, label: 'Mais tarde primeiro' },
  { sort: { field: 'price', direction: 'asc' }, label: 'Mais barato primeiro' },
  { sort: { field: 'price', direction: 'desc' }, label: 'Mais caro primeiro' },
  { sort: { field: 'rating', direction: 'desc' }, label: 'Melhor avaliado' },
  { sort: { field: 'rating', direction: 'asc' }, label: 'Pior avaliado' },
  { sort: { field: 'duration', direction: 'asc' }, label: 'Mais rápido' },
  { sort: { field: 'duration', direction: 'desc' }, label: 'Mais longo' },
]

export type Period = 'dawn' | 'morning' | 'afternoon' | 'evening'

export const PERIOD_RANGES: Record<Period, [number, number]> = {
  dawn: [0, 6],
  morning: [6, 12],
  afternoon: [12, 18],
  evening: [18, 24],
}

export const PERIOD_LABELS: Record<Period, string> = {
  dawn: 'Madrugada',
  morning: 'Manhã',
  afternoon: 'Tarde',
  evening: 'Noite',
}

export const PERIOD_ORDER: Period[] = ['dawn', 'morning', 'afternoon', 'evening']

export type RatingFilter = 'any' | '3+' | '4+' | '5'

export interface DisplayFilters {
  periods: Period[]
  priceMin: number | null
  priceMax: number | null
  cooperatives: string[]
  minRating: RatingFilter
  durationMaxMinutes: number | null
  stopsCities: string[]
}

export const DEFAULT_DISPLAY_FILTERS: DisplayFilters = {
  periods: [],
  priceMin: null,
  priceMax: null,
  cooperatives: [],
  minRating: 'any',
  durationMaxMinutes: null,
  stopsCities: [],
}

export function sortKey(s: ScheduleSort): string {
  return `${s.field}:${s.direction}`
}

export function isDefaultSort(s: ScheduleSort): boolean {
  return s.field === DEFAULT_SORT.field && s.direction === DEFAULT_SORT.direction
}
