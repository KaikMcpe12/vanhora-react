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
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  StatusFilterChips,
} from '@/components/admin'
import { CooperativePicker } from '@/components/pickers/cooperative-picker'
import { WeekdayPicker } from '@/components/pickers/weekday-picker'
import { StatusChip } from '@/components/status-chip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTableFilters } from '@/hooks/use-table-filters'
import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import {
  ADMIN_SCHEDULE_SUMMARY,
  MOCK_ADMIN_ROUTES,
} from '@/lib/data/mock-admin-schedules'
import { SCHEDULE_STATUS_META } from '@/lib/status/status-meta'
import type {
  AdminRoute,
  AdminSchedule,
  DayOfWeek,
  OperationalStatus,
  RouteStop,
  ScheduleException,
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

const EXCEPTION_TYPE_LABEL: Record<ScheduleException['type'], string> = {
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Filtros persistidos na URL. Chaves cruas (sem namespace) porque a página
// tem só uma "tabela" agrupada por rota.
interface Filters extends Record<string, unknown> {
  search: string
  status: string[]
  cooperativeId: string
  days: string[]
  date: string
}

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
            className="text-muted-foreground inline-flex h-5 w-5 items-center justify-center text-[10px]"
          >
            {DAY_CIRCLE_LABEL[day]}
          </span>
        )
      })}
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
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
              {nextException.type === 'rescheduled' &&
                nextException.newDepartureTime && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    <Clock className="h-3 w-3" />
                    {nextException.newDepartureTime}
                  </span>
                )}
              {nextException.reason && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">
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
                        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                          Data
                        </p>
                        <p className="text-foreground text-sm">
                          {nextException.date}
                        </p>
                      </div>
                      {nextException.newDepartureTime && (
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                            Novo horário
                          </p>
                          <p className="text-foreground text-sm">
                            {nextException.newDepartureTime}
                          </p>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                          Motivo
                        </p>
                        <p className="text-foreground text-sm">
                          {nextException.reason}
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          ) : (
            <span className="text-muted-foreground text-xs">
              Nenhuma exceção próxima
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="min-h-11 w-full gap-1.5 rounded-full text-xs sm:w-auto sm:shrink-0"
          onClick={onAddException}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar exceção
        </Button>
      </div>

      {/* row 3 — stops + rating */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-slate-50 px-3 py-2.5">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
            Paradas da rota
          </span>
          <div className="mt-0.5 flex flex-col gap-0.5">
            {stops.map((stop) => (
              <span
                key={stop.city}
                className="text-foreground text-xs font-medium"
              >
                {stop.time} • {stop.city}
              </span>
            ))}
          </div>
        </div>

        {rating && (
          <div className="flex flex-1 flex-col gap-1 rounded-lg border bg-slate-50 px-3 py-2.5">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
              Avaliação do horário
            </span>
            <div className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-foreground text-sm font-semibold">
                {rating.average.toFixed(1)} ({rating.total} avaliações)
              </span>
            </div>
            {rating.lastAt && (
              <span className="text-muted-foreground text-[11px]">
                Ultima: {rating.lastAt}
              </span>
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
  highlighted,
  reduce,
  onEdit,
  onDuplicate,
}: {
  schedule: AdminSchedule
  routeStops: RouteStop[]
  highlighted: boolean
  reduce: boolean
  onEdit: () => void
  onDuplicate: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [delayOpen, setDelayOpen] = useState(false)
  const [exceptionOpen, setExceptionOpen] = useState(false)
  const [statusVariant, setStatusVariant] = useState<StatusVariant>('suspend')
  const [statusOpen, setStatusOpen] = useState(false)

  const isDimmed =
    schedule.recordStatus === 'cancelled' ||
    schedule.recordStatus === 'suspended'

  const openStatus = (variant: StatusVariant) => {
    setStatusVariant(variant)
    setStatusOpen(true)
  }

  return (
    <>
      <motion.div
        id={`schedule-${schedule.id}`}
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
        animate={
          highlighted && !reduce
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(59,130,246,0.0)',
                  '0 0 0 4px rgba(59,130,246,0.35)',
                  '0 0 0 0 rgba(59,130,246,0.0)',
                  '0 0 0 4px rgba(59,130,246,0.35)',
                  '0 0 0 0 rgba(59,130,246,0.0)',
                ],
              }
            : { boxShadow: '0 0 0 0 rgba(59,130,246,0)' }
        }
        transition={{ duration: highlighted && !reduce ? 1.6 : 0.18 }}
        className={cn(
          'cursor-pointer border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none',
          isDimmed && 'opacity-60',
          expanded && 'bg-slate-50',
        )}
      >
        {/* main row */}
        <div className="flex items-center gap-3">
          {/* departure time */}
          <span
            className={cn(
              'w-16 shrink-0 text-3xl leading-none font-bold',
              isDimmed ? 'text-muted-foreground' : 'text-info',
            )}
          >
            {schedule.departureTime}
          </span>

          <div className="flex-1" />

          {/* day circles + status badge — desktop only, right-aligned */}
          <div className="hidden items-center gap-3 md:flex">
            <DayChips activeDays={schedule.activeDays} />
            <StatusChip {...SCHEDULE_STATUS_META[schedule.operationalStatus]} />
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
          <StatusChip {...SCHEDULE_STATUS_META[schedule.operationalStatus]} />
        </div>

        {/* notes */}
        {schedule.notes && (
          <p className="text-muted-foreground mt-1.5 text-[11px]">
            {schedule.notes}
          </p>
        )}
      </motion.div>

      {expanded && (
        <ScheduleExpandedPanel
          schedule={schedule}
          stops={routeStops}
          onAddException={() => setExceptionOpen(true)}
        />
      )}

      <DelayModal
        open={delayOpen}
        onOpenChange={setDelayOpen}
        schedule={schedule}
      />
      <ExceptionModal
        open={exceptionOpen}
        onOpenChange={setExceptionOpen}
        schedule={schedule}
      />
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
    <div className="flex items-center gap-3 border-b border-l-[3px] border-l-amber-400 bg-amber-50/30 px-4 py-2.5 last:border-b-0">
      <span className="w-16 shrink-0 text-xl leading-none font-bold text-amber-700">
        {tmp.departureTime}
      </span>
      <div className="min-w-0 flex-1">
        {tmp.reason && (
          <p className="text-foreground truncate text-xs font-medium">
            {tmp.reason}
          </p>
        )}
        <p className="text-muted-foreground text-[11px]">{tmp.date}</p>
      </div>
      <StatusChip tone="warning" icon={Clock} label="Serviço extra" />
    </div>
  )
}

function ExceptionsBadge({ route }: { route: AdminRoute }) {
  const count = route.openExceptionsCount
  if (count <= 0) return null

  const items = route.openExceptions ?? []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${count} ${count > 1 ? 'exceções abertas' : 'exceção aberta'} — abrir lista`}
          className="focus-visible:ring-ring inline-flex min-h-9 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:outline-none"
        >
          <AlertCircle className="h-3 w-3" />
          {count} {count > 1 ? 'exceções abertas' : 'exceção aberta'}
          {route.nextExceptionDate && ` — próxima ${route.nextExceptionDate}`}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.14 }}
        >
          <div className="border-b px-3 py-2">
            <p className="text-foreground text-[13px] font-semibold">
              Exceções da rota {route.code}
            </p>
            <p className="text-muted-foreground text-[11px]">
              {count} {count > 1 ? 'ocorrências' : 'ocorrência'} — clique para
              detalhes
            </p>
          </div>
          {items.length === 0 ? (
            <p className="text-muted-foreground px-3 py-4 text-[12px]">
              Sem detalhes disponíveis. Contagem: {count}.
            </p>
          ) : (
            <ul className="max-h-72 overflow-auto">
              {items.map((exc, i) => (
                <li
                  key={`${exc.date}-${exc.scheduleId ?? i}`}
                  className="border-b px-3 py-2.5 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          exc.type === 'cancelled' &&
                            'border-red-300 bg-red-50 text-red-700',
                          exc.type === 'suspended' &&
                            'border-slate-300 bg-slate-50 text-slate-700',
                          exc.type === 'rescheduled' &&
                            'border-blue-300 bg-blue-50 text-blue-700',
                        )}
                      >
                        <AlertCircle className="h-2.5 w-2.5" />
                        {EXCEPTION_TYPE_LABEL[exc.type]}
                      </Badge>
                      {exc.departureTime && (
                        <span className="text-muted-foreground text-[11px] font-medium">
                          {exc.departureTime}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      {exc.date}
                    </span>
                  </div>
                  {exc.reason && (
                    <p className="text-foreground mt-1 text-[12px] leading-snug">
                      {exc.reason}
                    </p>
                  )}
                  {exc.type === 'rescheduled' && exc.newDepartureTime && (
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      Novo horário: {exc.newDepartureTime}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}

function ScheduleRouteSection({
  route,
  highlightedScheduleId,
  reduce,
  onEditSchedule,
  onDuplicateSchedule,
}: {
  route: AdminRoute
  highlightedScheduleId: string | null
  reduce: boolean
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
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {/* line 1: code + cooperative */}
            <h2 className="text-foreground flex flex-wrap items-baseline gap-x-2 text-lg leading-tight font-bold">
              Rota {route.code}
              <span className="text-muted-foreground text-sm font-normal">
                {route.cooperativeName}
              </span>
            </h2>

            {/* line 2: route + price + exceptions badge */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {route.origin} &rarr; {route.destination} &bull; R${' '}
                {route.basePrice.toFixed(2)}
              </span>
              <ExceptionsBadge route={route} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* serviço extra — always visible */}
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 gap-1.5 rounded-full text-xs"
              onClick={() => setTempServiceOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Serviço extra</span>
            </Button>

            {/* mobile collapse toggle */}
            <button
              className="flex min-h-11 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 md:hidden"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? 'Expandir horários' : 'Recolher horários'}
            >
              {totalSchedules} hor.
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  !collapsed && 'rotate-180',
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* schedule rows — animated collapse on mobile, always visible on desktop */}
      <div
        className={cn(
          'grid border-t transition-all duration-200 ease-in-out',
          collapsed
            ? 'grid-rows-[0fr] md:![grid-template-rows:1fr]'
            : 'grid-rows-[1fr]',
        )}
      >
        <div className="overflow-hidden">
          {route.schedules.map((schedule) => (
            <ScheduleRowItem
              key={schedule.id}
              schedule={schedule}
              routeStops={route.stops}
              highlighted={highlightedScheduleId === schedule.id}
              reduce={reduce}
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
            'grid border-t transition-all duration-200 ease-in-out',
            collapsed
              ? 'grid-rows-[0fr] md:![grid-template-rows:1fr]'
              : 'grid-rows-[1fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-2.5 pb-1">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
              <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                Serviços extras
              </p>
              <span className="text-muted-foreground text-[11px]">
                ({route.temporarySchedules.length})
              </span>
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
  const reduce = useReducedMotion() ?? false
  const [searchParams, setSearchParams] = useSearchParams()
  const routeParam = searchParams.get('route') ?? ''

  // `date` fica no schema (retrocompat com bookmarks `?date=`) mas ainda não
  // é aplicado à filtragem — o mock não tem "ocorrência daquele dia" ainda.
  // TODO(pr-ocorrencias): reintroduzir a UI quando `schedules_exceptions` +
  // `schedules_temporary` puderem responder "houve algo neste dia?".
  const { filters, setFilter, reset } = useTableFilters<Filters>({
    defaults: {
      search: '',
      status: [],
      cooperativeId: '',
      days: [],
      date: '',
    },
  })

  // Compat: `?cooperative=<nome>` legado → reescreve para `?cooperativeId=<uuid>`
  // sem recarregar. Não quebra links antigos. Remove após sunset.
  useEffect(() => {
    const legacy = searchParams.get('cooperative')
    if (!legacy) return
    const match = MOCK_ADMIN_COOPERATIVES.find((c) => c.name === legacy)
    setSearchParams(
      (p) => {
        p.delete('cooperative')
        if (match) p.set('cooperativeId', match.id)
        return p
      },
      { replace: true },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sanitiza `?cooperativeId=` — se vier valor não-UUID, limpa.
  useEffect(() => {
    const raw = filters.cooperativeId
    if (!raw || UUID_RE.test(raw)) return
    setFilter('cooperativeId', '')
  }, [filters.cooperativeId, setFilter])

  const clearRouteFilter = () => {
    setSearchParams(
      (p) => {
        p.delete('route')
        return p
      },
      { replace: true },
    )
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
        // departureTime vazio: precisa ser único por rota+dia.
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
          routeId: r.id,
          cooperativeId: r.cooperativeId,
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
      mode === 'edit'
        ? 'Alterações salvas.'
        : mode === 'duplicate'
          ? 'Horário duplicado com sucesso.'
          : 'Horário criado com sucesso.',
    )
  }

  const activeStatuses =
    filters.status.length === 0
      ? ALL_OP_STATUSES
      : (filters.status as OperationalStatus[])

  const activeDays = filters.days as DayOfWeek[]

  const filteredRoutes = useMemo(() => {
    const q = filters.search.trim().toLowerCase()

    return routes
      .filter((route) => {
        if (
          filters.cooperativeId &&
          route.cooperativeId !== filters.cooperativeId
        )
          return false
        if (routeParam && route.code !== routeParam) return false
        return true
      })
      .map((route) => {
        const filteredSchedules = route.schedules.filter((s) => {
          if (!activeStatuses.includes(s.operationalStatus)) return false
          if (
            activeDays.length > 0 &&
            !s.activeDays.some((d) => activeDays.includes(d))
          )
            return false
          if (q) {
            const hay = [
              route.code,
              route.origin,
              route.destination,
              route.cooperativeName,
              s.routeCode,
            ]
              .join(' ')
              .toLowerCase()
            if (!hay.includes(q)) return false
          }
          return true
        })
        return { ...route, schedules: filteredSchedules }
      })
      .filter((r) => r.schedules.length > 0)
  }, [
    routes,
    filters.search,
    filters.cooperativeId,
    activeStatuses,
    activeDays,
    routeParam,
  ])

  const totalSchedules = filteredRoutes.reduce(
    (acc, r) => acc + r.schedules.length,
    0,
  )

  const clearFilters = () => {
    reset()
    if (searchParams.has('route')) {
      setSearchParams(
        (p) => {
          p.delete('route')
          return p
        },
        { replace: true },
      )
    }
  }

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.cooperativeId !== '' ||
    activeDays.length > 0 ||
    routeParam !== '' ||
    filters.status.length > 0

  // Deep-link ?schedule=<uuid>: pulse + scroll no horário e limpa o param sem
  // reload. Se o id existe no mock mas está oculto pelos filtros ativos,
  // limpa os filtros primeiro (contrato "link sempre funciona" do PR9).
  // Silencia apenas quando o id não existe no mock.
  const scheduleParam = searchParams.get('schedule')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!scheduleParam) return
    const existsInMock = routes.some((r) =>
      r.schedules.some((s) => s.id === scheduleParam),
    )
    const visibleInFiltered = filteredRoutes.some((r) =>
      r.schedules.some((s) => s.id === scheduleParam),
    )
    setSearchParams(
      (p) => {
        p.delete('schedule')
        if (existsInMock && !visibleInFiltered) p.delete('route')
        return p
      },
      { replace: true },
    )
    if (!existsInMock) return
    if (!visibleInFiltered) reset()
    setHighlightId(scheduleParam)
    highlightTimer.current = setTimeout(() => setHighlightId(null), 1600)
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleParam, routes.length])

  useEffect(() => {
    if (!highlightId) return
    const el = document.getElementById(`schedule-${highlightId}`)
    if (!el) return
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'center',
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [highlightId, reduce])

  return (
    <section className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminKPICard
          label="Horários ativos hoje"
          value={ADMIN_SCHEDULE_SUMMARY.activeSchedulesToday.toLocaleString(
            'pt-BR',
          )}
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
        searchValue={filters.search}
        onSearchChange={(v) => setFilter('search', v)}
        searchPlaceholder="Buscar por rota, origem, destino, código ou cooperativa"
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <CooperativePicker
              value={filters.cooperativeId}
              onChange={(id) => setFilter('cooperativeId', id)}
              triggerClassName="min-h-9 w-44 text-xs"
            />

            {/* Filtro de data escondido — ver TODO(pr-ocorrencias) no defaults do useTableFilters. */}

            <StatusFilterChips
              options={[
                { value: 'in_operation', label: 'Em operação' },
                { value: 'delayed', label: 'Atrasado' },
                { value: 'cancelled', label: 'Cancelado' },
                { value: 'suspended', label: 'Suspenso' },
              ]}
              value={filters.status}
              onChange={(v) => setFilter('status', v)}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'min-h-9 gap-2 text-xs',
                    activeDays.length > 0 && 'border-primary text-primary',
                  )}
                >
                  {activeDays.length === 0
                    ? 'Dias da semana'
                    : `${activeDays.length} ${activeDays.length > 1 ? 'dias' : 'dia'}`}
                  {activeDays.length > 0 && (
                    <X
                      className="h-3 w-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFilter('days', [])
                      }}
                    />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                  Dias da semana
                </p>
                <WeekdayPicker
                  value={activeDays}
                  onChange={(days) => setFilter('days', days)}
                  presets={false}
                  mode="multi"
                />
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground min-h-9 gap-1.5 text-xs"
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
          <span className="text-muted-foreground text-[12px]">
            Filtrando pela rota:
          </span>
          <button
            onClick={clearRouteFilter}
            className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors"
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
              highlightedScheduleId={highlightId}
              reduce={reduce}
              onEditSchedule={(schedule) => openEditSchedule(route, schedule)}
              onDuplicateSchedule={(schedule) =>
                openDuplicateSchedule(route, schedule)
              }
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
          onSubmit={(routeId, values, mode) => {
            handleScheduleSubmit(routeId, values, mode)
            setScheduleForm(null)
          }}
        />
      )}
    </section>
  )
}
