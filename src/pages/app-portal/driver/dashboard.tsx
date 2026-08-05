import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Route,
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
import {
  useDriverProfile,
  useDriverSchedulesToday,
} from '@/lib/api/mock-driver-portal-api'
import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

interface OutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

function getScheduleBadge(entry: DriverScheduleEntry) {
  if (entry.status === 'completed') return { variant: 'success' as const, label: 'Concluído' }
  if (entry.status === 'cancelled') return { variant: 'critical' as const, label: 'Cancelado' }
  if (entry.status === 'delayed')
    return {
      variant: 'attention' as const,
      label: entry.delayMinutes ? `Atrasado ${entry.delayMinutes}m` : 'Atrasado',
    }
  if (entry.status === 'on_time') return { variant: 'success' as const, label: 'No horário' }
  return { variant: 'info' as const, label: 'Programado' }
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[108px] rounded-xl" />
      ))}
    </div>
  )
}

export function DriverDashboardPage() {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()

  const { data: profile, isLoading: profileLoading } = useDriverProfile()
  const { data: schedules = [], isLoading: schedulesLoading } = useDriverSchedulesToday()

  const completedCount = schedules.filter((s) => s.status === 'completed').length
  const nextSchedule = schedules.find(
    (s) => s.status === 'scheduled' || s.status === 'on_time',
  )
  const totalPassengers = schedules
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.passengers, 0)

  const scheduleColumns: AdminTableColumn<DriverScheduleEntry>[] = [
    {
      key: 'time',
      label: 'Horário',
      width: '80px',
      render: (s) => (
        <span className="text-[13px] font-semibold text-foreground">
          {s.departureTime}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Rota',
      render: (s) => (
        <div>
          <p className="text-[13px] font-medium text-foreground">
            {s.routeCode} — {s.routeName}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.origin} → {s.destination}
          </p>
        </div>
      ),
    },
    {
      key: 'passengers',
      label: 'Passageiros',
      width: '110px',
      align: 'right',
      hideOnMobile: true,
      render: (s) => (
        <span className="text-[13px] text-muted-foreground">
          {s.status === 'scheduled' ? '—' : `${s.passengers}/${s.capacity}`}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (s) => <AdminStatusBadge {...getScheduleBadge(s)} />,
    },
  ]

  const isLoading = profileLoading || schedulesLoading

  return (
    <div className="space-y-10">
      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">
          Bem-vindo, {user.name.split(' ')[0]}
        </h2>
        <p className="text-sm text-muted-foreground">
          {profile ? `${profile.cooperativeName} · CNH ${profile.cnhType}` : 'Carregando...'}
        </p>
      </section>

      <section className="space-y-4">
        <AdminSectionTitle title="Resumo do dia" description="Dados da sua operação hoje" />
        {isLoading ? (
          <KpiSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <AdminKPICard
              label="Viagens hoje"
              value={schedules.length}
              icon={Route}
            />
            <AdminKPICard
              label="Concluídas"
              value={completedCount}
              icon={CheckCircle2}
            />
            <AdminKPICard
              label="Próxima saída"
              value={nextSchedule?.departureTime ?? '—'}
              helper={nextSchedule ? `${nextSchedule.routeCode}` : 'sem próximas'}
              icon={Clock3}
            />
            <AdminKPICard
              label="Passageiros"
              value={totalPassengers}
              helper="transportados hoje"
              icon={Users}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <AdminSectionTitle
          title="Horários de hoje"
          description="Todas as viagens programadas para o dia"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/driver/my-schedules')}
            >
              Ver detalhes →
            </Button>
          }
        />
        <AdminTable
          columns={scheduleColumns}
          data={schedules}
          keyExtractor={(s) => s.id}
          isLoading={schedulesLoading}
          emptyState={
            <AdminEmptyState
              icon={CalendarCheck2}
              title="Nenhuma viagem programada para hoje"
              description="Seu dia está livre ou os horários ainda não foram atribuídos."
            />
          }
        />
      </section>
    </div>
  )
}
