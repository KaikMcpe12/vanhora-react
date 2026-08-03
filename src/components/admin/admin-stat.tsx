import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type AdminStatTone = 'default' | 'success' | 'attention' | 'critical'

const toneStyles: Record<AdminStatTone, { border: string; chip: string }> = {
  default: { border: 'border-l-primary', chip: 'bg-primary/10 text-primary' },
  success: {
    border: 'border-l-emerald-500',
    chip: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  attention: {
    border: 'border-l-amber-500',
    chip: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  },
  critical: {
    border: 'border-l-red-500',
    chip: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  },
}

interface AdminStatProps {
  label: string
  value: string | number
  icon?: LucideIcon
  tone?: AdminStatTone
  className?: string
}

/**
 * Compact KPI card — icon chip + value + label with a colored left accent.
 * Used inside detail tabs where the full `AdminKPICard` would be too large.
 */
export function AdminStat({
  label,
  value,
  icon: Icon,
  tone = 'default',
  className,
}: AdminStatProps) {
  const styles = toneStyles[tone]
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-3 rounded-xl border border-l-4 border-border bg-card px-4 py-3',
        styles.border,
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            styles.chip,
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[22px] font-semibold leading-none text-foreground">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}
