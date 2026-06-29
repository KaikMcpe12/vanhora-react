import type { Schedule } from '@/lib/types/schedule'
import {
  type DisplayFilters,
  PERIOD_RANGES,
  type ScheduleSort,
} from '@/lib/types/filters'

export function parseDurationToMinutes(duration: string): number {
  const h = duration.match(/(\d+)h/)
  const m = duration.match(/(\d+)min/)
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0)
}

function matchesPeriod(s: Schedule, periods: DisplayFilters['periods']): boolean {
  if (periods.length === 0) return true
  const [hour] = s.departureTime.split(':').map(Number)
  return periods.some((p) => {
    const [start, end] = PERIOD_RANGES[p]
    return hour >= start && hour < end
  })
}

function matchesRating(s: Schedule, rating: DisplayFilters['minRating']): boolean {
  if (rating === 'any') return true
  const min = rating === '5' ? 5 : rating === '4+' ? 4 : 3
  return (s.cooperativeRating ?? 0) >= min
}

/**
 * Filtra uma lista de schedules pelos display filters.
 * @param exceptCooperatives  Se true, ignora o filtro de cooperativas
 *                            (para o cálculo de contagem dinâmica).
 */
export function applyDisplayFilters(
  list: Schedule[],
  filters: DisplayFilters,
  { exceptCooperatives = false, exceptStops = false } = {},
): Schedule[] {
  return list.filter((s) => {
    if (!matchesPeriod(s, filters.periods)) return false
    if (filters.priceMin != null && s.price < filters.priceMin) return false
    if (filters.priceMax != null && s.price > filters.priceMax) return false
    if (!matchesRating(s, filters.minRating)) return false
    if (
      filters.durationMaxMinutes != null &&
      parseDurationToMinutes(s.duration) > filters.durationMaxMinutes
    )
      return false

    if (!exceptCooperatives && filters.cooperatives.length > 0) {
      if (!filters.cooperatives.includes(s.cooperativeName)) return false
    }

    if (!exceptStops && filters.stopsCities.length > 0) {
      const cities = [s.origin, s.destination]
      if (!filters.stopsCities.some((c) => cities.includes(c))) return false
    }

    return true
  })
}

export function sortSchedules(list: Schedule[], sort: ScheduleSort): Schedule[] {
  return [...list].sort((a, b) => {
    let cmp = 0
    switch (sort.field) {
      case 'departure_time': {
        const [ah, am] = a.departureTime.split(':').map(Number)
        const [bh, bm] = b.departureTime.split(':').map(Number)
        cmp = ah * 60 + am - (bh * 60 + bm)
        break
      }
      case 'price':
        cmp = a.price - b.price
        break
      case 'rating':
        cmp = (a.cooperativeRating ?? 0) - (b.cooperativeRating ?? 0)
        break
      case 'duration':
        cmp = parseDurationToMinutes(a.duration) - parseDurationToMinutes(b.duration)
        break
    }
    return sort.direction === 'asc' ? cmp : -cmp
  })
}
