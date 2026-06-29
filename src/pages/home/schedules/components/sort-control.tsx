import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { useDisplayFilters } from '@/hooks/use-display-filters'
import { SORT_OPTIONS, sortKey } from '@/lib/types/filters'
import { cn } from '@/lib/utils'

export function SortControl({ className }: { className?: string }) {
  const { sort, setSort } = useDisplayFilters()
  const [open, setOpen] = useState(false)

  const currentLabel =
    SORT_OPTIONS.find((o) => sortKey(o.sort) === sortKey(sort))?.label ??
    'Mais cedo primeiro'

  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Ordenar por
      </span>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-[var(--radius)] border border-border/70',
            'px-3 py-2 text-[13px] font-medium transition-colors',
            'hover:border-border hover:bg-muted/30',
            open && 'border-border bg-muted/20',
          )}
          aria-expanded={open}
        >
          <span className="flex min-w-0 items-center gap-2">
            <ArrowUpDown
              size={13}
              strokeWidth={1.75}
              className="shrink-0 text-muted-foreground"
            />
            <span className="truncate text-foreground">{currentLabel}</span>
          </span>
          <ChevronDown
            size={13}
            strokeWidth={2}
            className={cn(
              'shrink-0 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>

        {open && (
          <div className="overflow-hidden rounded-[var(--radius)] border border-border/50 bg-card">
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey(opt.sort) === sortKey(sort)
              return (
                <button
                  key={sortKey(opt.sort)}
                  type="button"
                  onClick={() => {
                    setSort(opt.sort)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between px-3 py-2.5 text-[13px] transition-colors',
                    active
                      ? 'bg-[rgba(15,110,86,0.06)] font-medium text-[#0F6E56]'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                  )}
                >
                  {opt.label}
                  {active && <Check size={13} strokeWidth={2.5} />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
