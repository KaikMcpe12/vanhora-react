import { Ban, CheckCircle2, Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ListStatsProps {
  activeCount: number
  cancelledCount: number
  averageRating: number | null
  className?: string
}

function StatRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <span className="text-[13px] text-muted-foreground leading-tight">
        {children}
      </span>
    </div>
  )
}

export function ListStats({
  activeCount,
  cancelledCount,
  averageRating,
  className,
}: ListStatsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Resumo
      </span>

      <div className="space-y-2">
        <StatRow icon={<CheckCircle2 size={13} strokeWidth={1.75} />}>
          <strong className="font-semibold text-foreground">{activeCount}</strong>{' '}
          {activeCount === 1 ? 'horário ativo' : 'horários ativos'}
        </StatRow>

        {cancelledCount > 0 && (
          <StatRow icon={<Ban size={13} strokeWidth={1.75} />}>
            <strong className="font-semibold text-foreground">{cancelledCount}</strong>{' '}
            {cancelledCount === 1 ? 'cancelado hoje' : 'cancelados hoje'}
          </StatRow>
        )}

        {averageRating !== null && (
          <StatRow icon={<Star size={13} strokeWidth={1.75} />}>
            Avaliação média{' '}
            <strong className="font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </strong>
          </StatRow>
        )}
      </div>
    </div>
  )
}
