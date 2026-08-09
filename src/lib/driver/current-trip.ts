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

/**
 * Deriva a viagem atual a partir do relógio + janela departure→arrival.
 * Sem GPS: progresso é tempo linear na janela. Retorna null se nada está rodando.
 */
export function getCurrentTrip(
  schedules: DriverScheduleEntry[],
  now: Date,
): CurrentTripView | null {
  const nowMin = now.getHours() * 60 + now.getMinutes()

  const candidates = schedules.filter((s) => {
    if (!RUNNING_STATUSES.includes(s.status)) return false
    return (
      toMinutes(s.departureTime) <= nowMin &&
      nowMin <= toMinutes(s.arrivalEstimate)
    )
  })
  if (candidates.length === 0) return null

  // desempate improvável: departureTime mais próximo de now
  const entry = [...candidates].sort(
    (a, b) =>
      Math.abs(nowMin - toMinutes(a.departureTime)) -
      Math.abs(nowMin - toMinutes(b.departureTime)),
  )[0]

  const dep = toMinutes(entry.departureTime)
  const arr = toMinutes(entry.arrivalEstimate)
  const span = Math.max(1, arr - dep)
  const progressPct = Math.min(100, Math.max(0, ((nowMin - dep) / span) * 100))
  const minutesRemaining = Math.max(0, arr - nowMin)

  // nextStopHint fica de fora: o mock não tem paradas com horário e não inventamos posição.
  return { entry, progressPct, minutesRemaining }
}
