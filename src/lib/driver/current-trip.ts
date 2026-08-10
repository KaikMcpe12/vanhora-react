import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'

export interface CurrentTripView {
  entry: DriverScheduleEntry
  /** 0–100 — % do tempo decorrido na janela (linear, sem GPS) */
  progressPct: number
  /** derivado por tempo (não por posição); omitido quando não há paradas com horário */
  nextStopHint?: string
  minutesRemaining: number
}

/** viagem "em andamento" = janela contém `now` E está de fato rodando */
const RUNNING_STATUSES: DriverScheduleEntry['status'][] = ['on_time', 'delayed']

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** true se `now` está dentro da janela departure→arrival. */
export function isTripActive(
  departureTime: string,
  arrivalEstimate: string,
  now: Date,
): boolean {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return (
    toMinutes(departureTime) <= nowMin && nowMin <= toMinutes(arrivalEstimate)
  )
}

/**
 * Progresso linear por tempo na janela departure→arrival (sem GPS).
 * Reusado pelo painel operacional da cooperativa (PR5).
 */
export function tripProgress(
  departureTime: string,
  arrivalEstimate: string,
  now: Date,
): { progressPct: number; minutesRemaining: number } {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const dep = toMinutes(departureTime)
  const arr = toMinutes(arrivalEstimate)
  const span = Math.max(1, arr - dep)
  const progressPct = Math.min(100, Math.max(0, ((nowMin - dep) / span) * 100))
  const minutesRemaining = Math.max(0, arr - nowMin)
  return { progressPct, minutesRemaining }
}

/**
 * Deriva a viagem atual a partir do relógio + janela. Sem GPS. null se nada roda.
 */
export function getCurrentTrip(
  schedules: DriverScheduleEntry[],
  now: Date,
): CurrentTripView | null {
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const candidates = schedules.filter(
    (s) =>
      RUNNING_STATUSES.includes(s.status) &&
      isTripActive(s.departureTime, s.arrivalEstimate, now),
  )
  if (candidates.length === 0) return null

  // desempate improvável: departureTime mais próximo de now
  const entry = [...candidates].sort(
    (a, b) =>
      Math.abs(nowMin - toMinutes(a.departureTime)) -
      Math.abs(nowMin - toMinutes(b.departureTime)),
  )[0]

  const { progressPct, minutesRemaining } = tripProgress(
    entry.departureTime,
    entry.arrivalEstimate,
    now,
  )

  // nextStopHint fica de fora: o mock não tem paradas com horário e não inventamos posição.
  return { entry, progressPct, minutesRemaining }
}
