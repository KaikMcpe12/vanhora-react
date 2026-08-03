import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock,
  Pencil,
  Plus,
  Route,
  Star,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminStatusBadge,
  StatusFilterChips,
} from '@/components/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ADMIN_SCHEDULE_SUMMARY,
  MOCK_ADMIN_ROUTES,
} from '@/lib/data/mock-admin-schedules'
import type {
  AdminRoute,
  AdminSchedule,
  DayOfWeek,
  OperationalStatus,
  RouteStop,
  ScheduleTemporary,
} from '@/lib/types/admin-schedule'
import { cn } from '@/lib/utils'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

import { DelayModal } from './delay-modal'
import type { RouteExceptionContext } from './exception-modal'
import { ExceptionModal } from './exception-modal'
import { ScheduleActionsMenu } from './schedule-actions-menu'
import {
  ScheduleFormDialog,
  type ScheduleFormMode,
  type ScheduleFormValues,
} from './schedule-form-dialog'
import type { StatusVariant } from './schedule-status-modal'
import { ScheduleStatusModal } from './schedule-status-modal'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

const ALL_DAYS: DayOfWeek[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']

const DAY_CIRCLE_LABEL: Record<DayOfWeek, string> = {
  seg: 'S',
  ter: 'T',
  qua: 'Q',
  qui: 'Q',
  sex: 'S',
  sab: 'S',
  dom: 'D',
}

const SHORT_DAY: Record<DayOfWeek, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sab',
  dom: 'Dom',
}

const EXCEPTION_TYPE_LABEL = {
  cancelled: 'Cancelado',
  suspended: 'Suspenso',
  rescheduled: 'Reagendado',
}

const RECORD_STATUS_LABEL = {
  active: 'Ativo',
  cancelled: 'Cancelado',
  suspended: 'Suspenso',
}

const ALL_OP_STATUSES: OperationalStatus[] = [
  'in_operation',
  'delayed',
  'cancelled',
  'suspended',
]


function DayChips({ activeDays }: { activeDays: DayOfWeek[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {ALL_DAYS.map((day) => {
        const active = activeDays.includes(day)
        return active ? (
          <span
            key={day}
            className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-blue-100/80 text-[10px] font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
          >
            {DAY_CIRCLE_LABEL[day]}
          </span>
        ) : (
          <span
            key={day}
            className="inline-flex h-5 w-5 items-center justify-center text-[10px] text-muted-foreground"
          >
            {DAY_CIRCLE_LABEL[day]}
          </span>
        )
      })}
    </div>
  )
}

function getOperationalBadge(status: OperationalStatus): {
  variant: 'success' | 'attention' | 'critical' | 'neutral'
  label: string
} {
  if (status === 'in_operation') return { variant: 'success', label: 'Em operação' }
  if (status === 'delayed') return { variant: 'attention', label: 'Atrasado' }
  if (status === 'cancelled') return { variant: 'critical', label: 'Cancelado' }
  return { variant: 'neutral', label: 'Suspenso' }
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <span className="text-foreground text-sm font-medium">{value}</span>
    </div>
  )
}

