import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Pencil, Search } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CompactSearchBarProps {
  origin?: string
  destination?: string
  date?: string // 'yyyy-MM-dd'
  onEdit: () => void
  className?: string
}

function formatDateRelative(dateStr?: string): string {
  if (!dateStr) return 'hoje'
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return `hoje, ${format(d, "d MMM", { locale: ptBR })}`
  if (isTomorrow(d)) return `amanhã, ${format(d, "d MMM", { locale: ptBR })}`
  return format(d, "EEE',' d MMM", { locale: ptBR })
}

export function CompactSearchBar({
  origin,
  destination,
  date,
  onEdit,
  className,
}: CompactSearchBarProps) {
  // Exige AMBAS origem e destino para exibir o estado "busca ativa"
  const hasActiveSearch = Boolean(origin && destination)
  const dateLabel = formatDateRelative(date)

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
        aria-label={hasActiveSearch ? 'Editar busca' : 'Fazer busca'}
      >
        {hasActiveSearch ? (
          <span className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="text-[14px] font-medium text-primary leading-tight truncate">
              {origin}
            </span>
            <ArrowRight size={12} className="shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-[14px] font-medium text-primary leading-tight truncate">
              {destination}
            </span>
            <span className="h-3.5 w-px bg-border/60 shrink-0" aria-hidden />
            <span className="text-[12px] text-muted-foreground shrink-0">{dateLabel}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Search size={13} strokeWidth={1.75} aria-hidden />
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
        <span className="hidden sm:inline">{hasActiveSearch ? 'alterar' : 'buscar'}</span>
      </button>
    </div>
  )
}
