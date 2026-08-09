import { Badge } from '@/components/ui/badge'
import {
  type Severity,
  SEVERITY_META,
  severityFromMinutes,
} from '@/lib/delays/severity'
import { cn } from '@/lib/utils'

type SeverityBadgeProps = {
  className?: string
  /** exibe a faixa de minutos ao lado do rótulo (ex.: "Alto · >30 min") */
  showRange?: boolean
} & (
  | { minutes: number; severity?: never }
  | { severity: Severity; minutes?: never }
)

/**
 * Fonte única de exibição de severidade (cor + ícone + texto — §6 do plano).
 * Aceita `minutes` (deriva) OU `severity` diretamente.
 */
export function SeverityBadge(props: SeverityBadgeProps) {
  const severity: Severity =
    props.severity ?? severityFromMinutes(props.minutes ?? 0)
  const meta = SEVERITY_META[severity]
  const Icon = meta.icon

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 font-medium', meta.className, props.className)}
    >
      <Icon className="size-3" />
      {meta.label}
      {props.showRange && (
        <span className="font-normal opacity-70">· {meta.rangeLabel}</span>
      )}
    </Badge>
  )
}