function ScheduleExpandedPanel({
  schedule,
  stops,
  onAddException,
}: {
  schedule: AdminSchedule
  stops: RouteStop[]
  onAddException: () => void
}) {
  const { activeDays, recordStatus, notes, nextException, rating } = schedule

  return (
    <div className="flex flex-col gap-2 border-t bg-white px-4 py-3">
      {/* row 1 — info cards */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <InfoCard
          icon={<CalendarDays className="text-muted-foreground h-3.5 w-3.5" />}
          label="Dias de operação"
          value={activeDays.map((d) => SHORT_DAY[d]).join(' • ')}
        />
        <InfoCard
          icon={<CircleAlert className="text-muted-foreground h-3.5 w-3.5" />}
          label="Status do horário"
          value={RECORD_STATUS_LABEL[recordStatus]}
        />
        <InfoCard
          icon={<Pencil className="text-muted-foreground h-3.5 w-3.5" />}
          label="Observações"
          value={notes ?? '—'}
        />
      </div>

      {/* row 2 — exception bar */}
      <div className="flex flex-col gap-2 rounded-lg border bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {nextException ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                <CalendarDays className="h-3 w-3" />
                {nextException.date}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                <AlertCircle className="h-3 w-3" />
                {EXCEPTION_TYPE_LABEL[nextException.type]}
              </span>
              {nextException.type === 'rescheduled' && nextException.newDepartureTime && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  <Clock className="h-3 w-3" />
                  {nextException.newDepartureTime}
                </span>
              )}
              {nextException.reason && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">
                      <CircleAlert className="h-3 w-3" />
                      {nextException.reason}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="gap-1 rounded-full border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800"
                        >
                          <AlertCircle className="h-2.5 w-2.5" />
                          {EXCEPTION_TYPE_LABEL[nextException.type]}
                        </Badge>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                          Data
                        </p>
                        <p className="text-foreground text-sm">{nextException.date}</p>
                      </div>
                      {nextException.newDepartureTime && (
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                            Novo horário
                          </p>
                          <p className="text-foreground text-sm">{nextException.newDepartureTime}</p>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                          Motivo
                        </p>
                        <p className="text-foreground text-sm">{nextException.reason}</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-xs">Nenhuma exceção próxima</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 rounded-full text-xs sm:w-auto sm:shrink-0"
          onClick={onAddException}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar exceção
        </Button>
      </div>

      {/* row 3 — stops + rating */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-slate-50 px-3 py-2.5">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
            Paradas da rota
          </span>
          <div className="mt-0.5 flex flex-col gap-0.5">
            {stops.map((stop) => (
              <span key={stop.city} className="text-foreground text-xs font-medium">
                {stop.time} • {stop.city}
              </span>
            ))}
          </div>
        </div>

        {rating && (
          <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-slate-50 px-3 py-2.5">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
              Avaliação do horário
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-foreground text-sm font-semibold">
                {rating.average.toFixed(1)} ({rating.total} avaliações)
              </span>
            </div>
            {rating.lastAt && (
              <span className="text-muted-foreground text-[11px]">Ultima: {rating.lastAt}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleRowItem({
  schedule,
  routeStops,
  onEdit,
  onDuplicate,
}: {
  schedule: AdminSchedule
  routeStops: RouteStop[]
  onEdit: () => void
  onDuplicate: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [delayOpen, setDelayOpen] = useState(false)
  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [statusVariant, setStatusVariant] = useState<StatusVariant>('suspend')
  const [statusOpen, setStatusOpen] = useState(false)

  const isDimmed = schedule.recordStatus === 'cancelled' || schedule.recordStatus === 'suspended'

  const openStatus = (variant: StatusVariant) => {
    setStatusVariant(variant)
    setStatusOpen(true)
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setExpanded((v) => !v)
        }}
        className={cn(
          'cursor-pointer border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50',
          isDimmed && 'opacity-60',
          expanded && 'bg-slate-50',
        )}
      >
        {/* main row */}
        <div className="flex items-center gap-3">
          {/* departure time */}
          <span
            className={cn(
              'w-16 shrink-0 text-3xl font-bold leading-none',
              isDimmed ? 'text-muted-foreground' : 'text-[#005ab4]',
            )}
          >
            {schedule.departureTime}
          </span>

          <div className="flex-1" />

          {/* day circles + status badge — desktop only, right-aligned */}
          <div className="hidden items-center gap-3 md:flex">
            <DayChips activeDays={schedule.activeDays} />
            <AdminStatusBadge {...getOperationalBadge(schedule.operationalStatus)} />
          </div>

          {/* menu + chevron — stop propagation */}
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <ScheduleActionsMenu
              schedule={schedule}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onRegisterDelay={() => setDelayOpen(true)}
              onSuspend={() => openStatus('suspend')}
              onCancel={() => openStatus('cancel')}
              onReactivate={() => openStatus('reactivate')}
              onAddException={() => setExceptionOpen(true)}
            />
          </div>

          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </div>

        {/* mobile: second row with day chips + status */}
        <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
          <DayChips activeDays={schedule.activeDays} />
          <AdminStatusBadge {...getOperationalBadge(schedule.operationalStatus)} />
        </div>

        {/* notes */}
        {schedule.notes && (
          <p className="text-muted-foreground mt-1.5 text-[11px]">{schedule.notes}</p>
        )}
      </div>

      {expanded && (
        <ScheduleExpandedPanel
          schedule={schedule}
          stops={routeStops}
          onAddException={() => setExceptionOpen(true)}
        />
      )}

      <DelayModal open={delayOpen} onOpenChange={setDelayOpen} schedule={schedule} />
      <ExceptionModal open={exceptionOpen} onOpenChange={setExceptionOpen} schedule={schedule} />
      <ScheduleStatusModal
        open={statusOpen}
        onOpenChange={setStatusOpen}
        schedule={schedule}
        variant={statusVariant}
      />
    </>
  )
}

function TemporaryScheduleRow({ tmp }: { tmp: ScheduleTemporary }) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
      <span className="w-16 shrink-0 text-xl font-bold leading-none text-amber-700">
        {tmp.departureTime}
      </span>
      <div className="min-w-0 flex-1">
        {tmp.reason && (
          <p className="text-foreground truncate text-xs">{tmp.reason}</p>
        )}
        <p className="text-muted-foreground text-[11px]">{tmp.date}</p>
      </div>
      <Badge
        variant="outline"
        className="gap-1 rounded-full border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
      >
        <Clock className="h-3 w-3" />
        Serviço extra
      </Badge>
    </div>
  )
}

function ScheduleRouteSection({
  route,
  onEditSchedule,
  onDuplicateSchedule,
}: {
  route: AdminRoute
  onEditSchedule: (schedule: AdminSchedule) => void
  onDuplicateSchedule: (schedule: AdminSchedule) => void
}) {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )
  const [tempServiceOpen, setTempServiceOpen] = useState(false)

  const totalSchedules = route.schedules.length

  const routeContext: RouteExceptionContext = {
    code: route.code,
    origin: route.origin,
    destination: route.destination,
  }

  return (
    <article className="bg-card overflow-hidden rounded-xl border">
      {/* route header */}
      <div className="px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* line 1: code + cooperative */}
            <h2 className="text-foreground flex flex-wrap items-baseline gap-x-2 text-lg font-bold leading-tight">
              Rota {route.code}
              <span className="text-muted-foreground text-sm font-normal">
                {route.cooperativeName}
              </span>
            </h2>

            {/* line 2: route + price + exception chip */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {route.origin} &rarr; {route.destination} &bull; R${' '}
                {route.basePrice.toFixed(2)}
              </span>
              {route.openExceptionsCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  <AlertCircle className="h-3 w-3" />
                  {route.openExceptionsCount}{' '}
                  {route.openExceptionsCount > 1 ? 'exceções' : 'exceção'}
                  {route.nextExceptionDate && ` — ${route.nextExceptionDate}`}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* serviço extra — always visible */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-full text-xs"
              onClick={() => setTempServiceOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Serviço extra</span>
            </Button>

            {/* mobile collapse toggle */}
            <button
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expandir horários' : 'Recolher horários'}
            >
              {totalSchedules} hor.
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', !collapsed && 'rotate-180')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* schedule rows — animated collapse on mobile, always visible on desktop */}
      <div
        className={cn(
          'border-t grid transition-all duration-200 ease-in-out',
          collapsed ? 'grid-rows-[0fr] md:![grid-template-rows:1fr]' : 'grid-rows-[1fr]',
        )}
      >
        <div className="overflow-hidden">
          {route.schedules.map((schedule) => (
            <ScheduleRowItem
              key={schedule.id}
              schedule={schedule}
              routeStops={route.stops}
              onEdit={() => onEditSchedule(schedule)}
              onDuplicate={() => onDuplicateSchedule(schedule)}
            />
          ))}
        </div>
      </div>

      {/* temporary schedules */}
      {route.temporarySchedules && route.temporarySchedules.length > 0 && (
        <div
          className={cn(
            'border-t grid transition-all duration-200 ease-in-out',
            collapsed ? 'grid-rows-[0fr] md:![grid-template-rows:1fr]' : 'grid-rows-[1fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-1 pt-2.5">
              <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                Serviços extras
              </p>
            </div>
            {route.temporarySchedules.map((tmp) => (
              <TemporaryScheduleRow key={tmp.id} tmp={tmp} />
            ))}
          </div>
        </div>
      )}

      {/* footer */}
      <div className="border-t px-4 py-2">
        <p className="text-muted-foreground text-xs">
          {totalSchedules} horário{totalSchedules !== 1 ? 's' : ''} nesta rota
        </p>
      </div>

      <ExceptionModal
        open={tempServiceOpen}
        onOpenChange={setTempServiceOpen}
        routeContext={routeContext}
      />
    </article>
  )
}

export function SchedulesPage() {
  useOutletContext<AppPortalOutletContext>()

  const [searchParams, setSearchParams] = useSearchParams()
  const routeParam = searchParams.get('route') ?? ''

  const [pendingQuery, setPendingQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<OperationalStatus[]>(ALL_OP_STATUSES)
  const [onlyExceptions, setOnlyExceptions] = useState(false)
  const [cooperativeFilter, setCooperativeFilter] = useState(
    () => searchParams.get('cooperative') ?? '',
  )
  const [dateFilter, setDateFilter] = useState('')
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  const clearRouteFilter = () => {
    searchParams.delete('route')
    setSearchParams(searchParams)
  }

  const [routes, setRoutes] = useState<AdminRoute[]>(MOCK_ADMIN_ROUTES)

  // Schedule create/edit/duplicate form state.
  const [scheduleForm, setScheduleForm] = useState<{
    mode: ScheduleFormMode
    routeId?: string
    editingScheduleId?: string
    initialValues?: ScheduleFormValues
  } | null>(null)

  const openNewSchedule = () => setScheduleForm({ mode: 'create' })

  const openEditSchedule = (route: AdminRoute, schedule: AdminSchedule) =>
    setScheduleForm({
      mode: 'edit',
      routeId: route.id,
      editingScheduleId: schedule.id,
      initialValues: {
        departureTime: schedule.departureTime,
        activeDays: schedule.activeDays,
        notes: schedule.notes ?? '',
      },
    })

  const openDuplicateSchedule = (route: AdminRoute, schedule: AdminSchedule) =>
    setScheduleForm({
      mode: 'duplicate',
      routeId: route.id,
      initialValues: {
        departureTime: '',
        activeDays: schedule.activeDays,
        notes: schedule.notes ?? '',
      },
    })

  const handleScheduleSubmit = (
    routeId: string,
    values: ScheduleFormValues,
    mode: ScheduleFormMode,
  ) => {
    const editingId = scheduleForm?.editingScheduleId
    setRoutes((prev) =>
      prev.map((r) => {
        if (r.id !== routeId) return r
        if (mode === 'edit' && editingId) {
          return {
            ...r,
            schedules: r.schedules.map((s) =>
              s.id === editingId
                ? {
                    ...s,
                    departureTime: values.departureTime,
                    dayOfWeek: values.activeDays[0] ?? s.dayOfWeek,
                    activeDays: values.activeDays,
                    notes: values.notes || undefined,
                  }
                : s,
            ),
          }
        }
        const newSchedule: AdminSchedule = {
          id: `sch-${Date.now()}`,
          departureTime: values.departureTime,
          dayOfWeek: values.activeDays[0] ?? 'seg',
          activeDays: values.activeDays,
          cooperativeName: r.cooperativeName,
          origin: r.origin,
          destination: r.destination,
          routeCode: r.code,
          recordStatus: 'active',
          operationalStatus: 'in_operation',
          notes: values.notes || undefined,
        }
        return {
          ...r,
          schedules: [...r.schedules, newSchedule].sort((a, b) =>
            a.departureTime.localeCompare(b.departureTime),
          ),
        }
      }),
    )
    toast.success(
      mode === 'edit' ? 'Horário atualizado' : 'Horário criado com sucesso',
    )
  }

  const filteredRoutes = useMemo(() => {
    const q = committedQuery.trim().toLowerCase()

    return routes.filter((route) => {
      if (cooperativeFilter && route.cooperativeName !== cooperativeFilter) return false
      if (routeParam && route.code !== routeParam) return false
      return true
    }).map((route) => {
      const filteredSchedules = route.schedules.filter((s) => {
        if (!statusFilters.includes(s.operationalStatus)) return false
        if (onlyExceptions && !s.nextException) return false
        if (q) {
          const hay = [route.code, route.origin, route.destination, route.cooperativeName]
            .join(' ')
            .toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      return { ...route, schedules: filteredSchedules }
    }).filter((r) => r.schedules.length > 0)
  }, [routes, committedQuery, cooperativeFilter, statusFilters, onlyExceptions, routeParam])

  const totalSchedules = filteredRoutes.reduce((acc, r) => acc + r.schedules.length, 0)

  const clearFilters = () => {
    setPendingQuery('')
    setCommittedQuery('')
    setStatusFilters(ALL_OP_STATUSES)
    setOnlyExceptions(false)
    setCooperativeFilter('')
    setDateFilter('')
    // Também limpa os filtros vindos da URL (rota/cooperativa), que são lidos
    // ao vivo de searchParams e persistiriam após o reset de estado.
    if (searchParams.has('route') || searchParams.has('cooperative')) {
      searchParams.delete('route')
      searchParams.delete('cooperative')
      setSearchParams(searchParams)
    }
  }

  const hasActiveFilters =
    committedQuery.trim() !== '' ||
    cooperativeFilter !== '' ||
    dateFilter !== '' ||
    onlyExceptions ||
    routeParam !== '' ||
    statusFilters.length !== ALL_OP_STATUSES.length

  const dateTriggerLabel = dateFilter
    ? new Date(dateFilter + 'T00:00:00').toLocaleDateString('pt-BR')
    : 'Data'

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminKPICard
          label="Horários ativos hoje"
          value={ADMIN_SCHEDULE_SUMMARY.activeSchedulesToday.toLocaleString('pt-BR')}
          helper="grade consolidada por rotas e cooperativas"
          icon={Clock}
        />
        <AdminKPICard
          label="Exceções abertas"
          value={ADMIN_SCHEDULE_SUMMARY.openExceptions}
          helper="atrasos e cancelamentos pendentes"
          severity="attention"
          icon={AlertCircle}
        />
        <AdminKPICard
          label="Rotas monitoradas"
          value={ADMIN_SCHEDULE_SUMMARY.monitoredRoutes}
          helper="com agrupamento por rota"
          icon={Route}
        />
      </div>

      <AdminFilterBar
        searchValue={pendingQuery}
        onSearchChange={(v) => {
          setPendingQuery(v)
          setCommittedQuery(v)
        }}
        searchPlaceholder="Buscar por rota, origem, destino ou código"
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={cooperativeFilter || 'all'}
              onValueChange={(v) => setCooperativeFilter(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="Cooperativa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Array.from(new Set(routes.map((r) => r.cooperativeName))).map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn('h-8 gap-2 text-xs', dateFilter && 'border-primary text-primary')}
                >
                  {dateTriggerLabel}
                  {dateFilter && (
                    <X
                      className="h-3 w-3"
                      onClick={(e) => { e.stopPropagation(); setDateFilter('') }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Filtrar por data
                  </p>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value); setDatePopoverOpen(false) }}
                    className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                  />
                </div>
              </PopoverContent>
            </Popover>

            <StatusFilterChips
              options={[
                { value: 'in_operation', label: 'Em operação' },
                { value: 'delayed', label: 'Atrasado' },
                { value: 'cancelled', label: 'Cancelado' },
                { value: 'suspended', label: 'Suspenso' },
              ]}
              value={statusFilters}
              onChange={(v) => setStatusFilters(v as OperationalStatus[])}
            />

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs text-muted-foreground"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtros
              </Button>
            )}
          </div>
        }
        actions={
          <Button size="sm" className="gap-1.5" onClick={openNewSchedule}>
            <Plus className="h-3.5 w-3.5" />
            Novo Horário
          </Button>
        }
      />

      {routeParam && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[12px]">Filtrando pela rota:</span>
          <button
            onClick={clearRouteFilter}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {routeParam}
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {filteredRoutes.length === 0 ? (
        <AdminEmptyState
          icon={CalendarDays}
          title="Nenhum horário encontrado"
          description="Ajuste os filtros ou limpe-os para ver todos os horários."
          action={{ label: 'Limpar filtros', onClick: clearFilters, icon: X }}
        />
      ) : (
        <section className="space-y-4">
          {filteredRoutes.map((route) => (
            <ScheduleRouteSection
              key={route.id}
              route={route}
              onEditSchedule={(schedule) => openEditSchedule(route, schedule)}
              onDuplicateSchedule={(schedule) => openDuplicateSchedule(route, schedule)}
            />
          ))}
        </section>
      )}

      {/* footer summary */}
      {filteredRoutes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Mostrando {filteredRoutes.length} de {routes.length} rotas &bull;{' '}
            {totalSchedules} horario{totalSchedules !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            Carregar mais rotas
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {scheduleForm && (
        <ScheduleFormDialog
          open
          onOpenChange={(open) => {
            if (!open) setScheduleForm(null)
          }}
          mode={scheduleForm.mode}
          routes={routes}
          routeId={scheduleForm.routeId}
          initialValues={scheduleForm.initialValues}
          onSubmit={handleScheduleSubmit}
        />
      )}
    </section>
  )
}
