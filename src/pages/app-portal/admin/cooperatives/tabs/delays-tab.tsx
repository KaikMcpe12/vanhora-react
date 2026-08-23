import { CircleCheck, Clock } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'

import {
  AdminEmptyState,
  AdminFilterBar,
  AdminPagination,
  AdminTable,
  type AdminTableColumn,
} from '@/components/admin'
import { SeverityBadge } from '@/components/delays/severity-badge'
import { useTableFilters } from '@/hooks/use-table-filters'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import type { AdminDelay } from '@/lib/data/mock-admin-delays'
import { DelayDetailDialog } from '@/pages/app-portal/admin/delay-detail-dialog'

import { useCooperativeDelays } from '../cooperative-queries'
import { formatShortDate } from '../cooperative-shared'

const PER_PAGE = 8

const delayColor: Record<AdminDelay['severity'], string> = {
  low: 'text-emerald-600 dark:text-emerald-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
}

export function DelaysTab({ cooperative }: { cooperative: AdminCooperative }) {
  const reduce = useReducedMotion()
  const { data: delays = [], isLoading } = useCooperativeDelays(cooperative.id)
  const [selectedDelay, setSelectedDelay] = useState<AdminDelay | null>(null)

  const {
    filters: { search },
    setFilter,
    page,
    setPage,
  } = useTableFilters<{ search: string }>({ defaults: { search: '' } })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return delays
    return delays.filter((d) =>
      [d.routeName, d.routeCode, d.reason].some((v) =>
        v.toLowerCase().includes(q),
      ),
    )
  }, [delays, search])

  const paged = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const columns: AdminTableColumn<AdminDelay>[] = [
    {
      key: 'route',
      label: 'Rota',
      render: (d) => (
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{d.routeName}</p>
          <p className="text-muted-foreground text-[11px]">{d.routeCode}</p>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Data',
      width: '90px',
      hideOnMobile: true,
      render: (d) => (
        <span className="text-muted-foreground text-[13px]">
          {formatShortDate(d.reportedAt)}
        </span>
      ),
    },
    {
      key: 'delay',
      label: 'Atraso',
      width: '80px',
      align: 'right',
      render: (d) => (
        <span className={`font-semibold ${delayColor[d.severity]}`}>
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
      key: 'reason',
      label: 'Motivo',
      hideOnMobile: true,
      render: (d) => (
        <span className="text-muted-foreground line-clamp-1 text-[13px]">
          {d.reason}
        </span>
      ),
    },
  ]

  // "Sem atrasos" é boa notícia — celebrar visualmente.
  if (!isLoading && delays.length === 0) {
    return (
      <AdminEmptyState
        icon={CircleCheck}
        title="Nenhum atraso registrado"
        description={`${cooperative.name} não teve atrasos nos últimos 30 dias. ✓`}
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
        searchPlaceholder="Buscar por rota ou motivo..."
      />

      <AdminTable
        columns={columns}
        data={paged}
        keyExtractor={(d) => d.id}
        isLoading={isLoading}
        onRowClick={(d) => setSelectedDelay(d)}
        emptyState={
          <AdminEmptyState
            icon={Clock}
            title="Nenhum atraso encontrado"
            description="Ajuste a busca para ver outros atrasos."
          />
        }
      />

      <AdminPagination
        page={page}
        perPage={PER_PAGE}
        total={filtered.length}
        onPageChange={setPage}
      />

      <DelayDetailDialog
        delay={selectedDelay}
        onClose={() => setSelectedDelay(null)}
      />
    </motion.div>
  )
}
