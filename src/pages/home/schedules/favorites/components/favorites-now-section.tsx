import { format } from 'date-fns'
import { AlertCircle, Clock } from 'lucide-react'

import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeleton } from '@/components/schedule-card-skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFavorites } from '@/hooks/use-favorites'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'
import { useSchedules } from '@/hooks/use-schedules'

export function FavoritesNowSection() {
  const { favoriteIds } = useFavorites()
  const { watch } = useScheduleFilters()
  const filters = watch()

  const today = format(new Date(), 'yyyy-MM-dd')
  const isToday = filters.date === today || !filters.date

  // Janela de 60 min
  const now = new Date()
  const departureAfter = format(now, 'HH:mm')
  const departureBefore = format(
    new Date(now.getTime() + 60 * 60 * 1000),
    'HH:mm',
  )

  const { schedules, isLoading, isFetchingNextPage, hasNextPage, sentinelRef } =
    useSchedules(
      isToday
        ? {
            ids: favoriteIds,
            departureAfter,
            departureBefore,
            date: today,
          }
        : {
            ids: [], // Query vazia se não for hoje
          },
      { limit: 12 },
    )

  // Se não tem favoritos, não renderiza seção
  if (favoriteIds.length === 0) return null

  // Se data !== hoje, mostrar alerta
  if (!isToday) {
    return (
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <Clock className="h-5 w-5" />
          Partindo Agora
        </h2>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Seção indisponível</AlertTitle>
          <AlertDescription>
            "Partindo Agora" mostra apenas horários de hoje. Selecione a data de
            hoje para visualizar esta seção.
          </AlertDescription>
        </Alert>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
        <Clock className="h-5 w-5 text-orange-500" />
        Partindo Agora
        <span className="text-muted-foreground text-sm font-normal">
          (próximos 60 min)
        </span>
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ScheduleCardSkeleton key={i} />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p>Nenhum favorito partindo nos próximos 60 minutos</p>
        </div>
      ) : (
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
      )}
    </section>
  )
}
