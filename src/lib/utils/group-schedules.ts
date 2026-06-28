import type { Schedule } from '@/lib/types/schedule'
import { getMinutesUntilDeparture } from '@/lib/utils/schedule-status'

export interface GroupedSchedules {
  nextDeparture: Schedule | null
  urgent: Schedule[]   // active, 0–30 min
  later: Schedule[]    // active, >30 min
  cancelled: Schedule[]
}

export type SortMode = 'earliest' | 'cheapest' | 'highest_rated'

function isCancelledSchedule(s: Schedule): boolean {
  return s.badge === 'cancelled'
}

function minutesUntil(s: Schedule): number {
  return getMinutesUntilDeparture(s.departureTime)
}

function byDeparture(a: Schedule, b: Schedule) {
  return minutesUntil(a) - minutesUntil(b)
}

function byPrice(a: Schedule, b: Schedule) {
  return a.price - b.price
}

function byRating(a: Schedule, b: Schedule) {
  return (b.cooperativeRating ?? 0) - (a.cooperativeRating ?? 0)
}

export function groupSchedules(
  list: Schedule[],
  sortMode: SortMode = 'earliest',
): GroupedSchedules {
  const cancelled = list.filter(isCancelledSchedule)

  // Only future departures that are not cancelled
  const active = list
    .filter((s) => !isCancelledSchedule(s) && minutesUntil(s) >= 0)
    .sort(byDeparture)

  const [nextDeparture = null, ...rest] = active

  const urgent = rest.filter((s) => minutesUntil(s) <= 30)

  const laterRaw = rest.filter((s) => minutesUntil(s) > 30)
  const sorter =
    sortMode === 'cheapest'
      ? byPrice
      : sortMode === 'highest_rated'
        ? byRating
        : byDeparture
  const later = [...laterRaw].sort(sorter)

  return { nextDeparture, urgent, later, cancelled }
}
