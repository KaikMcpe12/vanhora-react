import { ScheduleCard } from '@/components/schedule-card'
import type { Schedule } from '@/lib/types/schedule'

import { ScheduleSection } from '../../components/schedule-section'

function groupFavoritesByTime(schedules: Schedule[]) {
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const urgent: Schedule[] = []
  const later: Schedule[] = []
  const past: Schedule[] = []
  const cancelled: Schedule[] = []

  schedules.forEach((s) => {
    if (s.badge === 'cancelled') {
      cancelled.push(s)
      return
    }
    const [h, m] = s.departureTime.split(':').map(Number)
    const diff = h * 60 + m - nowMinutes
    if (diff < 0) past.push(s)
    else if (diff <= 60) urgent.push(s)
    else later.push(s)
  })

  return { urgent, later, past, cancelled }
}

type FavoritesFeedProps = {
  schedules: Schedule[]
}

export function FavoritesFeed({ schedules }: FavoritesFeedProps) {
  const { urgent, later, past, cancelled } = groupFavoritesByTime(schedules)

  const hasAny = urgent.length + later.length + past.length + cancelled.length > 0

  if (!hasAny) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Nenhum favorito corresponde aos filtros selecionados.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {urgent.length > 0 && (
        <ScheduleSection title="Partindo agora" badge="agora" count={urgent.length} variant="featured">
          {urgent.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </ScheduleSection>
      )}

      {later.length > 0 && (
        <ScheduleSection title="Mais tarde hoje" count={later.length} variant="grid">
          {later.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </ScheduleSection>
      )}

      {past.length > 0 && (
        <ScheduleSection title="Já saiu hoje" count={past.length} variant="muted">
          {past.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </ScheduleSection>
      )}

      {cancelled.length > 0 && (
        <ScheduleSection title="Cancelados hoje" count={cancelled.length} variant="muted">
          {cancelled.map((s) => (
            <ScheduleCard key={s.id} schedule={s} />
          ))}
        </ScheduleSection>
      )}
    </div>
  )
}
