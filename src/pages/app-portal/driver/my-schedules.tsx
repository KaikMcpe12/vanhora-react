import { CalendarCheck2 } from 'lucide-react'

import {
  AdminEmptyState,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { useDriverSchedulesToday } from '@/lib/api/mock-driver-portal-api'
import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'

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

export function DriverMySchedulesPage() {
  const { data: schedules = [], isLoading } = useDriverSchedulesToday()

  const columns: AdminTableColumn<DriverScheduleEntry>[] = [
    {
      key: 'departure',
      label: 'Partida',
      width: '80px',
      render: (s) => (
        <span className="text-[13px] font-semibold text-foreground">{s.departureTime}</span>
      ),
    },
    {
      key: 'arrival',
      label: 'Chegada est.',
      width: '90px',
      hideOnMobile: true,
      render: (s) => (
        <span className="text-xs text-muted-foreground">{s.arrivalEstimate}</span>
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

  const completedCount = schedules.filter((s) => s.status === 'completed').length
  const totalPassengers = schedules
    .filter((s) => s.status === 'completed')
    .reduce((sum, s) => sum + s.passengers, 0)

  return (
    <section className="space-y-6">
      <AdminTable
        columns={columns}
        data={schedules}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        emptyState={
          <AdminEmptyState
            icon={CalendarCheck2}
            title="Nenhuma viagem hoje"
            description="Nenhuma viagem foi programada para você neste dia."
          />
        }
      />

      {!isLoading && schedules.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {completedCount} de {schedules.length} viagens concluídas ·{' '}
          {totalPassengers} passageiros transportados
        </p>
      )}
    </section>
  )
}
