import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RotateCcw,
  Route,
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
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

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
  useReopenDelay,
  useResolveDelay,
} from '@/lib/api/mock-delays-api'
import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'

import { DelayDetailDialog } from './delay-detail-dialog'

const DELAY_PERIODS = ['24h', '7d', '30d'] as const
type DelayPeriod = (typeof DELAY_PERIODS)[number]

// parsers para os filtros persistidos na url
const delayFilterParsers = {
  search: parseAsString.withDefault(''),
  period: parseAsStringLiteral(DELAY_PERIODS).withDefault('30d'),
  severity: parseAsString.withDefault(''),
  cooperativeId: parseAsString.withDefault(''),
  statusFilter: parseAsArrayOf(parseAsString).withDefault([]),
}

function getSeverityBadge(severity: AdminDelay['severity']) {
  if (severity === 'high') return { variant: 'critical' as const, label: 'Alta' }
  if (severity === 'medium') return { variant: 'attention' as const, label: 'Média' }
  return { variant: 'info' as const, label: 'Baixa' }
}

function formatDateTime(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateText(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export function AdminDelaysPage() {
  const navigate = useNavigate()

  const [{ search, period, severity, cooperativeId, statusFilter }, setFilters] =
    useQueryStates(delayFilterParsers)
  // delayId controla qual dialog está aberto — fechar remove só ele, filtros permanecem
  const [delayId, setDelayId] = useQueryState('delayId')

  const resolveDelay = useResolveDelay()
  const reopenDelay = useReopenDelay()

  const pendingStatusFilter = statusFilter.includes('pending') ? 'pending' : ''

  const filters = useMemo(
    () => ({
      search,
      period,
      severity: severity as AdminDelay['severity'] | '',
      cooperativeId,
      status: pendingStatusFilter as 'pending' | 'resolved' | '',
    }),
    [search, period, severity, cooperativeId, pendingStatusFilter],
  )

  const { data, isLoading } = useAdminDelays(filters)
  const { data: stats, isLoading: statsLoading } = useAdminDelayStats()
  // fetch dedicado por id — independente da paginação/filtros da lista
  const { data: selectedDelay = null, isLoading: delayDetailLoading } = useAdminDelay(delayId)

  const hasFilters =
    Boolean(search.trim()) ||
    severity !== '' ||
    cooperativeId !== '' ||
    statusFilter.length > 0 ||
    period !== '30d'

  const cooperativeOptions = MOCK_ADMIN_COOPERATIVES.filter((c) => c.status !== 'inactive')

  async function handleResolve(id: string) {
    await resolveDelay.mutateAsync(id)
    toast.success('Atraso marcado como resolvido')
  }

  async function handleReopen(id: string) {
    await reopenDelay.mutateAsync(id)
    toast.success('Atraso reaberto')
  }

  function clearFilters() {
    setFilters({ search: '', severity: '', cooperativeId: '', statusFilter: [], period: '30d' })
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
        <span className="font-medium text-foreground text-[13px]">
          {d.routeCode} — {d.routeName}
        </span>
      ),
    },
    {
      key: 'cooperative',
      label: 'Cooperativa',
      hideOnMobile: true,
      render: (d) => (
        <span className="text-[13px] text-muted-foreground">{d.cooperativeName}</span>
      ),
    },
    {
      key: 'delay',
      label: 'Atraso',
      width: '90px',
      align: 'right',
      render: (d) => (
        <span className="font-semibold text-[13px]">{d.delayMinutes} min</span>
      ),
    },
    {
      key: 'reason',
      label: 'Motivo',
      hideOnMobile: true,
      render: (d) => (
        <span
          className="text-[13px] text-muted-foreground"
          title={d.reason}
        >
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
            {
              label: 'Ver rota',
              icon: Route,
              onClick: () => navigate('/admin/routes'),
            },
            { divider: true, label: '', onClick: () => {} },
            d.status === 'pending'
              ? {
                  label: 'Marcar como resolvido',
                  icon: CheckCircle2,
                  onClick: () => handleResolve(d.id),
                }
              : {
                  label: 'Reabrir',
                  icon: RotateCcw,
                  onClick: () => handleReopen(d.id),
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
        searchPlaceholder="Buscar por rota ou cooperativa"
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

            <Select
              value={cooperativeId || 'all'}
              onValueChange={(v) => setFilters({ cooperativeId: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue placeholder="Cooperativa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {cooperativeOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
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
                : 'Nenhum atraso foi reportado no período selecionado. As rotas estão operando conforme previsto.'
            }
            action={
              hasFilters
                ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
                : undefined
            }
          />
        }
      />

      <DelayDetailDialog
        delay={selectedDelay}
        isOpen={!!delayId}
        isLoadingDelay={delayDetailLoading}
        onClose={() => setDelayId(null)}
        onResolve={handleResolve}
        onReopen={handleReopen}
        isResolving={resolveDelay.isPending || reopenDelay.isPending}
      />
    </section>
  )
}
