import { AlertTriangle, CalendarCheck2, Sparkles, X } from 'lucide-react'

import {
  AdminEmptyState,
  AdminTable,
  type AdminTableColumn,
  StatusFilterChips,
} from '@/components/admin'
import {
  type Weekday,
  WeekdayPicker,
} from '@/components/pickers/weekday-picker'
import { StatusChip } from '@/components/status-chip'
import { useTableFilters } from '@/hooks/use-table-filters'
import { useDriverSchedulesWeekly } from '@/lib/api/mock-driver-portal-api'
import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'
import { DRIVER_SCHEDULE_STATUS_META } from '@/lib/status/status-meta'
import { cn } from '@/lib/utils'

const WEEKDAY_LABEL: Record<Weekday, string> = {
  seg: 'Seg',
  ter: 'Ter',
  qua: 'Qua',
  qui: 'Qui',
  sex: 'Sex',
  sab: 'Sáb',
  dom: 'Dom',
}

const STATUS_FILTER_OPTIONS = [
  { value: 'completed', label: 'Concluído' },
  { value: 'on_time', label: 'Em operação' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'cancelled', label: 'Cancelado' },
]

type Filters = {
  weekday: string
  status: string[]
}

const DEFAULTS: Filters = { weekday: '', status: [] }

function getScheduleBadge(entry: DriverScheduleEntry) {
  const meta = DRIVER_SCHEDULE_STATUS_META[entry.status]
  if (entry.status === 'delayed' && entry.delayMinutes)
    return { ...meta, label: `Atrasado ${entry.delayMinutes}m` }
  return meta
}

function normalizeStatus(
  s: DriverScheduleEntry['status'],
): DriverScheduleEntry['status'] {
  // `delayed` conta como "em operação" no filtro (mesmo grupo semântico).
  return s === 'delayed' ? 'on_time' : s
}

export function DriverMySchedulesPage() {
  const { data: schedules = [], isLoading } = useDriverSchedulesWeekly()
  const { filters, setFilter, reset } = useTableFilters<Filters>({
    defaults: DEFAULTS,
  })

  const weekdayFilter = filters.weekday as Weekday | ''
  const hasFilters = weekdayFilter !== '' || filters.status.length > 0

  const filtered = schedules.filter((s) => {
    if (weekdayFilter && !(s.activeDays ?? []).includes(weekdayFilter))
      return false
    if (filters.status.length > 0) {
      const norm = normalizeStatus(s.status)
      if (!filters.status.includes(norm)) return false
    }
    return true
  })

  const columns: AdminTableColumn<DriverScheduleEntry>[] = [
    {
      key: 'departure',
      label: 'Partida',
      width: '80px',
      render: (s) => (
        <span className="text-foreground text-[13px] font-semibold">
          {s.departureTime}
        </span>
      ),
    },
    {
      key: 'arrival',
      label: 'Chegada est.',
      width: '90px',
      hideOnMobile: true,
      render: (s) => (
        <span className="text-muted-foreground text-xs">
          {s.arrivalEstimate}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Rota',
      render: (s) => (
        <div className="space-y-1">
          <p className="text-foreground text-[13px] font-medium">
            {s.routeCode} — {s.routeName}
          </p>
          <p className="text-muted-foreground text-xs">
            {s.origin} → {s.destination}
          </p>
          {(s.hasOpenException || s.isTemporary) && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {s.hasOpenException && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800',
                    'dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200',
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />
                  Exceção aberta
                </span>
              )}
              {s.isTemporary && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700',
                    'dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200',
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  Serviço extra
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'days',
      label: 'Dias',
      width: '140px',
      hideOnMobile: true,
      render: (s) =>
        s.isTemporary ? (
          <span className="text-muted-foreground text-xs italic">Pontual</span>
        ) : (
          <span className="text-muted-foreground text-xs">
            {(s.activeDays ?? []).map((d) => WEEKDAY_LABEL[d]).join(' · ') ||
              '—'}
          </span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (s) => <StatusChip {...getScheduleBadge(s)} />,
    },
  ]

  const completedCount = filtered.filter((s) => s.status === 'completed').length

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <WeekdayPicker
          mode="single"
          presets={false}
          value={weekdayFilter ? [weekdayFilter] : []}
          onChange={(v) => setFilter('weekday', v[0] ?? '')}
        />
        <StatusFilterChips
          options={STATUS_FILTER_OPTIONS}
          value={filters.status}
          onChange={(v) => setFilter('status', v)}
        />
      </div>

      <AdminTable
        columns={columns}
        data={filtered}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        emptyState={
          <AdminEmptyState
            icon={hasFilters ? X : CalendarCheck2}
            title={
              hasFilters
                ? 'Nenhum horário nos filtros'
                : 'Nenhum horário atribuído'
            }
            description={
              hasFilters
                ? 'Ajuste os filtros para ver outros horários da sua semana.'
                : 'Você ainda não possui horários atribuídos. Entre em contato com sua cooperativa.'
            }
            action={
              hasFilters
                ? { label: 'Limpar filtros', onClick: reset, icon: X }
                : undefined
            }
          />
        }
      />

      {!isLoading && filtered.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {filtered.length}{' '}
          {filtered.length === 1 ? 'horário exibido' : 'horários exibidos'}
          {weekdayFilter ? ` · ${WEEKDAY_LABEL[weekdayFilter]}` : ''}
          {completedCount > 0 && !weekdayFilter
            ? ` · ${completedCount} concluídos hoje`
            : ''}
        </p>
      )}
    </section>
  )
}
