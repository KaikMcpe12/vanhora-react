import { Clock, Plus, XCircle } from 'lucide-react'
import { useState } from 'react'

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
import { cn } from '@/lib/utils'

type ExceptionMode = 'cancel' | 'rescheduled' | 'temporary'

export interface RouteExceptionContext {
  code: string
  origin: string
  destination: string
}

interface ExceptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // schedule context: full mode selector (cancel / rescheduled / temporary)
  schedule?: AdminSchedule
  // route context: opens directly in 'temporary' mode, no mode selector
  routeContext?: RouteExceptionContext
  // pre-select a mode when schedule is provided (default: 'cancel')
  defaultMode?: ExceptionMode
}

const MODES: {
  value: ExceptionMode
  icon: typeof XCircle
  title: string
  description: string
}[] = [
  {
    value: 'cancel',
    icon: XCircle,
    title: 'Cancelar nesta data',
    description: 'Horario nao sai nesse dia',
  },
  {
    value: 'rescheduled',
    icon: Clock,
    title: 'Reagendar nesta data',
    description: 'Sai em outro horario nesse dia',
  },
  {
    value: 'temporary',
    icon: Plus,
    title: 'Criar servico extra',
    description: 'Novo horario que nao existe na grade',
  },
]

export function ExceptionModal({
  open,
  onOpenChange,
  schedule,
  routeContext,
  defaultMode = 'cancel',
}: ExceptionModalProps) {
  const isRouteLevel = Boolean(routeContext)
  const [mode, setMode] = useState<ExceptionMode>(isRouteLevel ? 'temporary' : defaultMode)
  const [date, setDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')

  const requiresTime = mode === 'rescheduled' || mode === 'temporary'
  const canSubmit = date.length > 0 && (!requiresTime || newTime.length > 0)

  const handleSubmit = () => {
    if (!canSubmit) return
    // TODO: submit to API
    // route-level / mode 'temporary' → schedules_temporary (route_id)
    // mode 'cancel'/'rescheduled' → schedules_exceptions (schedule_id = schedule.id)
    onOpenChange(false)
    reset()
  }

  const reset = () => {
    setMode(isRouteLevel ? 'temporary' : defaultMode)
    setDate('')
    setNewTime('')
    setReason('')
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  // header context line
  const contextLine = routeContext
    ? `Rota ${routeContext.code} • ${routeContext.origin} → ${routeContext.destination}`
    : schedule
      ? `${schedule.routeCode} • ${schedule.origin} → ${schedule.destination} • ${schedule.departureTime}`
      : ''

  const title = isRouteLevel ? 'Criar servico extra' : 'Adicionar excecao'

  const submitLabel =
    mode === 'cancel'
      ? 'Cancelar nesta data'
      : mode === 'rescheduled'
        ? 'Reagendar'
        : 'Criar servico extra'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {contextLine && (
            <p className="text-muted-foreground text-sm">{contextLine}</p>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* mode selector — only when called from schedule level */}
          {!isRouteLevel && (
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(({ value, icon: Icon, title: modeTitle, description }) => {
                const active = mode === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={cn(
                      'flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors',
                      active ? 'border-[#0873df] bg-blue-50' : 'border-border hover:bg-slate-50',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        active ? 'text-[#0873df]' : 'text-muted-foreground',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[11px] font-semibold leading-tight',
                        active ? 'text-[#0873df]' : 'text-foreground',
                      )}
                    >
                      {modeTitle}
                    </span>
                    <span className="text-muted-foreground text-[10px] leading-tight">
                      {description}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* date */}
          <div className="space-y-1.5">
            <Label htmlFor="exception-date">Data</Label>
            <input
              id="exception-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
            />
          </div>

          {/* time — shown for rescheduled and temporary */}
          {requiresTime && (
            <div className="space-y-1.5">
              <Label htmlFor="exception-time">
                {mode === 'rescheduled' ? 'Novo horario' : 'Horario do servico'}
              </Label>
              <input
                id="exception-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              />
            </div>
          )}

          {/* reason */}
          <div className="space-y-1.5">
            <Label htmlFor="exception-reason">
              Motivo <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Textarea
              id="exception-reason"
              placeholder="Descreva o motivo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[72px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
