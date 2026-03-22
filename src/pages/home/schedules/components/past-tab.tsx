import { Clock } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeletonList } from '@/components/schedule-card-skeleton'
import { Button } from '@/components/ui/button'
import { usePagination } from '@/hooks/use-pagination'
import type { Schedule } from '@/lib/types/schedule'

interface PastTabProps {
  schedules: Schedule[]
}

export function PastTab({ schedules }: PastTabProps) {
  const { currentItems, hasMore, isLoading, loadMore, sentinelRef } =
    usePagination({
      items: schedules,
      itemsPerPage: 12,
      autoLoad: true,
    })

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Nenhum horário já partiu"
        description="Ainda não há horários que já partiram hoje. Confira 'Partindo Agora' para ver as próximas saídas."
        action={{
          label: 'Ver Partindo Agora',
          onClick: () => {
            window.location.hash = '#leaving-now'
          },
        }}
      />
    )
  }

  return (
    <div className="space-y-6">      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {currentItems.map((schedule) => (
          <ScheduleCard key={schedule.id} schedule={schedule} />
        ))}
      </div>
      
      {isLoading && <ScheduleCardSkeletonList count={6} />}
      
      {hasMore && !isLoading && (
        <div className="flex justify-center pt-4">
          <Button
            ref={sentinelRef}
            onClick={loadMore}
            variant="outline"
            size="lg"
            className="min-w-40"
          >
            Carregar Mais Horários
          </Button>
        </div>
      )}
      
      {hasMore && isLoading && (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      )}
      
      {!hasMore && currentItems.length > 0 && (
        <div className="py-6 text-center">
          <p className="text-muted-foreground text-sm">
            Todos os horários foram carregados
          </p>
        </div>
      )}
    </div>
  )
}
