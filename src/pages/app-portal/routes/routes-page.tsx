import {
  CalendarDays,
  Copy,
  LayoutGrid,
  MapPin,
  Pencil,
  PlayCircle,
  Plus,
  PowerOff,
  Rows3,
  UserRound,
  X,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  type AdminActionMenuItem,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminPagination,
  AdminTable,
  type AdminTableColumn,
  StatusFilterChips,
} from '@/components/admin'
import { CooperativePicker } from '@/components/pickers/cooperative-picker'
import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { useTableFilters } from '@/hooks/use-table-filters'
import {
  type AdminRouteRow,
  type RouteRowStatus,
  useRoutesList,
  useToggleRouteStatus,
} from '@/lib/api/mock-routes-api'
import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import { MOCK_USERS } from '@/lib/data/mock-users'
import type { RouteFormValues } from '@/lib/schemas/route-schema'
import { ROUTE_STATUS_META } from '@/lib/status/status-meta'
import { cn } from '@/lib/utils'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

import { RouteFormDrawer } from './route-form-drawer'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

const STATUS_LABEL: Record<RouteRowStatus, string> = {
  active: 'Ativa',
  suspended: 'Suspensa',
  inactive: 'Inativa',
}

const STATUS_BORDER: Record<RouteRowStatus, string> = {
  active: 'border-l-emerald-500',
  suspended: 'border-l-amber-500',
  inactive: 'border-l-slate-400',
}

const ALL_STATUSES: RouteRowStatus[] = ['active', 'suspended', 'inactive']
const PAGE_SIZE = 9
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Filters extends Record<string, unknown> {
  search: string
  status: string[]
  cooperative: string
  driver: string
  view: string // 'grid' | 'table'
}

type DrawerState =
  | { mode: 'create'; defaults?: Partial<RouteFormValues>; sourceCode?: string }
  | { mode: 'edit'; id: string }
  | null

function coopBrand(id: string): string {
  return (
    MOCK_ADMIN_COOPERATIVES.find((c) => c.id === id)?.brandColor ?? '#94a3b8'
  )
}

