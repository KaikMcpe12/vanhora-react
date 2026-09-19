import {
  AlertCircle,
  CheckCircle2,
  type LucideIcon,
  XCircle,
} from 'lucide-react'

export type Severity = 'low' | 'medium' | 'high'

/** low < 15 min · medium 15–30 min · high > 30 min */
export function severityFromMinutes(min: number): Severity {
  if (min < 15) return 'low'
  if (min <= 30) return 'medium'
  return 'high'
}

export const SEVERITY_META: Record<
  Severity,
  { label: string; rangeLabel: string; icon: LucideIcon; className: string }
> = {
  low: {
    label: 'Baixo',
    rangeLabel: '<15 min',
    icon: CheckCircle2,
    className:
      'border-emerald-200 bg-emerald-100/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  medium: {
    label: 'Médio',
    rangeLabel: '15–30 min',
    icon: AlertCircle,
    className:
      'border-amber-200 bg-amber-100/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  },
  high: {
    label: 'Alto',
    rangeLabel: '>30 min',
    icon: XCircle,
    className:
      'border-red-200 bg-red-100/80 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300',
  },
}
