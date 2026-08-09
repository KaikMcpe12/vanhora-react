import { AlertTriangle, Clock, Timer } from 'lucide-react'
import { useState } from 'react'

import {
  AdminEmptyState,
  AdminStat,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { SeverityBadge } from '@/components/delays/severity-badge'
import { StatusChip } from '@/components/status-chip'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'
import { DELAY_STATUS_META } from '@/lib/status/status-meta'
import { DelayDetailDialog } from '@/pages/app-portal/admin/delay-detail-dialog'

import { getCooperativeDelays } from '../cooperative-data'

const delayColor = {
  low: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
}

export function DelaysTab({ cooperative }: { cooperative: AdminCooperative }) {
  const delays = getCooperativeDelays(cooperative.id)
  const pending = delays.filter((d) => d.status === 'pending').length
  const critical = delays.filter((d) => d.severity === 'high').length
  const avg = delays.length
    ? Math.round(delays.reduce((s, d) => s + d.delayMinutes, 0) / delays.length)
    : 0
  const [selectedDelay, setSelectedDelay] = useState<AdminDelay | null>(null)

  const columns: AdminTableColumn<AdminDelay>[] = [
    {
      key: 'route',
      label: 'Rota',
      render: (d) => (
        <div className="min-w-0">
          <p className="text-foreground truncate text-[13px] font-medium">
            {d.routeName}
          </p>
          <p className="text-muted-foreground text-[11px]">{d.routeCode}</p>
        </div>
      ),
    },
    {
      key: 'delay',
      label: 'Atraso',
      width: '90px',
      align: 'right',
      render: (d) => (
        <span className={`text-[13px] font-semibold ${delayColor[d.severity]}`}>
          {d.delayMinutes} min
        </span>
      ),
    },
    {
      key: 'severity',
      label: 'Severidade',
      width: '110px',
      render: (d) => <SeverityBadge severity={d.severity} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      hideOnMobile: true,
      render: (d) => <StatusChip {...DELAY_STATUS_META[d.status]} />,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStat
          label="Pendentes"
          value={String(pending)}
          icon={Clock}
          tone="attention"
        />
        <AdminStat label="Média" value={`${avg} min`} icon={Timer} />
        <AdminStat
          label="Críticos"
          value={String(critical)}
          icon={AlertTriangle}
          tone="critical"
        />
      </div>

      <AdminTable
        columns={columns}
        data={delays}
        keyExtractor={(d) => d.id}
        onRowClick={(d) => setSelectedDelay(d)}
        emptyState={
          <AdminEmptyState
            icon={Clock}
            title="Nenhum atraso registrado"
            description={`${cooperative.name} não possui atrasos no período.`}
          />
        }
      />

      <DelayDetailDialog
        delay={selectedDelay}
        onClose={() => setSelectedDelay(null)}
      />
    </div>
  )
}
