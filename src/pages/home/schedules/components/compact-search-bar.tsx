import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CompactSearchBarProps {
  origin?: string
  destination?: string
  date?: string // 'yyyy-MM-dd'
  onEdit: () => void
  className?: string
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'hoje'
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return 'hoje'
  if (isTomorrow(d)) return 'amanhã'
  return format(d, "d MMM", { locale: ptBR })
}

export function CompactSearchBar({
  origin,
  destination,
  date,
  onEdit,
  className,
}: CompactSearchBarProps) {
  const hasRoute = origin || destination
  const dateLabel = formatDate(date)

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border/60 bg-muted/50 px-4 py-3',
        className,
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left"
        aria-label="Editar busca"
      >
        {hasRoute ? (
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="text-[14px] font-medium text-primary leading-tight">
              {origin || 'Qualquer origem'}
            </span>
            <ArrowRight size={12} className="shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-[14px] font-medium text-primary leading-tight">
              {destination || 'Qualquer destino'}
            </span>
            <span className="hidden h-3.5 w-px bg-border/60 sm:block" aria-hidden />
            <span className="text-[12px] text-muted-foreground">{dateLabel}</span>
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground">
            Busque por origem, destino e data
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 cursor-pointer items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Alterar busca"
      >
        <Pencil size={12} strokeWidth={1.75} aria-hidden />
        <span className="hidden sm:inline">alterar</span>
      </button>
    </div>
  )
}
