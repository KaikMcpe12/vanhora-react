import { PauseCircle, PlayCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

import { AdminConfirmDialog } from '@/components/admin'
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

export type StatusVariant = 'suspend' | 'cancel' | 'reactivate'

interface ScheduleStatusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: AdminSchedule
  variant: StatusVariant
}

const VARIANT_META: Record<
  Exclude<StatusVariant, 'cancel'>,
  {
    title: string
    description: string
    buttonLabel: string
    buttonClass: string
    icon: typeof PauseCircle
    showReason: boolean
  }
> = {
  suspend: {
    title: 'Suspender horário',
    description:
      'Todas as ocorrências futuras deste horário serão suspensas. O horário pode ser reativado posteriormente.',
    buttonLabel: 'Suspender',
    buttonClass:
      'border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200',
    icon: PauseCircle,
    showReason: true,
  },
  reactivate: {
    title: 'Reativar horário',
    description:
      'O horário voltará ao estado ativo e será incluído na grade operacional.',
    buttonLabel: 'Reativar',
    buttonClass:
      'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    icon: PlayCircle,
    showReason: false,
  },
}

export function ScheduleStatusModal({
  open,
  onOpenChange,
  schedule,
  variant,
}: ScheduleStatusModalProps) {
  const [reason, setReason] = useState('')

  // 'cancel' é ação irreversível → usa AdminConfirmDialog typed (padrão PR9/PR10).
  if (variant === 'cancel') {
    const expected = `${schedule.routeCode} ${schedule.departureTime}`
    return (
      <AdminConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Cancelar horário"
        description={`Esta ação cancela definitivamente o horário ${schedule.departureTime} da rota ${schedule.routeCode} (${schedule.origin} → ${schedule.destination}). A rota continuará com os demais horários ativos.`}
        confirmLabel="Cancelar horário"
        cancelLabel="Voltar"
        variant="danger"
        tone="danger"
        icon={XCircle}
        consequences={[
          'Passageiros com bilhetes futuros precisam ser notificados manualmente.',
          'Motoristas atribuídos serão liberados automaticamente.',
          'A ação é irreversível — para restabelecer, será preciso recriar o horário.',
        ]}
        consequencesTitle="Ação irreversível"
        requireTypedConfirmation={{
          expectedText: expected,
          label: `Digite "${expected}" para confirmar`,
        }}
        onConfirm={() => {
          // TODO: submit to API
        }}
      />
    )
  }

  const meta = VARIANT_META[variant]
  const Icon = meta.icon
  const canSubmit = !meta.showReason || true

  const handleSubmit = () => {
    // TODO: submit to API
    onOpenChange(false)
    setReason('')
  }

  const handleClose = () => {
    onOpenChange(false)
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {meta.title}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            {schedule.routeCode} &bull; {schedule.origin} &rarr;{' '}
            {schedule.destination} &bull; {schedule.departureTime}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-foreground text-sm">{meta.description}</p>

          {meta.showReason && (
            <div className="space-y-1.5">
              <Label htmlFor="status-reason">
                Motivo{' '}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="status-reason"
                placeholder="Descreva o motivo..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Voltar
          </Button>
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={meta.buttonClass}
          >
            {meta.buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
