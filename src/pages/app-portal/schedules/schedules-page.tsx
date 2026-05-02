import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock,
  PauseCircle,
  Pencil,
  Plus,
  Route as RouteIcon,
  Search,
  Star,
  X,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { CooperativePicker } from '@/components/cooperative-picker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Toggle } from '@/components/ui/toggle'
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
import { ExceptionModal } from './exception-modal'
import type { RouteExceptionContext } from './exception-modal'
import { ScheduleActionsMenu } from './schedule-actions-menu'
import { ScheduleStatusModal } from './schedule-status-modal'
import type { StatusVariant } from './schedule-status-modal'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

// ─── constants ───────────────────────────────────────────────────────────────

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

const DAY_FULL_LABEL: Record<DayOfWeek, string> = {
  seg: 'Segunda-feira',
  ter: 'Terca-feira',
  qua: 'Quarta-feira',
  qui: 'Quinta-feira',
  sex: 'Sexta-feira',
  sab: 'Sabado',
  dom: 'Domingo',
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

const OP_STATUS_META: Record<
  OperationalStatus,
  { label: string; badge: string; toggle: string; icon: typeof CheckCircle2 }
> = {
  in_operation: {
    label: 'Em operacao',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    toggle:
      'data-[state=on]:border-emerald-200 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700',
    icon: CheckCircle2,
  },
  delayed: {
    label: 'Atrasado',
    badge: 'border-amber-300 bg-amber-50 text-amber-800',
    toggle:
      'data-[state=on]:border-amber-300 data-[state=on]:bg-amber-50 data-[state=on]:text-amber-800',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'border-red-200 bg-red-50 text-red-700',
    toggle:
      'data-[state=on]:border-red-200 data-[state=on]:bg-red-50 data-[state=on]:text-red-700',
    icon: XCircle,
  },
  suspended: {
    label: 'Suspenso',
    badge: 'border-slate-200 bg-slate-100 text-slate-600',
    toggle:
      'data-[state=on]:border-slate-200 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-600',
    icon: PauseCircle,
  },
}

// ─── sub-components ──────────────────────────────────────────────────────────

function DayCircles({ activeDays }: { activeDays: DayOfWeek[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {ALL_DAYS.map((day) => {
        const active = activeDays.includes(day)
        return (
          <div
            key={day}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
              active ? 'bg-[#0873df] text-white' : 'bg-slate-200 text-slate-500 opacity-50',
            )}
          >
            {DAY_CIRCLE_LABEL[day]}
          </div>
        )
      })}
    </div>
  )
}

function OperationalBadge({ status }: { status: OperationalStatus }) {
  const meta = OP_STATUS_META[status]
  const Icon = meta.icon
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', meta.badge)}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  )
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
          label="Dias de operacao"
          value={activeDays.map((d) => SHORT_DAY[d]).join(' • ')}
        />
        <InfoCard
          icon={<CircleAlert className="text-muted-foreground h-3.5 w-3.5" />}
          label="Status do horario"
          value={RECORD_STATUS_LABEL[recordStatus]}
        />
        <InfoCard
          icon={<Pencil className="text-muted-foreground h-3.5 w-3.5" />}
          label="Observacoes"
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
                            Novo horario
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
            <span className="text-muted-foreground text-xs">Nenhuma excecao proxima</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 rounded-full text-xs sm:w-auto sm:shrink-0"
          onClick={onAddException}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar excecao
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
              Avaliacao do horario
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-foreground text-sm font-semibold">
                {rating.average.toFixed(1)} ({rating.total} avaliacoes)
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
}: {
  schedule: AdminSchedule
  routeStops: RouteStop[]
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
            <DayCircles activeDays={schedule.activeDays} />
            <OperationalBadge status={schedule.operationalStatus} />
          </div>

          {/* menu + chevron — stop propagation */}
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <ScheduleActionsMenu
              schedule={schedule}
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

        {/* mobile: second row with day circles + status */}
        <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
          <DayCircles activeDays={schedule.activeDays} />
          <OperationalBadge status={schedule.operationalStatus} />
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
        Servico extra
      </Badge>
    </div>
  )
}

