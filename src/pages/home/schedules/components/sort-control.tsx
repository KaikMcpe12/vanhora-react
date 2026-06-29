import { ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import type { SortMode } from '@/lib/utils/group-schedules'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'earliest', label: 'Mais cedo primeiro' },
  { mode: 'cheapest', label: 'Mais barato primeiro' },
  { mode: 'highest_rated', label: 'Melhor avaliado' },
]

interface SortControlProps {
  currentMode: SortMode
  onSortChange: (mode: SortMode) => void
  className?: string
}

export function SortControl({
  currentMode,
  onSortChange,
  className,
}: SortControlProps) {
  const [open, setOpen] = useState(false)
  const currentLabel =
    SORT_OPTIONS.find((o) => o.mode === currentMode)?.label ?? 'Mais cedo primeiro'

  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Ordenar por
      </span>

      <div className="space-y-1">
        {/* trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-[var(--radius)] border border-border/70',
            'px-3 py-2 text-[13px] font-medium transition-colors',
            'hover:border-border hover:bg-muted/30',
            open && 'bg-muted/20 border-border',
          )}
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <ArrowUpDown size={13} strokeWidth={1.75} className="text-muted-foreground shrink-0" />
            <span className="text-foreground truncate">{currentLabel}</span>
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

        {/* inline options */}
        {open && (
          <div className="rounded-[var(--radius)] border border-border/50 bg-card overflow-hidden">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  onSortChange(opt.mode)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between px-3 py-2.5',
                  'text-[13px] transition-colors',
                  currentMode === opt.mode
                    ? 'font-medium text-[#0F6E56] bg-[rgba(15,110,86,0.06)]'
                    : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                )}
              >
                {opt.label}
                {currentMode === opt.mode && (
                  <Check size={13} strokeWidth={2.5} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
