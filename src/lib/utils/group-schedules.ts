import type { Schedule } from '@/lib/types/schedule'

export interface GroupedSchedules {
  nextDeparture: Schedule | null
  urgent: Schedule[]   // active, 1–30 min
  later: Schedule[]    // active, >30 min
  cancelled: Schedule[]
}

export type SortMode = 'earliest' | 'cheapest' | 'highest_rated'

function isCancelledSchedule(s: Schedule): boolean {
  return s.badge === 'cancelled'
}

/**
 * Combina a data de referência do filtro com o departure_time "HH:mm" do
 * schedule para calcular corretamente quantos minutos faltam.
 * Sem isso, filtrar por "amanhã" produziria minutesUntil negativos porque
 * `new Date()` seria hoje, não amanhã.
 */
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

function byDeparture(
  a: Schedule,
  b: Schedule,
  now: Date,
  ref: Date,
): number {
  return minutesUntilFromNow(a, now, ref) - minutesUntilFromNow(b, now, ref)
}

function byPrice(a: Schedule, b: Schedule) {
  return a.price - b.price
}

function byRating(a: Schedule, b: Schedule) {
  return (b.cooperativeRating ?? 0) - (a.cooperativeRating ?? 0)
}

/**
 * @param filterDateStr  Data do filtro no formato 'yyyy-MM-dd'.
 *                       Quando ausente, usa a data atual.
 */
export function groupSchedules(
  list: Schedule[],
  sortMode: SortMode = 'earliest',
  filterDateStr?: string,
): GroupedSchedules {
  const now = new Date()

  // Constrói a data de referência a partir do filtro.
  // Mantém apenas a parte da data (sem hora) para combinar com HH:mm.
  const referenceDate = filterDateStr
    ? new Date(filterDateStr + 'T00:00:00')
    : new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const cancelled = list.filter(isCancelledSchedule)

  // Strictly future: minutesUntil > 0 exclui saídas marginalmente no passado
  // que poderiam flipar para negativo no próximo tick do RelativeTimeDisplay.
  const active = list
    .filter(
      (s) =>
        !isCancelledSchedule(s) &&
        minutesUntilFromNow(s, now, referenceDate) > 0,
    )
    .sort((a, b) => byDeparture(a, b, now, referenceDate))

  const [nextDeparture = null, ...rest] = active

  const urgent = rest.filter(
    (s) => minutesUntilFromNow(s, now, referenceDate) <= 30,
  )

  const laterRaw = rest.filter(
    (s) => minutesUntilFromNow(s, now, referenceDate) > 30,
  )
  const sorter =
    sortMode === 'cheapest'
      ? byPrice
      : sortMode === 'highest_rated'
        ? byRating
        : (a: Schedule, b: Schedule) => byDeparture(a, b, now, referenceDate)
  const later = [...laterRaw].sort(sorter)

  return { nextDeparture, urgent, later, cancelled }
}
