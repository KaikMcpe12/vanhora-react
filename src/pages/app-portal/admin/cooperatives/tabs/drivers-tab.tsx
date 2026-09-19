import { Users } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'

import {
  AdminEmptyState,
  AdminFilterBar,
  AdminPagination,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { StatusChip } from '@/components/status-chip'
import { useTableFilters } from '@/hooks/use-table-filters'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import type { User } from '@/lib/data/mock-users'
import { USER_STATUS_META } from '@/lib/status/status-meta'
import { ViewUserModal } from '@/pages/app-portal/users/view-user-modal'

import { useCooperativeDrivers } from '../cooperative-queries'
import { formatShortDate, getInitials } from '../cooperative-shared'

const PER_PAGE = 8

export function DriversTab({ cooperative }: { cooperative: AdminCooperative }) {
  const reduce = useReducedMotion()
  const { data: drivers = [], isLoading } = useCooperativeDrivers(cooperative.id)
  const [selectedDriver, setSelectedDriver] = useState<User | null>(null)

  const {
    filters: { search },
    setFilter,
    page,
    setPage,
  } = useTableFilters<{ search: string }>({ defaults: { search: '' } })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return drivers
    return drivers.filter((u) =>
      [u.name, u.email].some((v) => v.toLowerCase().includes(q)),
    )
  }, [drivers, search])

  const paged = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const columns: AdminTableColumn<User>[] = [
    {
      key: 'name',
      label: 'Motorista',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
            {getInitials(u.name)}
          </span>
          <span className="text-foreground font-medium">{u.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      hideOnMobile: true,
      render: (u) => (
        <span className="text-muted-foreground text-[13px]">{u.email}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (u) => <StatusChip {...USER_STATUS_META[u.status]} />,
    },
    {
      key: 'createdAt',
      label: 'Criado em',
      width: '110px',
      align: 'right',
      hideOnMobile: true,
      render: (u) => (
        <span className="text-muted-foreground text-[13px]">
          {formatShortDate(u.createdAt)}
        </span>
      ),
    },
  ]

  if (!isLoading && drivers.length === 0) {
    return (
      <AdminEmptyState
        icon={Users}
        title="Nenhum motorista vinculado"
        description={`${cooperative.name} ainda não possui motoristas cadastrados.`}
      />
    )
  }

  return (
    <motion.div
      className="space-y-4"
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => setFilter('search', v)}
        searchPlaceholder="Buscar por nome ou email..."
      />

      <AdminTable
        columns={columns}
        data={paged}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        onRowClick={(u) => setSelectedDriver(u)}
        emptyState={
          <AdminEmptyState
            icon={Users}
            title="Nenhum motorista encontrado"
            description="Ajuste a busca para ver outros motoristas."
          />
        }
      />

      <AdminPagination
        page={page}
        perPage={PER_PAGE}
        total={filtered.length}
        onPageChange={setPage}
      />

      <ViewUserModal
        isOpen={!!selectedDriver}
        onClose={() => setSelectedDriver(null)}
        user={selectedDriver}
      />
    </motion.div>
  )
}
