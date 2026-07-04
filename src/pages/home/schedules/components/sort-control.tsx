import { ArrowUpDown } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDisplayFilters } from '@/hooks/use-display-filters'
import { SORT_OPTIONS, sortKey } from '@/lib/types/filters'
import { cn } from '@/lib/utils'

export function SortControl({ className }: { className?: string }) {
  const { sort, setSort } = useDisplayFilters()

  return (
    <div className={cn('space-y-2', className)}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Ordenar por
      </span>
      <Select
        value={sortKey(sort)}
        onValueChange={(v) => {
          const opt = SORT_OPTIONS.find((o) => sortKey(o.sort) === v)
          if (opt) setSort(opt.sort)
        }}
      >
        <SelectTrigger className="h-9 text-[13px]">
          <span className="flex min-w-0 items-center gap-2">
            <ArrowUpDown size={13} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={sortKey(opt.sort)} value={sortKey(opt.sort)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
