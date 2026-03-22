import { Calendar } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeletonList } from '@/components/schedule-card-skeleton'
import { Button } from '@/components/ui/button'
import { usePagination } from '@/hooks/use-pagination'
import type { Schedule } from '@/lib/types/schedule'

interface UpcomingTabProps {
  schedules: Schedule[]
}

export function UpcomingTab({ schedules }: UpcomingTabProps) {
  const { currentItems, hasMore, isLoading, loadMore, sentinelRef } =
    usePagination({
      items: schedules,
      itemsPerPage: 12,
      autoLoad: true,
    })

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Nenhum horário próximo"
        description="Todos os horários de hoje já estão em 'Partindo Agora' ou 'Decorridos'. Tente buscar em outra data ou rota."
        action={{
          label: 'Alterar Filtros',
          onClick: () => {
            document
              .querySelector('input[type="date"]')
              ?.scrollIntoView({ behavior: 'smooth' })
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
