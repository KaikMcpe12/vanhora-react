import { format } from 'date-fns'
import { CalendarClock } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeleton } from '@/components/schedule-card-skeleton'
import { useFavorites } from '@/hooks/use-favorites'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'
import { useSchedules } from '@/hooks/use-schedules'

export function FavoritesUpcomingTab() {
  const { favoriteIds } = useFavorites()
  const { filtersFromUrl } = useScheduleFilters()

  // Após "Partindo Agora" (60 min depois)
  const now = new Date()
  const departureAfter = format(
    new Date(now.getTime() + 60 * 60 * 1000),
    'HH:mm',
  )

  const { schedules, isLoading, isFetchingNextPage, hasNextPage, sentinelRef } =
    useSchedules(
      {
        ids: favoriteIds,
        departureAfter,
        // Ignora filtro de data - mostra todos os próximos
        origin: filtersFromUrl.origin,
        destination: filtersFromUrl.destination,
        cooperative: filtersFromUrl.cooperative,
        priceMin: filtersFromUrl.priceMin,
        priceMax: filtersFromUrl.priceMax,
        rating: filtersFromUrl.minRating,
      },
      { limit: 12 },
    )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ScheduleCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Nenhum horário próximo"
        description="Seus favoritos não têm horários programados para o futuro"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {schedules.map((schedule, index) => (
        <div
          key={schedule.id}
          ref={index === schedules.length - 3 ? sentinelRef : null}
        >
          <ScheduleCard schedule={schedule} />
        </div>
      ))}
      {isFetchingNextPage && <ScheduleCardSkeleton />}
      {hasNextPage && !isFetchingNextPage && (
        <div ref={sentinelRef} className="h-1" />
      )}
    </div>
  )
}
