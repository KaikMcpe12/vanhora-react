import type { LucideIcon } from 'lucide-react'

import { EmptyState } from '@/components/empty-state'
import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeleton } from '@/components/schedule-card-skeleton'
import type { UseSchedulesReturn } from '@/hooks/use-schedules'

interface EmptyStateConfig {
  icon: LucideIcon
  title: string
  description: string
  action: {
    label: string
    onClick: () => void
  }
}

interface ScheduleTabContentProps {
  data: UseSchedulesReturn
  emptyState: EmptyStateConfig
}

export function ScheduleTabContent({
  data,
  emptyState,
}: ScheduleTabContentProps) {
  const { schedules, isLoading, isFetchingNextPage, hasNextPage, sentinelRef } =
    data

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ScheduleCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <EmptyState
        icon={emptyState.icon}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {schedules.map((schedule, index) => (
          <div
            key={schedule.id}
            ref={index === schedules.length - 3 ? sentinelRef : null}
          >
            <ScheduleCard schedule={schedule} />
          </div>
        ))}
      </div>

      {isFetchingNextPage && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <ScheduleCardSkeleton />
        </div>
      )}

      {hasNextPage && !isFetchingNextPage && (
        <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
      )}

      {!hasNextPage && schedules.length > 0 && (
        <div className="py-6 text-center">
          <p className="text-muted-foreground text-sm">
            Todos os horários foram carregados
          </p>
        </div>
      )}
    </div>
  )
}
