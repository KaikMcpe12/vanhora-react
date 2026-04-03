import { format } from 'date-fns'
import { History } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeleton } from '@/components/schedule-card-skeleton'
import { useFavorites } from '@/hooks/use-favorites'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'
import { useSchedules } from '@/hooks/use-schedules'

export function FavoritesPastTab() {
  const { favoriteIds } = useFavorites()
  const { watch } = useScheduleFilters()
  const filters = watch()

  const now = new Date()
  const departureBefore = format(now, 'HH:mm')

  const { schedules, isLoading, isFetchingNextPage, hasNextPage, sentinelRef } =
    useSchedules(
      {
        ids: favoriteIds,
        departureBefore,
        // Ignora filtro de data - mostra histórico completo
        origin: filters.origin,
        destination: filters.destination,
        cooperative: filters.cooperative,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        rating: filters.minRating,
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
        icon={History}
        title="Nenhum horário decorrido"
        description="Seus favoritos não têm horários que já passaram"
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
