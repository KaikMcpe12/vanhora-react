import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

export interface StatusChipProps {
  tone: StatusTone
  icon: LucideIcon
  label: string
  className?: string
}

const toneClasses: Record<StatusTone, string> = {
  success:
    'border-emerald-200 bg-emerald-100/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning:
    'border-amber-200 bg-amber-100/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  danger:
    'border-red-200 bg-red-100/80 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300',
  info: 'border-blue-200 bg-blue-100/80 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300',
  neutral:
    'border-slate-200 bg-slate-100/80 text-slate-600 dark:border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-300',
}

/**
 * Chip de status: sempre cor + ícone + texto (§6). Flat, rounded-full, sem sombra.
 * Estático — sem motion (§1: motion não é wrapper universal).
 */
export function StatusChip({
  tone,
  icon: Icon,
  label,
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
