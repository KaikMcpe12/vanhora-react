import { User } from 'lucide-react'
import { motion } from 'motion/react'

import { StatusChip } from '@/components/status-chip'
import { Progress } from '@/components/ui/progress'
import type {
  CoopOperation,
  CoopOperationView,
} from '@/lib/data/mock-cooperative-operations'
import { SCHEDULE_STATUS_META } from '@/lib/status/status-meta'
import { cn } from '@/lib/utils'

interface OperationsBoardProps {
  operations: CoopOperationView[]
  nextDeparture?: CoopOperation
}

const ACCENT: Record<CoopOperation['operationalStatus'], string> = {
  delayed: 'border-l-amber-500',
  cancelled: 'border-l-red-500',
  suspended: 'border-l-red-500',
  in_operation: 'border-l-emerald-500',
}

function OperationCard({ op }: { op: CoopOperationView }) {
  const running =
    op.operationalStatus === 'in_operation' ||
    op.operationalStatus === 'delayed'

  return (
    <div
      className={cn(
        'bg-card space-y-3 rounded-lg border border-l-4 p-4',
        ACCENT[op.operationalStatus],
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-foreground text-base font-semibold">
          {op.routeCode}
        </span>
        <StatusChip {...SCHEDULE_STATUS_META[op.operationalStatus]} />
      </div>

      <p className="text-muted-foreground text-sm">
        {op.origin} → {op.destination}
      </p>

      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <span className="tabular-nums">
          {op.departureTime} → {op.arrivalEstimate}
        </span>
        {op.driverName && (
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" />
            {op.driverName}
          </span>
        )}
      </div>

      {running && (
        <div className="space-y-1">
          <Progress value={op.progressPct} className="h-1.5" />
          <p className="text-muted-foreground text-[11px]">
            {op.progressPct >= 100
              ? 'Chegando ao destino'
              : `${op.minutesRemaining} min restantes`}
          </p>
        </div>
      )}
    </div>
  )
}

/** Bloco "Agora": operações na janela do relógio, ordenadas por urgência. */
export function OperationsBoard({
  operations,
  nextDeparture,
}: OperationsBoardProps) {
  if (!operations.length) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center">
        <p className="text-foreground text-sm font-medium">
          Nenhuma operação neste momento
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          {nextDeparture
            ? `Próxima saída às ${nextDeparture.departureTime} · ${nextDeparture.routeCode} → ${nextDeparture.destination}`
            : 'Sem próximas saídas hoje.'}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {operations.map((op) => (
        <OperationCard key={op.id} op={op} />
      ))}
    </motion.div>
  )
}
