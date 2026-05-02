import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AdminSchedule } from '@/lib/types/admin-schedule'

interface DelayModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: AdminSchedule
}

function getSeverity(minutes: number): {
  label: string
  className: string
  icon: typeof CheckCircle2
} {
  if (minutes < 15)
    return {
      label: 'Baixo (< 15 min)',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: CheckCircle2,
    }
  if (minutes <= 30)
    return {
      label: 'Medio (15–30 min)',
      className: 'border-amber-300 bg-amber-50 text-amber-800',
      icon: AlertCircle,
    }
  return {
    label: 'Alto (> 30 min)',
    className: 'border-red-200 bg-red-50 text-red-700',
    icon: XCircle,
  }
}

export function DelayModal({ open, onOpenChange, schedule }: DelayModalProps) {
  const [minutes, setMinutes] = useState('')
  const [reason, setReason] = useState('')

  const minutesNum = parseInt(minutes, 10)
  const hasMinutes = !isNaN(minutesNum) && minutesNum >= 1
  const severity = hasMinutes ? getSeverity(minutesNum) : null
  const canSubmit = hasMinutes && reason.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    // TODO: submit to API
    onOpenChange(false)
    setMinutes('')
    setReason('')
  }

  const handleClose = () => {
    onOpenChange(false)
    setMinutes('')
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar atraso</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {schedule.routeCode} &bull; {schedule.origin} &rarr; {schedule.destination} &bull;{' '}
            {schedule.departureTime}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="delay-minutes">Minutos de atraso</Label>
            <div className="flex items-center gap-3">
              <input
                id="delay-minutes"
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="ex: 20"
                className="border-input bg-background focus-visible:ring-ring h-9 w-28 rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              />
              {severity && (
                <Badge
                  variant="outline"
                  className={`gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${severity.className}`}
                >
                  <severity.icon className="h-3 w-3" />
                  {severity.label}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delay-reason">Motivo</Label>
            <Textarea
              id="delay-reason"
              placeholder="Descreva o motivo do atraso..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
          >
            Registrar atraso
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
