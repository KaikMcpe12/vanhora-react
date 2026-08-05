import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Timer,
  X,
} from 'lucide-react'
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from 'nuqs'
import { useMemo } from 'react'

import {
  AdminActionMenu,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
  StatusFilterChips,
} from '@/components/admin'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAdminDelay,
  useAdminDelays,
  useAdminDelayStats,
} from '@/lib/api/mock-delays-api'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'
import { MOCK_COOP_PORTAL_USER_ID } from '@/lib/data/mock-cooperative-portal'

import { DelayDetailDialog } from '../admin/delay-detail-dialog'

const DELAY_PERIODS = ['24h', '7d', '30d'] as const
type DelayPeriod = (typeof DELAY_PERIODS)[number]

const delayFilterParsers = {
  search: parseAsString.withDefault(''),
  period: parseAsStringLiteral(DELAY_PERIODS).withDefault('30d'),
  severity: parseAsString.withDefault(''),
  statusFilter: parseAsArrayOf(parseAsString).withDefault([]),
}

function getSeverityBadge(severity: AdminDelay['severity']) {
  if (severity === 'high') return { variant: 'critical' as const, label: 'Alta' }
  if (severity === 'medium') return { variant: 'attention' as const, label: 'Média' }
  return { variant: 'info' as const, label: 'Baixa' }
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateText(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export function CooperativeDelaysPage() {
  const [{ search, period, severity, statusFilter }, setFilters] =
    useQueryStates(delayFilterParsers)
  const [delayId, setDelayId] = useQueryState('delayId')

  const pendingStatusFilter = statusFilter.includes('pending') ? 'pending' : ''

  const filters = useMemo(
    () => ({
      search,
      period,
      severity: severity as AdminDelay['severity'] | '',
      // cooperativeId fixo — cooperativa só vê seus próprios atrasos
      cooperativeId: MOCK_COOP_PORTAL_USER_ID,
      status: pendingStatusFilter as 'pending' | 'resolved' | '',
    }),
    [search, period, severity, pendingStatusFilter],
  )

  const { data, isLoading } = useAdminDelays(filters)
  const { data: stats, isLoading: statsLoading } = useAdminDelayStats()
  const { data: selectedDelay = null, isLoading: delayDetailLoading } =
    useAdminDelay(delayId)

  const hasFilters =
    Boolean(search.trim()) ||
    severity !== '' ||
    statusFilter.length > 0 ||
    period !== '30d'

  function clearFilters() {
    setFilters({ search: '', severity: '', statusFilter: [], period: '30d' })
  }

  const columns: AdminTableColumn<AdminDelay>[] = [
    {
      key: 'reportedAt',
      label: 'Data/Hora',
      width: '120px',
      hideOnMobile: true,
      render: (d) => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(d.reportedAt)}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Rota',
      render: (d) => (
        <span className="text-[13px] font-medium text-foreground">
          {d.routeCode} — {d.routeName}
        </span>
      ),
    },
    {
      key: 'delay',
      label: 'Atraso',
      width: '90px',
      align: 'right',
      render: (d) => (
        <span className="text-[13px] font-semibold">{d.delayMinutes} min</span>
      ),
    },
    {
      key: 'reason',
      label: 'Motivo',
      hideOnMobile: true,
      render: (d) => (
        <span className="text-[13px] text-muted-foreground" title={d.reason}>
          {truncateText(d.reason, 45)}
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Severidade',
      width: '110px',
      render: (d) => <AdminStatusBadge {...getSeverityBadge(d.severity)} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (d) => (
        <AdminStatusBadge
          variant={d.status === 'resolved' ? 'success' : 'attention'}
          label={d.status === 'resolved' ? 'Resolvido' : 'Pendente'}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '48px',
      align: 'right',
      render: (d) => (
        <AdminActionMenu
          items={[
            {
              label: 'Ver detalhes',
              icon: Eye,
              onClick: () => setDelayId(d.id),
            },
          ]}
        />
      ),
    },
  ]

  return (
    <section className="space-y-6">
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[108px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <AdminKPICard
            label="Atrasos (24h)"
            value={stats?.delays24h ?? 0}
            helper="registrados hoje"
            icon={Clock}
          />
          <AdminKPICard
            label="Média de atraso"
            value={`${stats?.avgDelayMinutes ?? 0} min`}
            helper="nas últimas 24h"
            icon={Timer}
          />
          <AdminKPICard
            label="Críticos (24h)"
            value={stats?.criticalDelays24h ?? 0}
            severity="critical"
            helper="severidade alta"
            icon={AlertTriangle}
          />
          <AdminKPICard
            label="Taxa de resolução"
            value={`${stats?.resolutionRate ?? 0}%`}
            helper="atrasos investigados"
            icon={CheckCircle2}
          />
        </div>
      )}

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => setFilters({ search: v })}
        searchPlaceholder="Buscar por rota"
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={period}
              onValueChange={(v) => setFilters({ period: v as DelayPeriod })}
            >
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Última semana</SelectItem>
                <SelectItem value="30d">Último mês</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={severity || 'all'}
              onValueChange={(v) => setFilters({ severity: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>

            <StatusFilterChips
              options={[{ value: 'pending', label: 'Não resolvido' }]}
              value={statusFilter}
              onChange={(v) => setFilters({ statusFilter: v })}
            />
          </div>
        }
      />

      <AdminTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        onRowClick={(d) => setDelayId(d.id)}
        emptyState={
          <AdminEmptyState
            icon={hasFilters ? X : CheckCircle2}
            title={hasFilters ? 'Nenhum atraso nos filtros' : 'Sem atrasos reportados'}
            description={
              hasFilters
                ? 'Ajuste os filtros para ver mais registros.'
                : 'Nenhum atraso foi reportado no período selecionado.'
            }
            action={
              hasFilters
                ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
                : undefined
            }
          />
        }
      />

      {/* dialog somente leitura — cooperativa não pode resolver/reabrir */}
      <DelayDetailDialog
        delay={selectedDelay}
        isOpen={!!delayId}
        isLoadingDelay={delayDetailLoading}
        onClose={() => setDelayId(null)}
      />
    </section>
  )
}
