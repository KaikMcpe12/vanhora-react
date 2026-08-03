import {
  AlertTriangle,
  Building2,
  CalendarClock,
  Check,
  CheckCircle,
  CircleAlert,
  Clock,
  ExternalLink,
  RefreshCcw,
  Route,
  Star,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import {
  AdminActionMenu,
  AdminEmptyState,
  AdminKPICard,
  AdminSectionTitle,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdminDashboardStats } from '@/lib/api/mock-dashboard-api'
import type { DelayRecord, DepartureRecord } from '@/lib/data/mock-dashboard'
import { cn } from '@/lib/utils'

interface DashboardCriticalAlertProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  severity: 'attention' | 'critical'
}

function DashboardCriticalAlert({
  title,
  description,
  actionLabel,
  onAction,
  severity,
}: DashboardCriticalAlertProps) {
  const isAttention = severity === 'attention'

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border p-[18px]',
        isAttention
          ? 'border-amber-300 bg-amber-50/40 dark:border-amber-500/40 dark:bg-amber-500/5'
          : 'border-red-300 bg-red-50/40 dark:border-red-500/40 dark:bg-red-500/5',
      )}
    >
      <div className="flex items-start gap-3">
        {isAttention ? (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        )}
        <div>
          <p
            className={cn(
              'text-[14px] font-medium',
              isAttention
                ? 'text-amber-800 dark:text-amber-200'
                : 'text-red-800 dark:text-red-200',
            )}
          >
            {title}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onAction}
        className={cn(
          'shrink-0',
          isAttention
            ? 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/50 dark:text-amber-300 dark:hover:bg-amber-500/10'
            : 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/50 dark:text-red-300 dark:hover:bg-red-500/10',
        )}
      >
        {actionLabel}
      </Button>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-[108px] rounded-xl" />
      ))}
    </div>
  )
}

function getSeverityBadge(severity: 'low' | 'medium' | 'high') {
  if (severity === 'high') return { variant: 'critical' as const, label: 'Alta' }
  if (severity === 'medium') return { variant: 'attention' as const, label: 'Média' }
  return { variant: 'info' as const, label: 'Baixa' }
}

