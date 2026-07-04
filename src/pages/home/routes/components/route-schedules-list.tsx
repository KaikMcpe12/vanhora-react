import { useEffect, useMemo, useState } from 'react'

import { ScheduleCard } from '@/components/schedule-card'
import type { RouteDetail } from '@/lib/data/mock-route-detail'
import { getMockSchedules } from '@/lib/data/mock-schedules'

type DateFilter = 'today' | 'tomorrow'

type RouteSchedulesListProps = {
  route: RouteDetail
}

const PAGE_SIZE = 8

export function RouteSchedulesList({ route }: RouteSchedulesListProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')
  const [shownUpcoming, setShownUpcoming] = useState(PAGE_SIZE)
  const [shownPast, setShownPast] = useState(PAGE_SIZE)

  useEffect(() => {
    setShownUpcoming(PAGE_SIZE)
    setShownPast(PAGE_SIZE)
  }, [dateFilter])

  const allRouteSchedules = useMemo(
    () =>
      getMockSchedules().filter(
        (s) => s.origin === route.origin && s.destination === route.destination,
      ),
    [route.origin, route.destination],
  )

  // For tomorrow: treat all as upcoming (cosmetic — mock doesn't have real date data)
  const schedules = useMemo(() => {
    if (dateFilter === 'tomorrow') {
      return allRouteSchedules.map((s) => ({
        ...s,
        status: 'upcoming' as const,
        badge: 'available' as const,
        exceptionReason: undefined,
      }))
    }
    return allRouteSchedules
  }, [allRouteSchedules, dateFilter])

  const allUpcoming = schedules.filter(
    (s) => s.status === 'upcoming-soon' || s.status === 'upcoming',
  )
  const past = schedules.filter((s) => s.status === 'past')

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const referenceDate = dateFilter === 'tomorrow' ? tomorrow : today

  const datePills: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: 'tomorrow', label: 'Amanhã' },
  ]

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-medium text-foreground">Horários dessa rota</h2>
        <div className="flex gap-1.5">
          {datePills.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setDateFilter(p.key)}
              className={
                dateFilter === p.key
                  ? 'rounded-full bg-foreground px-3 py-1 text-[12px] font-medium text-background'
                  : 'rounded-full border border-border px-3 py-1 text-[12px] text-muted-foreground hover:bg-muted'
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {allUpcoming.length === 0 && past.length === 0 ? (
        <div className="rounded-[14px] border border-border/50 bg-card py-12 text-center">
          <p className="text-[14px] text-muted-foreground">
            Nenhum horário disponível para essa data.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {allUpcoming.length > 0 && (
            <section>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
                Próximos
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {allUpcoming.slice(0, shownUpcoming).map((s) => (
                  <ScheduleCard key={s.id} schedule={s} referenceDate={referenceDate} />
                ))}
              </div>
              {shownUpcoming < allUpcoming.length && (
                <button
                  type="button"
                  onClick={() => setShownUpcoming((n) => n + PAGE_SIZE)}
                  className="mt-3 text-[13px] text-muted-foreground underline-offset-2 hover:underline"
                >
                  Mostrar mais ({allUpcoming.length - shownUpcoming} restantes)
                </button>
              )}
            </section>
          )}

          {past.length > 0 && (
            <section>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
                Já partiram · {past.length} horários
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {past.slice(0, shownPast).map((s) => (
                  <ScheduleCard key={s.id} schedule={s} referenceDate={referenceDate} />
                ))}
              </div>
              {shownPast < past.length && (
                <button
                  type="button"
                  onClick={() => setShownPast((n) => n + PAGE_SIZE)}
                  className="mt-3 text-[13px] text-muted-foreground underline-offset-2 hover:underline"
                >
                  Mostrar mais ({past.length - shownPast} restantes)
                </button>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
