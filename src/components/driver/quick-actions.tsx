import { AlertTriangle, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  onReportDelay: () => void
  onViewDetails: () => void
  className?: string
}

/**
 * Ações da viagem atual. "Reportar Atraso" é o objetivo #1 do brief — botão
 * primário grande. Alvos ≥44×44px (min-h-12 = 48px); empilha no mobile.
 */
export function QuickActions({
  onReportDelay,
  onViewDetails,
  className,
}: QuickActionsProps) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row', className)}>
      <Button
        type="button"
        onClick={onReportDelay}
        className="min-h-12 flex-1 gap-2 text-base"
      >
        <AlertTriangle className="size-5" />
        Reportar Atraso
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onViewDetails}
        className="min-h-12 flex-1 gap-2 text-base"
      >
        Ver Detalhes
        <ChevronRight className="size-5" />
      </Button>
    </div>
  )
}
