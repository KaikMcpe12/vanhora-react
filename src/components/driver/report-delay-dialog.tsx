import { DelayForm } from '@/components/delays/delay-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'

interface ReportDelayDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: DriverScheduleEntry | null
}

/**
 * Atalho da home: abre o DelayForm em modo quick já com a viagem atual no
 * contexto (1 tap → passo de detalhes). Reusa o wizard do PR1 sem tocá-lo.
 */
export function ReportDelayDialog({
  open,
  onOpenChange,
  entry,
}: ReportDelayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar atraso</DialogTitle>
          {entry && (
            <p className="text-muted-foreground text-sm">
              {entry.routeCode} &bull; {entry.origin} &rarr; {entry.destination}{' '}
              &bull; {entry.departureTime}
            </p>
          )}
        </DialogHeader>

        {entry && (
          <DelayForm
            mode="quick"
            context={{
              routeId: entry.routeCode,
              routeCode: entry.routeCode,
              routeName: entry.routeName,
              scheduleId: entry.id,
              origin: entry.origin,
              destination: entry.destination,
              departureTime: entry.departureTime,
            }}
            onSubmitted={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
