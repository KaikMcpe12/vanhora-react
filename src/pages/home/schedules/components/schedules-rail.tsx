import type { Schedule } from '@/lib/types/schedule'
import { cn } from '@/lib/utils'

import { ContextSummary } from './context-summary'
import { FilterPanel } from './filter-panel'
import { ListStats } from './list-stats'
import { SortControl } from './sort-control'

interface SchedulesRailProps {
  origin?: string
  destination?: string
  date?: string
  accentColor?: string
  onEditSearch: () => void
  activeCount: number
  cancelledCount: number
  averageRating: number | null
  rawSchedules: Schedule[]
  className?: string
}

export function SchedulesRail({
  origin,
  destination,
  date,
  accentColor,
  onEditSearch,
  activeCount,
  cancelledCount,
  averageRating,
  rawSchedules,
  className,
}: SchedulesRailProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-[var(--radius)] border border-border/60 bg-card p-4">
        <ContextSummary
          origin={origin}
          destination={destination}
          date={date}
          accentColor={accentColor}
          onEdit={onEditSearch}
        />
      </div>

      <div className="rounded-[var(--radius)] border border-border/60 bg-card p-4">
        <ListStats
          activeCount={activeCount}
          cancelledCount={cancelledCount}
          averageRating={averageRating}
        />
      </div>

      <div className="rounded-[var(--radius)] border border-border/60 bg-card p-4">
        <SortControl />
      </div>

      <div className="rounded-[var(--radius)] border border-border/60 bg-card p-4">
        <FilterPanel rawSchedules={rawSchedules} />
      </div>
    </div>
  )
}
