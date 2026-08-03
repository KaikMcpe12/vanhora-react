import { UserCheck, Users } from 'lucide-react'
import { useState } from 'react'

import {
  AdminEmptyState,
  AdminStat,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import type { User } from '@/lib/data/mock-users'
import { ViewUserModal } from '@/pages/app-portal/users/view-user-modal'

import { getCooperativeDrivers } from '../cooperative-data'
import { getInitials } from '../cooperative-shared'

export function DriversTab({ cooperative }: { cooperative: AdminCooperative }) {
  const drivers = getCooperativeDrivers(cooperative.id)
  const activeCount = drivers.filter((d) => d.status === 'active').length
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null)

  const columns: AdminTableColumn<User>[] = [
    {
      key: 'name',
      label: 'Motorista',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {getInitials(u.name)}
          </span>
          <span className="font-medium text-foreground">{u.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      hideOnMobile: true,
      render: (u) => (
        <span className="text-[13px] text-muted-foreground">{u.email}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (u) => (
        <AdminStatusBadge
          variant={u.status === 'active' ? 'success' : 'neutral'}
          label={u.status === 'active' ? 'Ativo' : 'Inativo'}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-lg">
        <AdminStat label="Total" value={drivers.length} icon={Users} />
        <AdminStat
          label="Ativos"
          value={activeCount}
          icon={UserCheck}
          tone="success"
        />
      </div>

      <AdminTable
        columns={columns}
        data={drivers}
        keyExtractor={(u) => u.id}
        onRowClick={(u) => setSelectedDriver(u)}
        emptyState={
          <AdminEmptyState
            icon={Users}
            title="Nenhum motorista vinculado"
            description={`${cooperative.name} ainda não possui motoristas cadastrados.`}
          />
        }
      />

      <ViewUserModal
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        user={selectedDriver}
      />
    </div>
  )
}
