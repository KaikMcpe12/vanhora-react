import type { Schedule } from '@/lib/types/schedule'

export interface GroupedSchedules {
  nextDeparture: Schedule | null
  urgent: Schedule[]   // active, 1–30 min (before external sort)
  later: Schedule[]    // active, >30 min  (before external sort)
  cancelled: Schedule[]
}

// kept for backward compat with other consumers (favorites tabs, etc.)
export type SortMode = 'earliest' | 'cheapest' | 'highest_rated'

function isCancelledSchedule(s: Schedule): boolean {
  return s.badge === 'cancelled'
}

function departureDateTime(s: Schedule, referenceDate: Date): Date {
  const [hours, minutes] = s.departureTime.split(':').map(Number)
  const d = new Date(referenceDate)
  d.setHours(hours, minutes, 0, 0)
  return d
}

function minutesUntilFromNow(s: Schedule, now: Date, referenceDate: Date): number {
  return Math.round(
    (departureDateTime(s, referenceDate).getTime() - now.getTime()) / 60_000,
  )
}

/**
 * Groups a schedule list by temporal window.
 * Sorting is intentionally NOT applied here — callers apply sort after grouping
 * so that nextDeparture remains the invariant chronological next departure.
 *
 * @param filterDateStr  'yyyy-MM-dd' — used to build departure DateTime.
 */
export function groupSchedules(
  list: Schedule[],
  filterDateStr?: string,
): GroupedSchedules {
  const now = new Date()
  const referenceDate = filterDateStr
    ? new Date(filterDateStr + 'T00:00:00')
    : new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const cancelled = list.filter(isCancelledSchedule)

  const active = list
    .filter(
      (s) =>
        !isCancelledSchedule(s) &&
        minutesUntilFromNow(s, now, referenceDate) > 0,
    )
    .sort((a, b) =>
      minutesUntilFromNow(a, now, referenceDate) -
      minutesUntilFromNow(b, now, referenceDate),
    )

  const [nextDeparture = null, ...rest] = active

  const urgent = rest.filter((s) => minutesUntilFromNow(s, now, referenceDate) <= 30)
  const later = rest.filter((s) => minutesUntilFromNow(s, now, referenceDate) > 30)

  return { nextDeparture, urgent, later, cancelled }
}
