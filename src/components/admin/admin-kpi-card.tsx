import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

type TrendDirection = 'up' | 'down' | 'neutral'
type KPISeverity = 'default' | 'attention' | 'critical'

const severityChip: Record<KPISeverity, string> = {
  default: 'bg-primary/10 text-primary',
  attention:
    'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  critical: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300',
}

interface AdminKPICardProps {
  label: string
  value: string | number
  helper?: string
  icon?: LucideIcon
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
  icon: Icon,
  trend,
  severity = 'default',
  onClick,
}: AdminKPICardProps) {
  const trendColor = trend ? getTrendColor(trend.direction, severity) : ''

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-[11px] font-medium tracking-[0.6px] uppercase">
          {label}
        </p>
        {Icon && (
          <span
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              severityChip[severity],
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>

      <p className="text-foreground mt-2 text-[32px] leading-none font-medium tracking-tight">
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
            <span className="text-muted-foreground font-normal">
              {trend.contextLabel}
            </span>
          )}
        </div>
      ) : helper ? (
        <p className="text-muted-foreground mt-1.5 text-[12px]">{helper}</p>
      ) : null}
    </>
  )

  const baseClasses =
    'block w-full rounded-xl border border-border bg-card p-5 text-left transition-colors duration-150'

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          baseClasses,
          'focus-visible:ring-ring/50 hover:border-border/80 hover:bg-accent/20 cursor-pointer focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        {content}
      </button>
    )
  }

  return <article className={baseClasses}>{content}</article>
}