function ScheduleRouteSection({ route }: { route: AdminRoute }) {
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
                  {route.openExceptionsCount > 1 ? 'excecoes' : 'excecao'}
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
              <span className="hidden sm:inline">Servico extra</span>
            </Button>

            {/* mobile collapse toggle */}
            <button
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expandir horarios' : 'Recolher horarios'}
            >
              {totalSchedules} hor.
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform', !collapsed && 'rotate-180')}
              />
            </button>
          </div>
        </div>
      </div>

      {/* schedule rows — hidden when collapsed on mobile, always shown on desktop */}
      <div className={cn('border-t', collapsed && 'hidden md:block')}>
        {route.schedules.map((schedule) => (
          <ScheduleRowItem key={schedule.id} schedule={schedule} routeStops={route.stops} />
        ))}
      </div>

      {/* temporary schedules */}
      {route.temporarySchedules && route.temporarySchedules.length > 0 && (
        <div className={cn('border-t', collapsed && 'hidden md:block')}>
          <div className="px-4 pb-1 pt-2.5">
            <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
              Servicos extras
            </p>
          </div>
          {route.temporarySchedules.map((tmp) => (
            <TemporaryScheduleRow key={tmp.id} tmp={tmp} />
          ))}
        </div>
      )}

      {/* footer */}
      <div className="border-t px-4 py-2">
        <p className="text-muted-foreground text-xs">
          {totalSchedules} horario{totalSchedules !== 1 ? 's' : ''} nesta rota
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

// ─── main page ───────────────────────────────────────────────────────────────

export function SchedulesPage() {
  useOutletContext<AppPortalOutletContext>()

  const [pendingQuery, setPendingQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<OperationalStatus[]>(ALL_OP_STATUSES)
  const [onlyExceptions, setOnlyExceptions] = useState(false)
  const [cooperativeFilter, setCooperativeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  const hasPendingQuery = pendingQuery.trim().length > 0
  const hasActiveFilters =
    Boolean(committedQuery.trim()) ||
    statusFilters.length !== ALL_OP_STATUSES.length ||
    onlyExceptions ||
    Boolean(cooperativeFilter) ||
    Boolean(dateFilter)

  const filteredRoutes = useMemo(() => {
    const q = committedQuery.trim().toLowerCase()

    return MOCK_ADMIN_ROUTES.map((route) => {
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
  }, [committedQuery, statusFilters, onlyExceptions])

  const totalSchedules = filteredRoutes.reduce((acc, r) => acc + r.schedules.length, 0)

  const handleSearch = () => setCommittedQuery(pendingQuery)

  const toggleStatus = (status: OperationalStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }

  const clearFilters = () => {
    setPendingQuery('')
    setCommittedQuery('')
    setStatusFilters(ALL_OP_STATUSES)
    setOnlyExceptions(false)
    setCooperativeFilter('')
    setDateFilter('')
  }

  const dateTriggerLabel = dateFilter
    ? new Date(dateFilter + 'T00:00:00').toLocaleDateString('pt-BR')
    : 'Data'

  return (
    <section className="space-y-6">
      {/* header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">Horarios</h1>
          <p className="text-muted-foreground text-sm">
            Conteudo operacional de horarios por rota.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Horario
        </Button>
      </header>

      {/* kpi cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="flex items-center gap-4 rounded-xl border bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-teal-200 bg-teal-50">
            <CalendarDays className="h-5 w-5 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-2xl font-extrabold leading-none">
              {ADMIN_SCHEDULE_SUMMARY.activeSchedulesToday.toLocaleString('pt-BR')}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">Horarios ativos hoje</p>
            <p className="text-muted-foreground text-[11px]">
              grade consolidada por rotas e cooperativas
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-xl border bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-orange-50">
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-2xl font-extrabold leading-none">
              {ADMIN_SCHEDULE_SUMMARY.openExceptions}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">Excecoes abertas</p>
            <p className="text-muted-foreground text-[11px]">
              12 atrasos e 6 cancelamentos &bull; prox. 18/04
            </p>
          </div>
        </article>

        <article className="flex items-center gap-4 rounded-xl border bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
            <RouteIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-foreground text-2xl font-extrabold leading-none">
              {ADMIN_SCHEDULE_SUMMARY.monitoredRoutes}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">Rotas monitoradas</p>
            <p className="text-muted-foreground text-[11px]">com agrupamento por rota</p>
          </div>
        </article>
      </section>

      {/* filters */}
      <section className="bg-card space-y-3 rounded-xl border p-4">
        <div className="flex flex-wrap gap-2">
          <InputGroup className="h-9 min-w-60 flex-1">
            <InputGroupAddon align="inline-start">
              <Search className="text-muted-foreground h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar por rota, origem, destino ou codigo"
              value={pendingQuery}
              onChange={(e) => setPendingQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
            />
            {hasPendingQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Limpar busca"
                  onClick={() => {
                    setPendingQuery('')
                    setCommittedQuery('')
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>

          <div className="w-52">
            <CooperativePicker
              value={cooperativeFilter}
              onChange={setCooperativeFilter}
              placeholder="Cooperativa"
              className="h-9 rounded-lg"
            />
          </div>

          <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-9 gap-2', dateFilter && 'border-[#0873df] text-[#0873df]')}
              >
                {dateTriggerLabel}
                {dateFilter ? (
                  <X
                    className="h-3.5 w-3.5"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDateFilter('')
                    }}
                  />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
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
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    setDatePopoverOpen(false)
                  }}
                  className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
                />
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-9 gap-1.5 px-2"
              onClick={clearFilters}
            >
              <X className="h-3.5 w-3.5" />
              Limpar
            </Button>
          )}
        </div>

        {/* status chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            pressed={onlyExceptions}
            onPressedChange={setOnlyExceptions}
            variant="outline"
            size="sm"
            className="h-8 gap-2 rounded-full px-3 text-xs font-semibold data-[state=on]:border-teal-300 data-[state=on]:bg-teal-50 data-[state=on]:text-teal-700"
          >
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            Somente com excecao
          </Toggle>

          <div className="bg-border h-5 w-px" />

          {ALL_OP_STATUSES.map((status) => {
            const meta = OP_STATUS_META[status]
            const Icon = meta.icon
            return (
              <Toggle
                key={status}
                pressed={statusFilters.includes(status)}
                onPressedChange={() => toggleStatus(status)}
                variant="outline"
                size="sm"
                className={cn(
                  'border-border h-8 gap-1.5 rounded-full px-3 text-xs font-semibold',
                  meta.toggle,
                )}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </Toggle>
            )
          })}
        </div>
      </section>

      {/* route sections */}
      {filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-slate-50 py-16 text-center">
          <CalendarDays className="text-muted-foreground h-10 w-10" />
          <p className="text-foreground font-semibold">Nenhum horario encontrado</p>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou limpar a busca.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1 rounded-full"
            onClick={clearFilters}
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <section className="space-y-4">
          {filteredRoutes.map((route) => (
            <ScheduleRouteSection key={route.id} route={route} />
          ))}
        </section>
      )}

      {/* footer summary */}
      {filteredRoutes.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Mostrando {filteredRoutes.length} de {MOCK_ADMIN_ROUTES.length} rotas &bull;{' '}
            {totalSchedules} horario{totalSchedules !== 1 ? 's' : ''}
          </p>
          <Button variant="outline" size="sm" className="gap-2 rounded-full">
            Carregar mais rotas
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </section>
  )
}