function getDepartureBadge(
  status: DepartureRecord['status'],
  delayMinutes?: number,
) {
  if (status === 'on_time') return { variant: 'success' as const, label: 'No horário' }
  if (status === 'cancelled') return { variant: 'critical' as const, label: 'Cancelado' }
  return {
    variant: 'attention' as const,
    label: delayMinutes ? `Atrasado ${delayMinutes}m` : 'Atrasado',
  }
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading, error, refetch } = useAdminDashboardStats()

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <AdminEmptyState
          icon={CircleAlert}
          title="Não conseguimos carregar os dados"
          description="Verifique a conexão e tente novamente."
          action={{
            label: 'Tentar novamente',
            onClick: () => refetch(),
            icon: RefreshCcw,
          }}
        />
      </div>
    )
  }

  const delayColumns: AdminTableColumn<DelayRecord>[] = [
    {
      key: 'route',
      label: 'Rota',
      render: (d) => (
        <span className="font-medium text-foreground">
          {d.routeCode} ({d.routeName})
        </span>
      ),
    },
    {
      key: 'cooperative',
      label: 'Cooperativa',
      render: (d) => (
        <span className="text-muted-foreground">{d.cooperativeName}</span>
      ),
    },
    {
      key: 'delay',
      label: 'Atraso',
      align: 'right',
      render: (d) => (
        <span className="font-semibold">{d.delayMinutes} min</span>
      ),
    },
    {
      key: 'reason',
      label: 'Motivo',
      render: (d) => (
        <span className="text-muted-foreground">{d.reason}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Severidade',
      render: (d) => {
        const badge = getSeverityBadge(d.severity)
        return <AdminStatusBadge variant={badge.variant} label={badge.label} />
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_d) => (
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <AdminActionMenu
            items={[
              {
                label: 'Abrir detalhes',
                icon: ExternalLink,
                onClick: () => navigate('/admin/delays'),
              },
              {
                label: 'Marcar como resolvido',
                icon: Check,
                onClick: () => {},
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const departureColumns: AdminTableColumn<DepartureRecord>[] = [
    {
      key: 'route',
      label: 'Rota',
      render: (d) => (
        <span className="font-medium text-foreground">
          {d.routeCode} ({d.routeName})
        </span>
      ),
    },
    {
      key: 'cooperative',
      label: 'Cooperativa',
      render: (d) => (
        <span className="text-muted-foreground">{d.cooperativeName}</span>
      ),
    },
    {
      key: 'departure',
      label: 'Partida',
      render: (d) => <span className="font-semibold">{d.departureTime}</span>,
    },
    {
      key: 'destination',
      label: 'Destino',
      render: (d) => (
        <span className="text-muted-foreground">{d.destination}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (d) => {
        const badge = getDepartureBadge(d.status, d.delayMinutes)
        return <AdminStatusBadge variant={badge.variant} label={badge.label} />
      },
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (_d) => (
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <AdminActionMenu
            items={[
              {
                label: 'Ver detalhes',
                icon: ExternalLink,
                onClick: () => navigate('/admin/schedules'),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-10">
      {!isLoading &&
        stats?.criticalAlerts.map((alert) => (
          <DashboardCriticalAlert
            key={alert.id}
            title={alert.title}
            description={alert.description}
            actionLabel="Ver atrasos"
            onAction={() => navigate(alert.actionPath)}
            severity={alert.severity}
          />
        ))}

      <section className="space-y-4">
        <AdminSectionTitle
          title="Rede em operação"
          description="Panorama operacional agora"
        />
        {isLoading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AdminKPICard
              label="Cooperativas Ativas"
              value={stats!.operationKpis.activeCooperatives.value}
              trend={stats!.operationKpis.activeCooperatives.trend}
              icon={Building2}
            />
            <AdminKPICard
              label="Rotas Ativas"
              value={stats!.operationKpis.activeRoutes.value}
              trend={stats!.operationKpis.activeRoutes.trend}
              icon={Route}
            />
            <AdminKPICard
              label="Horários de Hoje"
              value={stats!.operationKpis.todaySchedules.value}
              trend={stats!.operationKpis.todaySchedules.trend}
              icon={CalendarClock}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <AdminSectionTitle
          title="Qualidade e incidentes"
          description="Métricas dos últimos indicadores"
        />
        {isLoading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <AdminKPICard
              label="Atrasos (24h)"
              value={stats!.qualityKpis.delays24h.value}
              trend={stats!.qualityKpis.delays24h.trend}
              severity={stats!.qualityKpis.delays24h.severity}
              icon={Clock}
            />
            <AdminKPICard
              label="Avaliação Média Geral"
              value={stats!.qualityKpis.averageRating.value}
              trend={stats!.qualityKpis.averageRating.trend}
              severity={stats!.qualityKpis.averageRating.severity}
              icon={Star}
            />
            <AdminKPICard
              label="Atrasos Críticos (24h)"
              value={stats!.qualityKpis.criticalDelays24h.value}
              trend={stats!.qualityKpis.criticalDelays24h.trend}
              severity={stats!.qualityKpis.criticalDelays24h.severity}
              icon={CircleAlert}
            />
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <AdminSectionTitle
          title="Últimos atrasos reportados"
          description="Registros das últimas 24 horas"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/delays')}
            >
              Ver todos →
            </Button>
          }
        />
        <AdminTable
          columns={delayColumns}
          data={stats?.recentDelays ?? []}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          onRowClick={() => navigate('/admin/delays')}
          emptyState={
            <AdminEmptyState
              icon={CheckCircle}
              title="Nenhum atraso reportado nas últimas 24 horas"
              description="As rotas estão operando conforme o previsto."
            />
          }
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <AdminSectionTitle
          title="Próximas partidas"
          description="Saídas programadas nas próximas 2 horas"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/schedules')}
            >
              Ver todas →
            </Button>
          }
        />
        <AdminTable
          columns={departureColumns}
          data={stats?.upcomingDepartures ?? []}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          onRowClick={() => navigate('/admin/schedules')}
          emptyState={
            <AdminEmptyState
              icon={CalendarClock}
              title="Nenhuma partida programada nas próximas 2 horas"
            />
          }
        />
      </section>
    </div>
  )
}
