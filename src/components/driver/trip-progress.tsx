import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface TripProgressProps {
  progressPct: number
  minutesRemaining: number
  className?: string
}

function formatRemaining(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min restantes`
  if (m === 0) return `${h}h restantes`
  return `${h}h ${m}min restantes`
}

/** Progresso da viagem por tempo linear na janela (sem GPS). */
export function TripProgress({
  progressPct,
  minutesRemaining,
  className,
}: TripProgressProps) {
  const done = progressPct >= 100

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {Math.round(progressPct)}% do trajeto
        </span>
        <span className="text-foreground font-medium">
          {done ? 'Chegando ao destino' : formatRemaining(minutesRemaining)}
        </span>
      </div>
      <Progress
        value={progressPct}
        className="h-2"
        aria-label="Progresso da viagem"
      />
    </div>
  )
}
