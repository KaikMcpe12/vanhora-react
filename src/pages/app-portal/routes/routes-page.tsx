import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  PlayCircle,
  Plus,
  PowerOff,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminStatusBadge,
  StatusFilterChips,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  type AdminRouteRow,
  type RouteRowStatus,
  useRoutesList,
  useToggleRouteStatus,
} from '@/lib/api/mock-routes-api'
import { cn } from '@/lib/utils'
import {
  type AppPortalRole,
  type AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

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

const STATUS_BADGE_VARIANT: Record<
  RouteRowStatus,
  'success' | 'attention' | 'neutral'
> = {
  active: 'success',
  suspended: 'attention',
  inactive: 'neutral',
}

const STATUS_BORDER: Record<RouteRowStatus, string> = {
  active: 'border-l-emerald-500',
  suspended: 'border-l-amber-500',
  inactive: 'border-l-slate-400',
}

const ALL_STATUSES: RouteRowStatus[] = ['active', 'suspended', 'inactive']

const PAGE_SIZE = 6

export function RoutesPage() {
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const cooperativeParam = searchParams.get('cooperative') ?? ''

  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(ALL_STATUSES)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmRoute, setConfirmRoute] = useState<AdminRouteRow | null>(null)

  const { data: routes = [], isLoading } = useRoutesList()
  const toggleStatus = useToggleRouteStatus()

  const confirmIsReactivate =
    confirmRoute?.status === 'inactive' || confirmRoute?.status === 'suspended'

  const clearCooperativeFilter = () => {
    searchParams.delete('cooperative')
    setSearchParams(searchParams)
    setCurrentPage(1)
  }

  const kpiStats = useMemo(
    () => ({
      active: routes.filter((r) => r.status === 'active').length,
      suspended: routes.filter((r) => r.status === 'suspended').length,
      inactive: routes.filter((r) => r.status === 'inactive').length,
    }),
    [routes],
  )

  const filteredRoutes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const activeFilters = statusFilters as RouteRowStatus[]

    return routes.filter((route) => {
      if (activeFilters.length > 0 && !activeFilters.includes(route.status)) return false
      if (cooperativeParam && route.cooperativeName !== cooperativeParam) return false
      if (!q) return true
      return [route.name, route.code, route.origin, route.destination, route.cooperativeName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [routes, search, statusFilters, cooperativeParam])

  const totalPages = Math.ceil(filteredRoutes.length / PAGE_SIZE)

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRoutes.slice(start, start + PAGE_SIZE)
  }, [filteredRoutes, currentPage])

  const hasActiveFilters =
    Boolean(search.trim()) || statusFilters.length !== ALL_STATUSES.length

  const clearFilters = () => {
    setSearch('')
    setStatusFilters(ALL_STATUSES)
    setCurrentPage(1)
  }

  const goToEdit = (route: AdminRouteRow) =>
    navigate(`${basePath}/routes/${route.id}/edit`)

  const goToCreate = () =>
    navigate(
      cooperativeParam
        ? `${basePath}/routes/new?cooperative=${encodeURIComponent(cooperativeParam)}`
        : `${basePath}/routes/new`,
    )

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKPICard label="Rotas ativas" value={kpiStats.active} helper="em operação regular" icon={PlayCircle} />
        <AdminKPICard label="Rotas suspensas" value={kpiStats.suspended} helper="com revisão operacional" severity="attention" icon={PowerOff} />
        <AdminKPICard label="Rotas inativas" value={kpiStats.inactive} helper="sem operação hoje" icon={MapPin} />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        searchPlaceholder="Buscar rota por nome, origem ou destino"
        filters={
          <StatusFilterChips
            minOne
            options={ALL_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }))}
            value={statusFilters}
            onChange={(v) => {
              setStatusFilters(v)
              setCurrentPage(1)
            }}
          />
        }
        actions={
          <Button size="sm" className="gap-1.5" onClick={goToCreate}>
            <Plus className="h-3.5 w-3.5" />
            Nova rota
          </Button>
        }
      />

      {cooperativeParam && (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Filtrando por:</span>
          <button
            onClick={clearCooperativeFilter}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {cooperativeParam}
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {!isLoading && paginatedRoutes.length === 0 ? (
        <AdminEmptyState
          icon={MapPin}
          title={hasActiveFilters || cooperativeParam ? 'Nenhuma rota corresponde aos filtros' : 'Nenhuma rota cadastrada'}
          description={
            hasActiveFilters || cooperativeParam
              ? 'Ajuste os filtros ou limpe-os para ver todas as rotas.'
              : 'Comece cadastrando a primeira rota da plataforma.'
          }
          action={
            hasActiveFilters
              ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
              : { label: 'Nova rota', onClick: goToCreate, icon: Plus }
          }
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedRoutes.map((route) => {
              const schedulePath = `${basePath}/schedules?route=${route.code}`
              const isInactive = route.status === 'inactive'
              const isReactivate = route.status !== 'active'

              return (
                <article
                  key={route.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => goToEdit(route)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      goToEdit(route)
                    }
                  }}
                  className={cn(
                    'bg-card flex h-full cursor-pointer flex-col gap-4 rounded-xl border border-l-4 border-border p-5 transition-colors',
                    'hover:border-primary/40 hover:bg-accent/20 focus-visible:border-primary/40 focus-visible:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    STATUS_BORDER[route.status],
                    isInactive && 'opacity-70',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <AdminStatusBadge
                        variant={STATUS_BADGE_VARIANT[route.status]}
                        label={STATUS_LABEL[route.status]}
                      />
                      <div>
                        <h3 className="text-foreground text-base font-semibold">{route.name}</h3>
                        <p className="font-mono text-[11px] text-muted-foreground">{route.code}</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-semibold text-foreground">
                      R$ {route.price.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-[5px] h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="my-0.5 h-4 w-px bg-border" />
                        <span className="mb-[5px] h-2 w-2 rounded-full bg-red-500" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-foreground leading-6">{route.origin}</p>
                        <p className="text-muted-foreground leading-6">{route.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className={cn('text-sm', route.driverName ? 'text-foreground' : 'text-muted-foreground italic')}>
                        {route.driverName ?? 'Sem motorista'}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons (replaces three-dots) — stop card click */}
                  <div
                    className="mt-auto flex flex-wrap items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <Button size="sm" className="rounded-full" onClick={() => navigate(schedulePath)}>
                      <CalendarDays className="h-3.5 w-3.5" />
                      Horários
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full" onClick={() => goToEdit(route)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'rounded-full',
                        !isReactivate && 'text-destructive hover:text-destructive',
                      )}
                      onClick={() => setConfirmRoute(route)}
                    >
                      {isReactivate ? <PlayCircle className="h-3.5 w-3.5" /> : <PowerOff className="h-3.5 w-3.5" />}
                      {isReactivate ? 'Reativar' : 'Suspender'}
                    </Button>
                  </div>
                </article>
              )
            })}
          </section>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <Button variant="outline" size="sm" className="rounded-full" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" className="h-8 w-8 rounded-full p-0" onClick={() => setCurrentPage(page)}>
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" className="rounded-full" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      <AdminConfirmDialog
        open={confirmRoute !== null}
        onOpenChange={(open) => { if (!open) setConfirmRoute(null) }}
        title={confirmIsReactivate ? 'Reativar rota' : 'Suspender rota'}
        description={
          confirmIsReactivate
            ? `A rota "${confirmRoute?.name}" voltará a operar e a aparecer para os passageiros.`
            : `A rota "${confirmRoute?.name}" e seus ${confirmRoute?.scheduleCount} horários ficarão indisponíveis para os passageiros.`
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
              ? `Rota "${confirmRoute.name}" reativada`
              : `Rota "${confirmRoute.name}" suspensa`,
          )
          setConfirmRoute(null)
        }}
      />
    </section>
  )
}