export function RoutesPage() {
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()

  const { filters, setFilter, setFilters, page, setPage } =
    useTableFilters<Filters>({
      defaults: {
        search: '',
        status: [],
        cooperative: '',
        driver: '',
        view: 'grid',
      },
    })

  // Compat: `?cooperative=<name>` legado (PR9 e antes) → reescreve para uuid.
  useEffect(() => {
    const raw = filters.cooperative
    if (!raw || UUID_RE.test(raw)) return
    const match = MOCK_ADMIN_COOPERATIVES.find((c) => c.name === raw)
    if (match) setFilter('cooperative', match.id)
    else setFilter('cooperative', '')
  }, [filters.cooperative, setFilter])

  const [drawerState, setDrawerState] = useState<DrawerState>(null)
  const [confirmRoute, setConfirmRoute] = useState<AdminRouteRow | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [sortState, setSortState] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const { data: routes = [], isLoading } = useRoutesList()
  const toggleStatus = useToggleRouteStatus()

  const view = (filters.view === 'table' ? 'table' : 'grid') as 'grid' | 'table'

  const driverOptions = useMemo(
    () =>
      MOCK_USERS.filter((u) => u.role === 'driver').map((u) => ({
        value: u.id,
        label: u.name,
      })),
    [],
  )

  const filteredRoutes = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    const statusSet = filters.status
    return routes.filter((route) => {
      if (statusSet.length > 0 && !statusSet.includes(route.status))
        return false
      if (filters.cooperative && route.cooperativeId !== filters.cooperative)
        return false
      if (filters.driver && route.driverId !== filters.driver) return false
      if (!q) return true
      return [
        route.name,
        route.code,
        route.origin,
        route.destination,
        route.cooperativeName,
        route.driverName ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [routes, filters])

  const sortedRoutes = useMemo(() => {
    if (!sortState || view !== 'table') return filteredRoutes
    const { key, direction } = sortState
    return [...filteredRoutes].sort((a, b) => {
      let ax: string | number = ''
      let bx: string | number = ''
      if (key === 'code') {
        ax = a.code
        bx = b.code
      } else if (key === 'name') {
        ax = a.name
        bx = b.name
      } else if (key === 'price') {
        ax = a.price
        bx = b.price
      } else if (key === 'status') {
        ax = a.status
        bx = b.status
      }
      if (ax === bx) return 0
      const cmp = ax < bx ? -1 : 1
      return direction === 'asc' ? cmp : -cmp
    })
  }, [filteredRoutes, sortState, view])

  const handleSort = (key: string) => {
    setSortState((s) => {
      if (!s || s.key !== key) return { key, direction: 'asc' }
      if (s.direction === 'asc') return { key, direction: 'desc' }
      return null
    })
  }

  const totalItems = sortedRoutes.length
  const paginatedRoutes = useMemo(
    () => sortedRoutes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [sortedRoutes, page],
  )

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status.length > 0 ||
    filters.cooperative !== '' ||
    filters.driver !== ''

  const clearFilters = () => {
    setFilters({ search: '', status: [], cooperative: '', driver: '' })
  }

  // Drawer sync com URL (?new=1, ?edit=<id>) — permite deep-link e refresh.
  const newParam = searchParams.get('new')
  const editParam = searchParams.get('edit')
  useEffect(() => {
    if (!routes.length && (newParam || editParam)) return
    if (newParam && (!drawerState || drawerState.mode !== 'create')) {
      setDrawerState({ mode: 'create' })
    } else if (editParam) {
      const route = routes.find((r) => r.id === editParam)
      if (
        route &&
        (!drawerState ||
          drawerState.mode !== 'edit' ||
          drawerState.id !== editParam)
      ) {
        setDrawerState({ mode: 'edit', id: editParam })
      }
    } else if (drawerState) {
      setDrawerState(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newParam, editParam, routes.length])

  const openCreate = (
    defaults?: Partial<RouteFormValues>,
    sourceCode?: string,
  ) => {
    setDrawerState({ mode: 'create', defaults, sourceCode })
    setSearchParams(
      (p) => {
        p.set('new', '1')
        p.delete('edit')
        return p
      },
      { replace: true },
    )
  }
  const openEdit = (route: AdminRouteRow) => {
    setDrawerState({ mode: 'edit', id: route.id })
    setSearchParams(
      (p) => {
        p.set('edit', route.id)
        p.delete('new')
        return p
      },
      { replace: true },
    )
  }
  const closeDrawer = () => {
    setDrawerState(null)
    setSearchParams(
      (p) => {
        p.delete('new')
        p.delete('edit')
        return p
      },
      { replace: true },
    )
  }

  // Sugestão de código na duplicação: `<CODE>-COPY` truncado a 12 chars;
  // se colide com existente, tenta -COPY-2, -COPY-3, …
  const buildDuplicateCode = (base: string): string => {
    const seed = base || 'R'
    const trunc = (s: string) => s.slice(0, 12)
    let attempt = trunc(`${seed}-COPY`)
    let n = 2
    while (routes.some((r) => r.code === attempt)) {
      attempt = trunc(`${seed}-COPY-${n}`)
      n++
    }
    return attempt
  }

  const openDuplicate = (source: AdminRouteRow) => {
    openCreate(
      {
        name: `${source.name} (cópia)`,
        code: buildDuplicateCode(source.code),
        cooperativeId: source.cooperativeId,
        origin: source.origin,
        destination: source.destination,
        price: source.price,
        activeDays: [...source.activeDays],
        driverName: source.driverName ?? '',
        status: 'inactive',
        stops: source.stops.map((s) => ({ city: s.city, time: s.time ?? '' })),
      },
      source.code,
    )
  }

  const rowActions = (route: AdminRouteRow): AdminActionMenuItem[] => {
    const isReactivate = route.status !== 'active'
    return [
      { label: 'Editar', icon: Pencil, onClick: () => openEdit(route) },
      { label: 'Duplicar', icon: Copy, onClick: () => openDuplicate(route) },
      {
        label: 'Horários',
        icon: CalendarDays,
        onClick: () => navigate(`${basePath}/schedules?route=${route.code}`),
      },
      { divider: true, label: '', onClick: () => {} },
      isReactivate
        ? {
            label: 'Reativar',
            icon: PlayCircle,
            onClick: () => setConfirmRoute(route),
          }
        : {
            label: 'Suspender',
            icon: PowerOff,
            onClick: () => setConfirmRoute(route),
            variant: 'danger',
          },
    ]
  }

  const confirmIsReactivate =
    confirmRoute?.status === 'inactive' || confirmRoute?.status === 'suspended'

  // Highlight: `?highlight=<uuid>` navega da aba Rotas em /admin/cooperatives.
  // Ao carregar, salta para a página onde o item está, dispara pulse 1.6s, e
  // remove o param sem reload — refresh subsequente não repulsa.
  const highlightParam = searchParams.get('highlight')
  useEffect(() => {
    if (!highlightParam || !routes.length) return
    const idx = filteredRoutes.findIndex((r) => r.id === highlightParam)
    setSearchParams(
      (p) => {
        p.delete('highlight')
        return p
      },
      { replace: true },
    )
    if (idx === -1) return
    const targetPage = Math.floor(idx / PAGE_SIZE)
    if (page !== targetPage) setPage(targetPage)
    setHighlightId(highlightParam)
    const t = setTimeout(() => setHighlightId(null), 1600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightParam, routes.length])

  useEffect(() => {
    if (!highlightId) return
    const el = document.getElementById(`route-${highlightId}`)
    if (!el) return
    // esperar layout: um frame é suficiente após mudança de página/view
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'center',
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [highlightId, view, page, reduce])

  const activeCoop = filters.cooperative
    ? MOCK_ADMIN_COOPERATIVES.find((c) => c.id === filters.cooperative)
    : null

  const activeDriverName = filters.driver
    ? driverOptions.find((d) => d.value === filters.driver)?.label
    : null

  const columns: AdminTableColumn<AdminRouteRow>[] = [
    {
      key: 'code',
      label: 'Código',
      width: '110px',
      sortable: true,
      render: (r) => (
        <span className="text-foreground font-mono text-[13px]">{r.code}</span>
      ),
    },
    {
      key: 'name',
      label: 'Rota',
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="text-foreground truncate font-medium">{r.name}</p>
          <p className="text-muted-foreground truncate text-[11px]">
            {r.origin} → {r.destination}
          </p>
        </div>
      ),
    },
    {
      key: 'cooperative',
      label: 'Cooperativa',
      hideOnMobile: true,
      render: (r) => (
        <span className="text-foreground inline-flex items-center gap-2 text-[13px]">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: coopBrand(r.cooperativeId) }}
          />
          <span className="truncate">{r.cooperativeName}</span>
        </span>
      ),
    },
    {
      key: 'driver',
      label: 'Motorista',
      hideOnMobile: true,
      render: (r) => (
        <span className="text-muted-foreground text-[13px]">
          {r.driverName ?? '—'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Preço',
      width: '110px',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span className="text-foreground font-medium tabular-nums">
          R$ {r.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      sortable: true,
      render: (r) => <StatusChip {...ROUTE_STATUS_META[r.status]} />,
    },
    {
      key: 'actions',
      label: '',
      width: '52px',
      render: (r) => <AdminActionMenu items={rowActions(r)} />,
    },
  ]

  return (
    <section className="space-y-5">
      <AdminFilterBar
        searchValue={filters.search}
        onSearchChange={(v) => setFilter('search', v)}
        searchPlaceholder="Buscar por nome, código, origem ou destino"
        filters={
          <>
            <StatusFilterChips
              options={ALL_STATUSES.map((s) => ({
                value: s,
                label: STATUS_LABEL[s],
              }))}
              value={filters.status}
              onChange={(v) => setFilter('status', v)}
            />
            <CooperativePicker
              value={filters.cooperative}
              onChange={(v) => setFilter('cooperative', v)}
              allowAll
              placeholder="Todas as cooperativas"
              triggerClassName="w-56"
            />
            <SearchableSelect
              value={filters.driver || null}
              onChange={(v) => setFilter('driver', v ?? '')}
              options={driverOptions}
              placeholder="Motorista"
              allLabel="Todos os motoristas"
              triggerClassName="w-52"
              searchPlaceholder="Buscar motorista..."
            />
            <ViewToggle value={view} onChange={(v) => setFilter('view', v)} />
          </>
        }
        actions={
          <Button
            size="sm"
            className="min-h-11 gap-1.5"
            onClick={() => openCreate()}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova rota
          </Button>
        }
      />

      {hasActiveFilters && (
        <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[12px]">
          <span>Filtrando por:</span>
          {activeCoop && (
            <FilterPill
              label={activeCoop.name}
              onClear={() => setFilter('cooperative', '')}
            />
          )}
          {activeDriverName && (
            <FilterPill
              label={activeDriverName}
              onClear={() => setFilter('driver', '')}
            />
          )}
          {filters.status.map((s) => (
            <FilterPill
              key={s}
              label={STATUS_LABEL[s as RouteRowStatus]}
              onClear={() =>
                setFilter(
                  'status',
                  filters.status.filter((x) => x !== s),
                )
              }
            />
          ))}
          <button
            onClick={clearFilters}
            className="text-primary hover:text-primary/80 ml-1 text-[12px] font-medium underline-offset-2 hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      )}

      {!isLoading && paginatedRoutes.length === 0 ? (
        <AdminEmptyState
          icon={MapPin}
          title={
            hasActiveFilters
              ? 'Nenhuma rota corresponde aos filtros'
              : 'Nenhuma rota cadastrada'
          }
          description={
            hasActiveFilters
              ? 'Ajuste ou limpe os filtros para ver todas as rotas.'
              : 'Comece cadastrando a primeira rota da plataforma.'
          }
          action={
            hasActiveFilters
              ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
              : {
                  label: 'Nova rota',
                  onClick: () => openCreate(),
                  icon: Plus,
                }
          }
        />
      ) : (
        <>
          {view === 'grid' ? (
            <RoutesGrid
              routes={paginatedRoutes}
              highlightId={highlightId}
              reduce={!!reduce}
              onOpenEdit={openEdit}
              rowActions={rowActions}
            />
          ) : (
            <RoutesTable
              routes={paginatedRoutes}
              columns={columns}
              isLoading={isLoading}
              sortState={sortState}
              onSort={handleSort}
              onRowClick={openEdit}
              reduce={!!reduce}
            />
          )}

          <AdminPagination
            page={page}
            perPage={PAGE_SIZE}
            total={totalItems}
            onPageChange={setPage}
          />
        </>
      )}

      <RouteFormDrawer
        state={drawerState}
        onClose={closeDrawer}
        basePath={basePath}
        onSaved={(saved, wasCreate) => {
          toast.success(
            wasCreate
              ? `Rota "${saved.name}" criada com sucesso.`
              : 'Alterações salvas.',
          )
          closeDrawer()
        }}
      />

      <AdminConfirmDialog
        open={confirmRoute !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmRoute(null)
        }}
        title={confirmIsReactivate ? 'Reativar rota' : 'Suspender rota'}
        description={
          confirmIsReactivate
            ? `A rota "${confirmRoute?.name}" voltará a operar e a aparecer para os passageiros.`
            : `A rota "${confirmRoute?.name}" e seus ${confirmRoute?.scheduleCount ?? 0} horários ficarão indisponíveis para os passageiros.`
        }
        confirmLabel={confirmIsReactivate ? 'Reativar' : 'Suspender'}
        variant={confirmIsReactivate ? 'default' : 'danger'}
        tone={confirmIsReactivate ? 'neutral' : 'warning'}
        onConfirm={async () => {
          if (!confirmRoute) return
          await toggleStatus.mutateAsync({
            id: confirmRoute.id,
            newStatus: confirmIsReactivate ? 'active' : 'suspended',
          })
          toast.success(
            confirmIsReactivate
              ? `Rota "${confirmRoute.name}" reativada.`
              : `Rota "${confirmRoute.name}" suspensa.`,
          )
          setConfirmRoute(null)
        }}
      />
    </section>
  )
}

// ─── Subcomponentes ─────────────────────────────────────────────────────────

interface ViewToggleProps {
  value: 'grid' | 'table'
  onChange: (v: 'grid' | 'table') => void
}

function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="Alternar visualização"
      className="border-border bg-background inline-flex items-center gap-0.5 rounded-md border p-0.5"
    >
      <button
        role="tab"
        aria-selected={value === 'grid'}
        aria-label="Grade"
        onClick={() => onChange('grid')}
        className={cn(
          'inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-xs font-medium transition-colors',
          'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
          value === 'grid'
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grade</span>
      </button>
      <button
        role="tab"
        aria-selected={value === 'table'}
        aria-label="Tabela"
        onClick={() => onChange('table')}
        className={cn(
          'inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-xs font-medium transition-colors',
          'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
          value === 'table'
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Rows3 className="h-4 w-4" />
        <span className="sr-only">Tabela</span>
      </button>
    </div>
  )
}

function FilterPill({
  label,
  onClear,
}: {
  label: string
  onClear: () => void
}) {
  return (
    <button
      onClick={onClear}
      className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors"
    >
      {label}
      <X className="h-3 w-3" />
    </button>
  )
}

interface RoutesGridProps {
  routes: AdminRouteRow[]
  highlightId: string | null
  reduce: boolean
  onOpenEdit: (route: AdminRouteRow) => void
  rowActions: (route: AdminRouteRow) => AdminActionMenuItem[]
}

function RoutesGrid({
  routes,
  highlightId,
  reduce,
  onOpenEdit,
  rowActions,
}: RoutesGridProps) {
  return (
    <motion.section
      key="grid"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {routes.map((route, i) => {
        const isInactive = route.status === 'inactive'
        const isHighlighted = highlightId === route.id
        return (
          <motion.article
            key={route.id}
            id={`route-${route.id}`}
            role="button"
            tabIndex={0}
            aria-label={`${route.name} — ${STATUS_LABEL[route.status]}`}
            onClick={() => onOpenEdit(route)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenEdit(route)
              }
            }}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={
              isHighlighted && !reduce
                ? {
                    opacity: 1,
                    y: 0,
                    boxShadow: [
                      '0 0 0 0 rgba(59,130,246,0.0)',
                      '0 0 0 4px rgba(59,130,246,0.35)',
                      '0 0 0 0 rgba(59,130,246,0.0)',
                      '0 0 0 4px rgba(59,130,246,0.35)',
                      '0 0 0 0 rgba(59,130,246,0.0)',
                    ],
                  }
                : { opacity: 1, y: 0 }
            }
            transition={{
              duration: isHighlighted && !reduce ? 1.6 : 0.18,
              delay: reduce ? 0 : Math.min(i * 0.03, 0.18),
            }}
            className={cn(
              'bg-card border-border flex h-full cursor-pointer flex-col gap-4 rounded-xl border border-l-4 p-5 transition-colors',
              'hover:border-primary/40 hover:bg-accent/20 focus-visible:border-primary/40 focus-visible:bg-accent/20 focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              STATUS_BORDER[route.status],
              isInactive && 'opacity-70',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <StatusChip {...ROUTE_STATUS_META[route.status]} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-foreground truncate text-base font-semibold">
                    {route.name}
                  </h3>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    {route.code}
                  </p>
                </div>
              </div>
              <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="flex items-start gap-2"
              >
                <span className="text-foreground text-[13px] font-semibold tabular-nums">
                  R$ {route.price.toFixed(2)}
                </span>
                <AdminActionMenu items={rowActions(route)} />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: coopBrand(route.cooperativeId) }}
                />
                <span className="text-muted-foreground truncate text-[12px]">
                  {route.cooperativeName}
                </span>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-x-3">
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden
                    className="mt-[5px] h-2 w-2 rounded-full bg-emerald-500"
                  />
                  <span className="bg-border my-0.5 h-4 w-px" />
                  <span
                    aria-hidden
                    className="mb-[5px] h-2 w-2 rounded-full bg-red-500"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-foreground truncate leading-6">
                    {route.origin}
                  </p>
                  <p className="text-muted-foreground truncate leading-6">
                    {route.destination}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserRound className="text-muted-foreground h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    'truncate text-sm',
                    route.driverName
                      ? 'text-foreground'
                      : 'text-muted-foreground italic',
                  )}
                >
                  {route.driverName ?? 'Sem motorista'}
                </span>
              </div>
            </div>
          </motion.article>
        )
      })}
    </motion.section>
  )
}

interface RoutesTableProps {
  routes: AdminRouteRow[]
  columns: AdminTableColumn<AdminRouteRow>[]
  isLoading: boolean
  sortState: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
  onRowClick: (r: AdminRouteRow) => void
  reduce: boolean
}

function RoutesTable({
  routes,
  columns,
  isLoading,
  sortState,
  onSort,
  onRowClick,
  reduce,
}: RoutesTableProps) {
  return (
    <motion.div
      key="table"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
    >
      <AdminTable
        columns={columns}
        data={routes}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        onRowClick={onRowClick}
        sortState={sortState ?? undefined}
        onSort={onSort}
      />
    </motion.div>
  )
}
