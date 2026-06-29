import type { SortMode } from '@/lib/utils/group-schedules'
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
  sortMode: SortMode
  onSortChange: (mode: SortMode) => void
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
  sortMode,
  onSortChange,
  className,
}: SchedulesRailProps) {
  return (
    <div className={cn('space-y-6', className)}>
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
        <SortControl currentMode={sortMode} onSortChange={onSortChange} />
      </div>

      <div className="rounded-[var(--radius)] border border-border/60 bg-card p-4">
        <FilterPanel />
      </div>
    </div>
  )
}
