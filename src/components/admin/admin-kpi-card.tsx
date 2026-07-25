import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

type TrendDirection = 'up' | 'down' | 'neutral'
type KPISeverity = 'default' | 'attention' | 'critical'

interface AdminKPICardProps {
  label: string
  value: string | number
  helper?: string
  trend?: {
    value: string
    direction: TrendDirection
    contextLabel?: string
  }
  severity?: KPISeverity
  onClick?: () => void
}

function getTrendColor(
  direction: TrendDirection,
  severity: KPISeverity,
): string {
  if (direction === 'neutral') {
    return 'text-muted-foreground'
  }
  if (direction === 'up') {
    if (severity === 'default') {
      return 'text-emerald-700 dark:text-emerald-300'
    }
    return 'text-amber-700 dark:text-amber-300'
  }
  // down
  if (severity === 'default') {
    return 'text-red-700 dark:text-red-300'
  }
  return 'text-emerald-700 dark:text-emerald-300'
}

export function AdminKPICard({
  label,
  value,
  helper,
  trend,
  severity = 'default',
  onClick,
}: AdminKPICardProps) {
  const trendColor = trend ? getTrendColor(trend.direction, severity) : ''

  return (
    <article
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card p-5 transition-colors duration-150',
        onClick &&
          'cursor-pointer hover:border-border/80 hover:bg-accent/20',
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-[32px] font-medium leading-none tracking-tight text-foreground">
        {value}
      </p>

      {trend ? (
        <div
          className={cn(
            'mt-2.5 flex items-center gap-1 text-[12px] font-medium',
            trendColor,
          )}
        >
          {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
          {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
          <span>{trend.value}</span>
          {trend.contextLabel && (
            <span className="font-normal text-muted-foreground">
              {trend.contextLabel}
            </span>
          )}
        </div>
      ) : helper ? (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{helper}</p>
      ) : null}
    </article>
  )
}
