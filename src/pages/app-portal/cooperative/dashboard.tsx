import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Route,
  Star,
  Users,
} from 'lucide-react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import {
  AdminEmptyState,
  AdminKPICard,
  AdminSectionTitle,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoopPortalStats } from '@/lib/api/mock-cooperative-portal-api'
import { useAdminDelays } from '@/lib/api/mock-delays-api'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'
import { MOCK_COOP_PORTAL_USER_ID } from '@/lib/data/mock-cooperative-portal'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

interface OutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

function getSeverityBadge(severity: AdminDelay['severity']) {
  if (severity === 'high') return { variant: 'critical' as const, label: 'Alta' }
  if (severity === 'medium') return { variant: 'attention' as const, label: 'Média' }
  return { variant: 'info' as const, label: 'Baixa' }
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[108px] rounded-xl" />
      ))}
    </div>
  )
}

export function CooperativeDashboardPage() {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()

  const { data: stats, isLoading: statsLoading } = useCoopPortalStats()
  const { data: delaysData, isLoading: delaysLoading } = useAdminDelays({
    cooperativeId: MOCK_COOP_PORTAL_USER_ID,
    period: '24h',
  })

  const recentDelays = delaysData?.data.slice(0, 5) ?? []

  const delayColumns: AdminTableColumn<AdminDelay>[] = [
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
  ]

  return (
    <div className="space-y-10">
      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Bem-vindo, {user.name.split(' ')[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          Acompanhe o desempenho operacional da sua cooperativa.
        </p>
      </section>

      <section className="space-y-4">
        <AdminSectionTitle title="Visão geral" description="Dados operacionais do dia" />
        {statsLoading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <AdminKPICard
              label="Rotas Ativas"
              value={stats?.activeRoutes ?? 0}
              icon={Route}
            />
            <AdminKPICard
              label="Motoristas"
              value={stats?.totalDrivers ?? 0}
              icon={Users}
            />
            <AdminKPICard
              label="Horários Hoje"
              value={stats?.schedulesToday ?? 0}
              icon={Clock3}
            />
            <AdminKPICard
              label="Pontualidade"
              value={`${Math.round((stats?.onTimeRate ?? 0) * 100)}%`}
              helper="nos últimos 30 dias"
              icon={CheckCircle2}
            />
            <AdminKPICard
              label="Avaliação Média"
              value={stats?.avgRating ?? 0}
              icon={Star}
            />
            <AdminKPICard
              label="Atrasos Pendentes"
              value={stats?.pendingDelays ?? 0}
              severity={stats?.criticalDelays ? 'critical' : 'default'}
              helper="aguardando resolução"
              icon={AlertTriangle}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <AdminSectionTitle
          title="Atrasos recentes"
          description="Ocorrências da sua cooperativa nas últimas 24 horas"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/cooperative/delays')}
            >
              Ver todos →
            </Button>
          }
        />
        <AdminTable
          columns={delayColumns}
          data={recentDelays}
          keyExtractor={(d) => d.id}
          isLoading={delaysLoading}
          onRowClick={() => navigate('/cooperative/delays')}
          emptyState={
            <AdminEmptyState
              icon={CheckCircle2}
              title="Nenhum atraso nas últimas 24 horas"
              description="Sua cooperativa está operando dentro do esperado."
            />
          }
        />
      </section>
    </div>
  )
}
