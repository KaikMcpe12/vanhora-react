import { CalendarCheck2 } from 'lucide-react'

import {
  AdminEmptyState,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { StatusChip } from '@/components/status-chip'
import { useDriverSchedulesToday } from '@/lib/api/mock-driver-portal-api'
import type { DriverScheduleEntry } from '@/lib/data/mock-driver-portal'
import { DRIVER_SCHEDULE_STATUS_META } from '@/lib/status/status-meta'

function getScheduleBadge(entry: DriverScheduleEntry) {
  const meta = DRIVER_SCHEDULE_STATUS_META[entry.status]
  if (entry.status === 'delayed' && entry.delayMinutes)
    return { ...meta, label: `Atrasado ${entry.delayMinutes}m` }
  return meta
}

export function DriverMySchedulesPage() {
  const { data: schedules = [], isLoading } = useDriverSchedulesToday()

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
        <div>
          <p className="text-foreground text-[13px] font-medium">
            {s.routeCode} — {s.routeName}
          </p>
          <p className="text-muted-foreground text-xs">
            {s.origin} → {s.destination}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (s) => <StatusChip {...getScheduleBadge(s)} />,
    },
  ]

  const completedCount = schedules.filter(
    (s) => s.status === 'completed',
  ).length

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
        <p className="text-muted-foreground text-xs">
          {completedCount} de {schedules.length} viagens concluídas
        </p>
      )}
    </section>
  )
}
