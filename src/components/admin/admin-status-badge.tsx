import { cn } from '@/lib/utils'

export type StatusBadgeVariant =
  | 'success'
  | 'attention'
  | 'critical'
  | 'neutral'
  | 'info'

interface AdminStatusBadgeProps {
  variant: StatusBadgeVariant
  label: string
  size?: 'sm' | 'md'
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  success:
    'bg-emerald-100/80 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  attention:
    'bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  critical:
    'bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  neutral:
    'bg-muted/60 text-muted-foreground border-border',
  info: 'bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
}

export function AdminStatusBadge({
  variant,
  label,
  size = 'sm',
}: AdminStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        variantClasses[variant],
      )}
    >
      {label}
    </span>
  )
}
