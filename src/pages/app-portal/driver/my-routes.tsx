import { Clock3, Route } from 'lucide-react'

import {
  AdminEmptyState,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { StatusChip } from '@/components/status-chip'
import { useDriverRoutes } from '@/lib/api/mock-driver-portal-api'
import type { DriverRoute } from '@/lib/data/mock-driver-portal'
import { ROUTE_STATUS_META } from '@/lib/status/status-meta'

export function DriverMyRoutesPage() {
  const { data: routes = [], isLoading } = useDriverRoutes()

  const columns: AdminTableColumn<DriverRoute>[] = [
    {
      key: 'code',
      label: 'Código',
      width: '80px',
      render: (r) => (
        <span className="text-foreground text-[13px] font-medium">
          {r.code}
        </span>
      ),
    },
    {
      key: 'route',
      label: 'Rota',
      render: (r) => (
        <div>
          <p className="text-foreground text-[13px] font-medium">{r.name}</p>
          <p className="text-muted-foreground text-xs">
            {r.origin} → {r.destination}
          </p>
        </div>
      ),
    },
    {
      key: 'schedulesToday',
      label: 'Viagens hoje',
      width: '110px',
      align: 'right',
      hideOnMobile: true,
      render: (r) => (
        <div className="flex items-center justify-end gap-1 text-[13px]">
          <Clock3 className="text-muted-foreground h-3.5 w-3.5" />
          <span>{r.schedulesTodayCount}</span>
        </div>
      ),
    },
    {
      key: 'nextDeparture',
      label: 'Próxima saída',
      width: '110px',
      hideOnMobile: true,
      render: (r) => (
        <span className="text-muted-foreground text-[13px]">
          {r.nextDeparture ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '100px',
      render: (r) => <StatusChip {...ROUTE_STATUS_META[r.status]} />,
    },
  ]

  return (
    <section className="space-y-6">
      <AdminTable
        columns={columns}
        data={routes}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyState={
          <AdminEmptyState
            icon={Route}
            title="Nenhuma rota atribuída"
            description="Você ainda não possui rotas atribuídas. Entre em contato com sua cooperativa."
          />
        }
      />

      {!isLoading && routes.length > 0 && (
        <p className="text-muted-foreground text-xs">
          {routes.filter((r) => r.status === 'active').length} de{' '}
          {routes.length} rotas ativas
        </p>
      )}
    </section>
  )
}
