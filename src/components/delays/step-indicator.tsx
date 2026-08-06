import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  current: number
  total: number
  labels?: string[]
  className?: string
}

/** Barra de progresso "Passo N de M" para o modo wizard do DelayForm. */
export function StepIndicator({
  current,
  total,
  labels,
  className,
}: StepIndicatorProps) {
  const label = labels?.[current - 1]

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Passo {current} de {total}
          {label ? ` · ${label}` : ''}
        </span>
        <span className="text-muted-foreground text-xs">
          {Math.round((current / total) * 100)}%
        </span>
      </div>
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < current ? 'bg-primary' : 'bg-muted',
            )}
          />
        ))}
      </div>
    </div>
  )
}
