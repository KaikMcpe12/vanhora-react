import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlayCircle,
  Plus,
  PowerOff,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminStatusBadge,
  StatusFilterChips,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  type AppPortalRole,
  type AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

type RouteStatus = 'active' | 'inactive' | 'suspended'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

interface RouteCardView {
  id: string
  name: string
  code?: string
  cooperativeName?: string
  origin: string
  destination: string
  status: RouteStatus
  scheduleCount: number
  driverName?: string
}

const STATUS_LABEL: Record<RouteStatus, string> = {
  active: 'Ativa',
  suspended: 'Suspensa',
  inactive: 'Inativa',
}

const STATUS_BADGE_VARIANT: Record<
  RouteStatus,
  'success' | 'attention' | 'neutral'
> = {
  active: 'success',
  suspended: 'attention',
  inactive: 'neutral',
}

const ALL_STATUSES: RouteStatus[] = ['active', 'suspended', 'inactive']

const ROUTES: RouteCardView[] = [
  {
    id: 'route-expresso-norte',
    name: 'Expresso Norte',
    code: 'R-204',
    cooperativeName: 'Metro Transportes',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    status: 'active',
    scheduleCount: 3,
    driverName: 'João Silva',
  },
  {
    id: 'route-linha-sul',
    name: 'Linha Sul Express',
    code: 'R-319',
    cooperativeName: 'Expresso São Francisco',
    origin: 'Praça da Sé',
    destination: 'Aeroporto Int.',
    status: 'suspended',
    scheduleCount: 2,
  },
  {
    id: 'route-trans-leste',
    name: 'Trans Leste',
    code: 'R-402',
    cooperativeName: 'Metro Transportes',
    origin: 'Vila Maria',
    destination: 'Centro Empresarial',
    status: 'active',
    scheduleCount: 4,
    driverName: 'Marcos Oliveira',
  },
  {
    id: 'route-noturna-a',
    name: 'Rota Noturna A',
    code: 'N-07',
    cooperativeName: 'Cooperativa Vale',
    origin: 'Campus Univ.',
    destination: 'Estação Metro',
    status: 'inactive',
    scheduleCount: 1,
  },
]

const PAGE_SIZE = 6

export function RoutesPage() {
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(ALL_STATUSES)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmRoute, setConfirmRoute] = useState<RouteCardView | null>(null)

  const confirmIsReactivate =
    confirmRoute?.status === 'inactive' || confirmRoute?.status === 'suspended'

  const kpiStats = useMemo(() => {
    return {
      active: ROUTES.filter((r) => r.status === 'active').length,
      suspended: ROUTES.filter((r) => r.status === 'suspended').length,
      inactive: ROUTES.filter((r) => r.status === 'inactive').length,
    }
  }, [])

  const filteredRoutes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const activeFilters = statusFilters as RouteStatus[]

    return ROUTES.filter((route) => {
      if (activeFilters.length > 0 && !activeFilters.includes(route.status)) return false
      if (!q) return true
      return [route.name, route.code, route.origin, route.destination, route.cooperativeName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [search, statusFilters])

  const totalPages = Math.ceil(filteredRoutes.length / PAGE_SIZE)

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRoutes.slice(start, start + PAGE_SIZE)
  }, [filteredRoutes, currentPage])

  const hasActiveFilters = Boolean(search.trim()) || statusFilters.length !== ALL_STATUSES.length

  const clearFilters = () => {
    setSearch('')
    setStatusFilters(ALL_STATUSES)
    setCurrentPage(1)
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKPICard
          label="Rotas ativas"
          value={kpiStats.active}
          helper="em operação regular"
        />
        <AdminKPICard
          label="Rotas suspensas"
          value={kpiStats.suspended}
          helper="com revisão operacional"
          severity="attention"
        />
        <AdminKPICard
          label="Rotas inativas"
          value={kpiStats.inactive}
          helper="sem operação hoje"
        />
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
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info('Cadastro de rota em breve')}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova rota
          </Button>
        }
      />

      {paginatedRoutes.length === 0 ? (
        <AdminEmptyState
          icon={MapPin}
          title={hasActiveFilters ? 'Nenhuma rota corresponde aos filtros' : 'Nenhuma rota cadastrada'}
          description={
            hasActiveFilters
              ? 'Ajuste os filtros ou limpe-os para ver todas as rotas.'
              : 'Comece cadastrando a primeira rota da plataforma.'
          }
          action={
            hasActiveFilters
              ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
              : { label: 'Nova rota', onClick: () => toast.info('Cadastro de rota em breve'), icon: Plus }
          }
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedRoutes.map((route) => {
              const schedulePath = `${basePath}/schedules?routeId=${route.id}`
              const isInactive = route.status === 'inactive'
              const isSuspended = route.status === 'suspended'

              return (
                <article
                  key={route.id}
                  className={cn(
                    'bg-card flex h-full flex-col gap-4 rounded-xl border border-border p-5',
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
                        <h3 className="text-foreground text-base font-semibold">
                          {route.name}
                        </h3>
                        {route.code && (
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {route.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <AdminActionMenu
                      items={[
                        {
                          label: isInactive || isSuspended ? 'Reativar' : 'Desativar',
                          icon: isInactive || isSuspended ? PlayCircle : PowerOff,
                          onClick: () => setConfirmRoute(route),
                          variant: isInactive || isSuspended ? 'default' : 'danger',
                        },
                      ]}
                    />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-[5px] h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="my-0.5 h-4 w-px bg-border" />
                        <span className="mb-[5px] h-2 w-2 rounded-full bg-muted-foreground/40" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-foreground leading-6">{route.origin}</p>
                        <p className="text-muted-foreground leading-6">{route.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span
                        className={cn(
                          'text-sm',
                          route.driverName ? 'text-foreground' : 'text-muted-foreground italic',
                        )}
                      >
                        {route.driverName ?? 'Sem motorista'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <Button size="sm" className="rounded-full" asChild>
                      <Link to={schedulePath}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        Horários
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => toast.info('Edição de rota em breve')}
                    >
                      Editar
                    </Button>
                  </div>
                </article>
              )
            })}
          </section>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
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
        title={confirmIsReactivate ? 'Reativar rota' : 'Desativar rota'}
        description={
          confirmIsReactivate
            ? `A rota "${confirmRoute?.name}" voltará a operar e a aparecer para os passageiros.`
            : `Esta ação vai desativar "${confirmRoute?.name}" e todos os seus ${confirmRoute?.scheduleCount} horários. Passageiros não conseguirão mais ver essa rota.`
        }
        confirmLabel={confirmIsReactivate ? 'Reativar' : 'Desativar'}
        variant={confirmIsReactivate ? 'default' : 'danger'}
        requireTypedConfirmation={
          confirmIsReactivate
            ? undefined
            : {
                expectedText: confirmRoute?.name ?? '',
                label: `Digite o nome da rota para confirmar`,
              }
        }
        onConfirm={() => {
          toast.success(
            confirmIsReactivate
              ? `Rota "${confirmRoute?.name}" reativada`
              : `Rota "${confirmRoute?.name}" desativada`,
          )
          setConfirmRoute(null)
        }}
      />
    </section>
  )
}
