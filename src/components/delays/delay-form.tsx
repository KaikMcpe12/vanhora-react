import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Send,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useDriverRoutes,
  useDriverSchedulesToday,
  useReportDelay,
} from '@/lib/api/mock-driver-portal-api'
import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'
import {
  type ReportDelaySchema,
  reportDelaySchema,
} from '@/lib/schemas/report-delay'
import { cn } from '@/lib/utils'

import { ChoiceChips } from './choice-chips'
import { DELAY_CAUSE_OPTIONS } from './delay-causes'
import { MinuteStepper } from './minute-stepper'
import { SelectableCard } from './selectable-card'
import { StepIndicator } from './step-indicator'

// Débito local do PR1: a fonte única `src/lib/delays/severity.ts` nasce no PR2.
type Severity = 'low' | 'medium' | 'high'

function severityFromMinutes(min: number): Severity {
  if (min < 15) return 'low'
  if (min <= 30) return 'medium'
  return 'high'
}

const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  low: {
    label: 'Baixo · < 15 min',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  medium: {
    label: 'Médio · 15–30 min',
    className:
      'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  },
  high: {
    label: 'Alto · > 30 min',
    className:
      'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
  },
}

const SCHEDULE_STATUS_LABEL: Record<DriverScheduleEntry['status'], string> = {
  scheduled: 'Programada',
  on_time: 'No horário',
  delayed: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

export interface DelayFormContext {
  routeId?: string
  routeCode?: string
  routeName?: string
  scheduleId?: string
  cooperativeId?: string
  origin?: string
  destination?: string
  departureTime?: string
}

interface DelayFormProps {
  /** `quick`: tela única (contexto já traz rota/horário). `wizard`: 3 passos. */
  mode: 'quick' | 'wizard'
  context?: DelayFormContext
  onSubmitted?: () => void
  onCancel?: () => void
  className?: string
}

const DEFAULT_MINUTES = 15

export function DelayForm({
  mode,
  context,
  onSubmitted,
  onCancel,
  className,
}: DelayFormProps) {
  const reportDelay = useReportDelay()
  const { data: routes = [], isLoading: routesLoading } = useDriverRoutes()
  const { data: schedules = [] } = useDriverSchedulesToday()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [success, setSuccess] = useState(false)

  const defaults: ReportDelaySchema = {
    routeId: context?.routeId ?? '',
    scheduleId: context?.scheduleId,
    // cause começa sem seleção; o cast preserva o tipo derivado do schema
    cause: undefined as unknown as ReportDelaySchema['cause'],
    delayMinutes: DEFAULT_MINUTES,
    reason: '',
  }

  const form = useForm<ReportDelaySchema>({
    resolver: zodResolver(reportDelaySchema),
    defaultValues: defaults,
  })

  const values = form.watch()
  const minutes = values.delayMinutes ?? DEFAULT_MINUTES
  const severity = severityFromMinutes(minutes)

  const selectedRoute = routes.find((r) => r.id === values.routeId)
  const routeSchedules = selectedRoute
    ? schedules.filter((s) => s.routeCode === selectedRoute.code)
    : []

  async function submit(v: ReportDelaySchema) {
    const route = routes.find((r) => r.id === v.routeId)
    const routeCode = route?.code ?? context?.routeCode ?? v.routeId
    const routeName = route?.name ?? context?.routeName ?? routeCode

    await reportDelay.mutateAsync({
      routeId: v.routeId,
      routeCode,
      routeName,
      scheduleId: v.scheduleId,
      cause: v.cause,
      delayMinutes: v.delayMinutes,
      severity: severityFromMinutes(v.delayMinutes),
      reason: v.reason?.trim() ? v.reason.trim() : undefined,
    })

    setSuccess(true)
    window.setTimeout(() => {
      setSuccess(false)
      form.reset(defaults)
      setStep(1)
      onSubmitted?.()
    }, 1100)
  }

  function goNext() {
    setDirection(1)
    setStep((s) => Math.min(3, s + 1))
  }

  function goBack() {
    setDirection(-1)
    setStep((s) => Math.max(1, s - 1))
  }

  const canAdvance =
    step === 1
      ? Boolean(values.routeId)
      : step === 2
        ? Boolean(values.scheduleId)
        : true

  // Bloco de detalhes reaproveitado no modo quick e no passo 3 do wizard.
  const detailsFields = (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Causa do atraso</Label>
        <ChoiceChips
          options={DELAY_CAUSE_OPTIONS}
          value={values.cause}
          onChange={(v) => form.setValue('cause', v, { shouldValidate: true })}
          ariaLabel="Causa do atraso"
        />
        {form.formState.errors.cause && (
          <p className="text-destructive text-sm">
            {form.formState.errors.cause.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Minutos de atraso</Label>
        <MinuteStepper
          value={minutes}
          onChange={(v) =>
            form.setValue('delayMinutes', v, { shouldValidate: true })
          }
        />
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-muted-foreground text-xs">
            Severidade automática:
          </span>
          <Badge
            variant="outline"
            className={cn(
              'gap-1.5 px-3 py-1 font-semibold',
              SEVERITY_META[severity].className,
            )}
          >
            {SEVERITY_META[severity].label}
          </Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="delay-reason">Notas (opcional)</Label>
        <Textarea
          id="delay-reason"
          value={values.reason ?? ''}
          onChange={(e) => form.setValue('reason', e.target.value)}
          placeholder="Detalhe o que aconteceu, se necessário..."
          className="min-h-20 resize-none"
        />
      </div>
    </div>
  )

  const successOverlay = (
    <AnimatePresence>
      {success && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-background/95 absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
        >
          <motion.div
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          >
            <CheckCircle2 className="size-14 text-emerald-500" />
          </motion.div>
          <p className="font-medium">Atraso registrado</p>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (mode === 'quick') {
    return (
      <div className={cn('relative', className)}>
        {successOverlay}
        <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
          {detailsFields}
          <div className="flex items-center justify-end gap-2 pt-1">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={onCancel}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              className="min-h-11 gap-2 border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
              disabled={!values.cause || reportDelay.isPending}
            >
              {reportDelay.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Registrar atraso
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {successOverlay}
      <form
        onSubmit={form.handleSubmit(submit)}
        className="flex min-h-[420px] flex-col"
      >
        <StepIndicator
          current={step}
          total={3}
          labels={['Rota', 'Horário', 'Detalhes']}
          className="mb-5"
        />

        <div className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.22 }}
            >
              {step === 1 && (
                <div role="radiogroup" aria-label="Rota" className="space-y-3">
                  <p className="text-sm font-medium">Selecione a rota</p>
                  {routesLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-14 w-full" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  ) : (
                    routes.map((r, i) => (
                      <SelectableCard
                        key={r.id}
                        index={i}
                        selected={values.routeId === r.id}
                        onSelect={() => {
                          form.setValue('routeId', r.id, {
                            shouldValidate: true,
                          })
                          form.setValue('scheduleId', undefined)
                        }}
                        title={`${r.code} · ${r.name}`}
                        subtitle={`${r.origin} → ${r.destination}`}
                        meta={
                          <span className="text-muted-foreground text-xs">
                            {r.schedulesTodayCount} hoje
                          </span>
                        }
                      />
                    ))
                  )}
                </div>
              )}

              {step === 2 && (
                <div
                  role="radiogroup"
                  aria-label="Horário"
                  className="space-y-3"
                >
                  <p className="text-sm font-medium">
                    Qual saída sofreu atraso?
                  </p>
                  {routeSchedules.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhuma saída registrada hoje para esta rota.
                    </p>
                  ) : (
                    routeSchedules.map((s, i) => (
                      <SelectableCard
                        key={s.id}
                        index={i}
                        selected={values.scheduleId === s.id}
                        onSelect={() =>
                          form.setValue('scheduleId', s.id, {
                            shouldValidate: true,
                          })
                        }
                        title={`${s.departureTime} → ${s.arrivalEstimate}`}
                        subtitle={`${s.origin} → ${s.destination}`}
                        meta={
                          <Badge variant="outline" className="text-xs">
                            {SCHEDULE_STATUS_LABEL[s.status]}
                          </Badge>
                        }
                      />
                    ))
                  )}
                </div>
              )}

              {step === 3 && detailsFields}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-background sticky bottom-0 mt-4 flex items-center justify-between gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            onClick={step === 1 ? onCancel : goBack}
            disabled={step === 1 && !onCancel}
          >
            <ChevronLeft className="size-4" />
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              className="min-h-11"
              onClick={goNext}
              disabled={!canAdvance}
            >
              Continuar
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="min-h-11 gap-2"
              disabled={!values.cause || reportDelay.isPending}
            >
              {reportDelay.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Enviar atraso
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
