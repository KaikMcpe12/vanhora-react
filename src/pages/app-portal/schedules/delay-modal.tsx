import { DelayForm } from '@/components/delays/delay-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AdminSchedule } from '@/lib/types/admin-schedule'

interface DelayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: AdminSchedule
}

export function DelayModal({ open, onOpenChange, schedule }: DelayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar atraso</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {schedule.routeCode} &bull; {schedule.origin} &rarr;{' '}
            {schedule.destination} &bull; {schedule.departureTime}
          </p>
        </DialogHeader>

        {/* Rota/horário já vêm do contexto → modo quick (tela única). */}
        <DelayForm
          mode="quick"
          context={{
            routeId: schedule.routeCode,
            routeCode: schedule.routeCode,
            routeName: `${schedule.origin} → ${schedule.destination}`,
            scheduleId: schedule.id,
            origin: schedule.origin,
            destination: schedule.destination,
            departureTime: schedule.departureTime,
          }}
          onSubmitted={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
