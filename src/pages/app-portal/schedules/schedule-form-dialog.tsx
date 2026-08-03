import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TimeField } from '@/components/ui/time-field'
import {
  scheduleFormSchema,
  type ScheduleFormSchemaValues,
} from '@/lib/schemas/schedule-form-schema'
import type { AdminRoute, DayOfWeek } from '@/lib/types/admin-schedule'
import { cn } from '@/lib/utils'

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
  { value: 'dom', label: 'Dom' },
]

export type ScheduleFormMode = 'create' | 'edit' | 'duplicate'

export interface ScheduleFormValues {
  departureTime: string
  activeDays: DayOfWeek[]
  notes: string
}

const TITLES: Record<ScheduleFormMode, string> = {
  create: 'Novo horário',
  edit: 'Editar horário',
  duplicate: 'Duplicar horário',
}

interface ScheduleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: ScheduleFormMode
  routes: AdminRoute[]
  /** Locked route for edit/duplicate. When absent (create), the route is selectable. */
  routeId?: string
  initialValues?: ScheduleFormValues
  onSubmit: (routeId: string, values: ScheduleFormValues, mode: ScheduleFormMode) => void
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  mode,
  routes,
  routeId,
  initialValues,
  onSubmit,
}: ScheduleFormDialogProps) {
  const isRouteLocked = mode !== 'create'

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<ScheduleFormSchemaValues>({
    resolver: zodResolver(scheduleFormSchema),
    mode: 'onChange',
    defaultValues: { routeId: '', departureTime: '', activeDays: [], notes: '' },
  })

  // Reset the form each time it opens (covers programmatic opens).
  useEffect(() => {
    if (!open) return
    reset({
      routeId: routeId ?? routes[0]?.id ?? '',
      departureTime: initialValues?.departureTime ?? '',
      activeDays: initialValues?.activeDays ?? [],
      notes: initialValues?.notes ?? '',
    })
  }, [open, mode, routeId, initialValues, routes, reset])

  const selectedRouteId = watch('routeId')
  const lockedRoute = useMemo(
    () => routes.find((r) => r.id === (routeId ?? selectedRouteId)),
    [routes, routeId, selectedRouteId],
  )

  const submit = handleSubmit((values) => {
    onSubmit(
      values.routeId,
      {
        departureTime: values.departureTime,
        activeDays: values.activeDays,
        notes: values.notes.trim(),
      },
      mode,
    )
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">{TITLES[mode]}</DialogTitle>
          {isRouteLocked && lockedRoute && (
            <p className="text-muted-foreground text-sm">
              {lockedRoute.code} &bull; {lockedRoute.origin} &rarr; {lockedRoute.destination}{' '}
              &bull; {lockedRoute.cooperativeName}
            </p>
          )}
        </DialogHeader>

        <form id="schedule-form" onSubmit={submit} className="space-y-4 py-2">
          {/* Route — selectable on create, read-only context otherwise */}
          {!isRouteLocked && (
            <div className="space-y-1.5">
              <Label className="text-[13px]">Rota *</Label>
              <Controller
                name="routeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="text-sm" aria-invalid={!!errors.routeId}>
                      <SelectValue placeholder="Selecione a rota" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.code} — {r.origin} → {r.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.routeId && (
                <p className="text-xs text-destructive">{errors.routeId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="schedule-time" className="text-[13px]">
              Horário de saída *
            </Label>
            <Controller
              name="departureTime"
              control={control}
              render={({ field }) => (
                <TimeField
                  id="schedule-time"
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.departureTime}
                />
              )}
            />
            {errors.departureTime && (
              <p className="text-xs text-destructive">{errors.departureTime.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px]">Dias de operação *</Label>
            <Controller
              name="activeDays"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day) => {
                    const active = field.value.includes(day.value)
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            active
                              ? field.value.filter((d) => d !== day.value)
                              : [...field.value, day.value],
                          )
                        }
                        className={cn(
                          'h-8 min-w-[42px] rounded-full border px-2 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input text-muted-foreground hover:bg-accent',
                        )}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.activeDays && (
              <p className="text-xs text-destructive">{errors.activeDays.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="schedule-notes" className="text-[13px]">
              Observações
            </Label>
            <Textarea
              id="schedule-notes"
              {...register('notes')}
              placeholder="Ex: parada rápida no Centro..."
              className="min-h-[70px] resize-none text-sm"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="schedule-form" size="sm" disabled={!isValid}>
            {mode === 'edit' ? 'Salvar' : 'Criar horário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
