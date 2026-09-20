import { ArrowRight, Plus, Route as RouteIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

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
import type { Route } from '@/lib/data/mock-routes'

import { getDriverName } from '../cooperative-data'
import { useCooperativeRoutes } from '../cooperative-queries'
import { routeStatusBadge } from '../cooperative-shared'

const PER_PAGE = 8

export function RoutesTab({ cooperative }: { cooperative: AdminCooperative }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { data: routes = [], isLoading } = useCooperativeRoutes(cooperative.id)

  const {
    filters: { search },
    setFilter,
    page,
    setPage,
  } = useTableFilters<{ search: string }>({ defaults: { search: '' } })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return routes
    return routes.filter((r) =>
      [r.name, r.code, r.origin, r.destination, getDriverName(r.driver_id)]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    )
  }, [routes, search])

  const paged = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const columns: AdminTableColumn<Route>[] = [
    {
      key: 'name',
      label: 'Rota',
      render: (r) => (
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{r.name}</p>
          {r.code && (
            <p className="text-muted-foreground text-[11px]">{r.code}</p>
          )}
        </div>
      ),
    },
    {
      key: 'path',
      label: 'Origem → Destino',
      hideOnMobile: true,
      render: (r) => (
        <span className="text-foreground inline-flex items-center gap-1.5 text-[13px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          {r.origin}
          <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
          <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
          {r.destination}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (r) => <StatusChip {...routeStatusBadge(r.status)} />,
    },
    {
      key: 'price',
      label: 'Preço',
      width: '90px',
      align: 'right',
      render: (r) => (
        <span className="text-foreground font-medium">
          {r.price ? `R$ ${r.price.toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'driver',
      label: 'Motorista',
      width: '150px',
      hideOnMobile: true,
      render: (r) => (
        <span className="text-muted-foreground text-[13px]">
          {getDriverName(r.driver_id) ?? '—'}
        </span>
      ),
    },
  ]

  if (!isLoading && routes.length === 0) {
    return (
      <AdminEmptyState
        icon={Plus}
        title="Nenhuma rota cadastrada"
        description={`${cooperative.name} ainda não possui rotas. Cadastre a primeira para começar.`}
        action={{
          label: 'Cadastrar rota',
          onClick: () =>
            navigate(`/admin/routes?new=1&cooperative=${cooperative.id}`),
          icon: Plus,
        }}
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
        searchPlaceholder="Buscar por rota, cidade ou motorista..."
      />

      <AdminTable
        columns={columns}
        data={paged}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        onRowClick={(r) => navigate(`/admin/routes?highlight=${r.id}`)}
        emptyState={
          <AdminEmptyState
            icon={RouteIcon}
            title="Nenhuma rota encontrada"
            description="Ajuste a busca para ver outras rotas."
          />
        }
      />

      <AdminPagination
        page={page}
        perPage={PER_PAGE}
        total={filtered.length}
        onPageChange={setPage}
      />
    </motion.div>
  )
}
