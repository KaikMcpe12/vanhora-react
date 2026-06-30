import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil } from 'lucide-react'

import { getCityNameById } from '@/lib/data/mock-cities'
import { cn } from '@/lib/utils'

interface ContextSummaryProps {
  origin?: string       // city ID (e.g., "1")
  destination?: string  // city ID (e.g., "2"), or empty = any destination
  date?: string         // 'yyyy-MM-dd'
  accentColor?: string
  onEdit: () => void
  className?: string
}

function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return 'hoje'
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return `hoje, ${format(d, "d MMM", { locale: ptBR })}`
  if (isTomorrow(d)) return `amanhã, ${format(d, "d MMM", { locale: ptBR })}`
  return format(d, "EEE',' d MMM", { locale: ptBR })
}

export function ContextSummary({
  origin,
  destination,
  date,
  accentColor,
  onEdit,
  className,
}: ContextSummaryProps) {
  const color = accentColor ?? 'var(--color-primary)'
  const hasOrigin = Boolean(origin)

  const originName = origin ? getCityNameById(origin) : ''
  const destinationName = destination ? getCityNameById(destination) : ''

  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Você está vendo
      </span>

      {hasOrigin ? (
        <div className="flex items-start gap-3">
          {/* mini-timeline vertical */}
          <div className="flex flex-col items-center pt-1">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div
              className="my-1 w-px flex-1"
              style={{ minHeight: 24, backgroundColor: color, opacity: 0.35 }}
            />
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color, opacity: destination ? 1 : 0.35 }}
            />
          </div>

          {/* cidades */}
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
                De
              </span>
              <span className="block truncate text-[13px] font-medium leading-tight text-foreground">
                {originName}
              </span>
            </div>
            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
                Para
              </span>
              {destinationName ? (
                <span className="block truncate text-[13px] font-medium leading-tight text-foreground">
                  {destinationName}
                </span>
              ) : (
                <span className="block truncate text-[12px] italic leading-tight text-muted-foreground">
                  qualquer destino
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[13px] italic text-muted-foreground">
          Nenhuma rota selecionada
        </p>
      )}

      {/* data + link editar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-muted-foreground">
          {formatDateLabel(date)}
        </span>
        <button
          type="button"
          onClick={onEdit}
          className="flex shrink-0 cursor-pointer items-center gap-1 text-[11px] font-medium text-primary transition-opacity hover:opacity-70"
          aria-label="Alterar busca"
        >
          <Pencil size={10} strokeWidth={1.75} aria-hidden />
          alterar
        </button>
      </div>
    </div>
  )
}
