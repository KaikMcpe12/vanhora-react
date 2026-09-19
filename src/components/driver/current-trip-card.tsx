import { CircleDot } from 'lucide-react'
import { motion } from 'motion/react'

import { StatusChip } from '@/components/status-chip'
import type { CurrentTripView } from '@/lib/driver/current-trip'
import { cn } from '@/lib/utils'

import { QuickActions } from './quick-actions'
import { TripProgress } from './trip-progress'

interface CurrentTripCardProps {
  trip: CurrentTripView
  onReportDelay: () => void
  onViewDetails: () => void
  className?: string
}

function TripInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  )
}

/**
 * "Cabine de comando" da viagem em andamento (Pencil X06DC). Flat, destaque por
 * `border-l-4` verde. Sem mapa, sem passageiros. Entrada animada (Motion).
 */
export function CurrentTripCard({
  trip,
  onReportDelay,
  onViewDetails,
  className,
}: CurrentTripCardProps) {
  const { entry, progressPct, nextStopHint, minutesRemaining } = trip

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-card space-y-5 rounded-xl border border-l-4 border-l-emerald-500 p-5 sm:p-6',
        className,
      )}
    >
      <StatusChip tone="success" icon={CircleDot} label="Em andamento" />

      <div className="space-y-1">
        <h2 className="text-foreground text-2xl font-bold sm:text-3xl">
          {entry.routeCode} → {entry.destination}
        </h2>
        <p className="text-muted-foreground text-sm">{entry.routeName}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 max-[380px]:grid-cols-1">
        <TripInfo label="Saída" value={entry.departureTime} />
        <TripInfo label="Próxima parada" value={nextStopHint ?? '—'} />
        <TripInfo label="Previsão chegada" value={entry.arrivalEstimate} />
      </div>

      <TripProgress
        progressPct={progressPct}
        minutesRemaining={minutesRemaining}
      />

      <QuickActions
        onReportDelay={onReportDelay}
        onViewDetails={onViewDetails}
      />
    </motion.section>
  )
}
