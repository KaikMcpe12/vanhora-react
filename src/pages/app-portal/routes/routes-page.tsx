import {
  CalendarDays,
  CheckCircle2,
  CircleSlash,
  ChevronLeft,
  ChevronRight,
  PauseCircle,
  Pencil,
  PlayCircle,
  PowerOff,
  Route as RouteIcon,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Toggle } from '@/components/ui/toggle'
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

const STATUS_META: Record<
  RouteStatus,
  {
    label: string
    badge: string
    toggle: string
    icon: typeof CheckCircle2
    tone: string
    cardTopBorder: string
    schedulesBtn: string
  }
> = {
  active: {
    label: 'Ativa',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    toggle:
      'data-[state=on]:border-emerald-200 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700',
    icon: CheckCircle2,
    tone: 'text-emerald-600',
    cardTopBorder: 'border-t-[3px] border-t-emerald-500',
    schedulesBtn: 'bg-emerald-700 hover:bg-emerald-700/90 text-white',
  },
  suspended: {
    label: 'Suspensa',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    toggle:
      'data-[state=on]:border-amber-200 data-[state=on]:bg-amber-50 data-[state=on]:text-amber-700',
    icon: PauseCircle,
    tone: 'text-amber-600',
    cardTopBorder: 'border-t-[3px] border-t-amber-400',
    schedulesBtn: 'bg-amber-600 hover:bg-amber-600/90 text-white',
  },
  inactive: {
    label: 'Inativa',
    badge: 'border-slate-200 bg-slate-50 text-slate-600',
    toggle:
      'data-[state=on]:border-slate-200 data-[state=on]:bg-slate-50 data-[state=on]:text-slate-600',
    icon: CircleSlash,
    tone: 'text-slate-500',
    cardTopBorder: 'border-t-[3px] border-t-slate-400',
    schedulesBtn: 'bg-slate-600 hover:bg-slate-600/90 text-white',
  },
}

const ALL_STATUSES: RouteStatus[] = ['active', 'suspended', 'inactive']

const KPI_CONFIG: Array<{
  status: RouteStatus
  label: string
  description: string
  icon: typeof RouteIcon
  tone: string
  iconBg: string
  cardBg: string
  cardBorder: string
  numberColor: string
  labelColor: string
}> = [
  {
    status: 'active',
    label: 'Rotas ativas',
    description: 'em operacao regular',
    icon: RouteIcon,
    tone: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-l-4 border-l-emerald-500 border-t border-r border-b border-emerald-100',
    numberColor: 'text-emerald-700',
    labelColor: 'text-emerald-800',
  },
  {
    status: 'suspended',
    label: 'Rotas suspensas',
    description: 'com revisao operacional',
    icon: PauseCircle,
    tone: 'text-amber-600',
    iconBg: 'bg-amber-100',
    cardBg: 'bg-amber-50',
    cardBorder: 'border-l-4 border-l-amber-400 border-t border-r border-b border-amber-100',
    numberColor: 'text-amber-800',
    labelColor: 'text-amber-900',
  },
  {
    status: 'inactive',
    label: 'Rotas inativas',
    description: 'sem operacao hoje',
    icon: CircleSlash,
    tone: 'text-slate-500',
    iconBg: 'bg-slate-200',
    cardBg: 'bg-slate-50',
    cardBorder: 'border-l-4 border-l-slate-400 border-t border-r border-b border-slate-200',
    numberColor: 'text-slate-600',
    labelColor: 'text-slate-700',
  },
]

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
    driverName: 'Joao Silva',
  },
  {
    id: 'route-linha-sul',
    name: 'Linha Sul Express',
    code: 'R-319',
    cooperativeName: 'Expresso Sao Francisco',
    origin: 'Praca da Se',
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
    destination: 'Estacao Metro',
    status: 'inactive',
    scheduleCount: 1,
  },
]

const PAGE_SIZE = 6

function formatScheduleCount(count: number) {
  return `${count} horario${count === 1 ? '' : 's'}`
}

function getStatusBadgeClass(status: RouteStatus) {
  return STATUS_META[status].badge
}

function getStatusCountClass(status: RouteStatus) {
  return STATUS_META[status].tone
}

export function RoutesPage() {
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const [pendingQuery, setPendingQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<RouteStatus[]>(ALL_STATUSES)
  const [currentPage, setCurrentPage] = useState(1)

  const hasPendingQuery = pendingQuery.trim().length > 0

  const kpiStats = useMemo(() => {
    return ALL_STATUSES.reduce(
      (acc, status) => {
        acc[status] = ROUTES.filter((route) => route.status === status).length
        return acc
      },
      {} as Record<RouteStatus, number>,
    )
  }, [])

  const filteredRoutes = useMemo(() => {
    const normalizedQuery = committedQuery.trim().toLowerCase()
    const hasStatusFilter = statusFilters.length > 0

    return ROUTES.filter((route) => {
      const matchesStatus = !hasStatusFilter || statusFilters.includes(route.status)
      if (!matchesStatus) return false
      if (!normalizedQuery) return true

      const haystack = [
        route.name,
        route.code,
        route.origin,
        route.destination,
        route.cooperativeName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [committedQuery, statusFilters])

  const totalPages = Math.ceil(filteredRoutes.length / PAGE_SIZE)

  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRoutes.slice(start, start + PAGE_SIZE)
  }, [filteredRoutes, currentPage])

  const isStatusFiltered = statusFilters.length !== ALL_STATUSES.length
  const hasActiveFilters = Boolean(committedQuery.trim()) || isStatusFiltered

  const handleSearch = () => {
    setCommittedQuery(pendingQuery)
    setCurrentPage(1)
  }

  const toggleStatus = (status: RouteStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setPendingQuery('')
    setCommittedQuery('')
    setStatusFilters(ALL_STATUSES)
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setPendingQuery('')
    setCommittedQuery('')
    setCurrentPage(1)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">
            Monitoramento de Rotas
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Gerencie e acompanhe o status das operacoes em tempo real.
          </p>
        </div>
        <Button className="gap-2" size="sm">
          <span className="text-lg">+</span>
          Nova rota
        </Button>
      </header>

      <section className="bg-card space-y-3 rounded-xl border p-4">
        <div className="flex gap-2">
          <InputGroup className="h-10 flex-1">
            <InputGroupAddon align="inline-start">
              <Search className="text-muted-foreground h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar rota por nome, origem ou destino"
              value={pendingQuery}
              onChange={(event) => setPendingQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
            />
            {hasPendingQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Limpar busca"
                  onClick={clearSearch}
                >
                  <X className="h-3.5 w-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button
            size="sm"
            className="h-10 shrink-0 rounded-full gap-2"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ALL_STATUSES.map((status) => {
            const StatusIcon = STATUS_META[status].icon

            return (
              <Toggle
                key={status}
                pressed={statusFilters.includes(status)}
                onPressedChange={() => toggleStatus(status)}
                variant="outline"
                size="sm"
                className={cn(
                  'border-border h-8 gap-2 rounded-full px-3 text-xs font-semibold',
                  STATUS_META[status].toggle,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {STATUS_META[status].label}
              </Toggle>
            )
          })}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2"
              onClick={clearFilters}
            >
              Limpar
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {KPI_CONFIG.map((item) => {
          const Icon = item.icon

          return (
            <article
              key={item.status}
              className={cn(
                'flex items-center gap-4 rounded-xl p-5',
                item.cardBg,
                item.cardBorder,
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  item.iconBg,
                )}
              >
                <Icon className={cn('h-5 w-5', item.tone)} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-3xl font-extrabold leading-none', item.numberColor)}>
                  {kpiStats[item.status]}
                </p>
                <p className={cn('mt-0.5 text-xs font-semibold', item.labelColor)}>
                  {item.label}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  {item.description}
                </p>
              </div>
            </article>
          )
        })}
      </section>

      {paginatedRoutes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-slate-50 py-16 text-center">
          <RouteIcon className="text-muted-foreground h-10 w-10" />
          <p className="text-foreground font-semibold">Nenhuma rota encontrada</p>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou limpar a busca.
          </p>
          <Button variant="outline" size="sm" className="mt-1 rounded-full" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedRoutes.map((route) => {
              const scheduleLabel = formatScheduleCount(route.scheduleCount)
              const schedulePath = `${basePath}/schedules?routeId=${route.id}`
              const statusLabel = STATUS_META[route.status].label
              const isInactive = route.status === 'inactive'
              const isSuspended = route.status === 'suspended'
              const actionLabel = isInactive || isSuspended ? 'Reativar' : 'Desativar'

              return (
                <article
                  key={route.id}
                  className={cn(
                    'bg-card flex h-full flex-col gap-4 rounded-xl border p-4',
                    STATUS_META[route.status].cardTopBorder,
                    isInactive && 'opacity-70',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          'gap-1 border px-2 py-1 text-[11px]',
                          getStatusBadgeClass(route.status),
                        )}
                      >
                        {(() => {
                          const StatusIcon = STATUS_META[route.status].icon
                          return <StatusIcon className="h-3 w-3" />
                        })()}
                        {statusLabel}
                      </Badge>
                      <div>
                        <h3 className="text-foreground text-lg font-semibold">
                          {route.name}
                        </h3>
                        {route.code && (
                          <p className="text-muted-foreground text-xs font-medium">
                            {route.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          getStatusCountClass(route.status),
                        )}
                      >
                        {scheduleLabel}
                      </p>
                      <p className="text-muted-foreground text-xs">Horarios</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-[auto_1fr] gap-x-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-[5px] h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="my-0.5 h-4 w-px bg-slate-200" />
                        <span className="mb-[5px] h-2 w-2 rounded-full bg-slate-300" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-foreground text-sm font-medium leading-6">
                          {route.origin}
                        </p>
                        <p className="text-muted-foreground text-sm font-medium leading-6">
                          {route.destination}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRound className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          route.driverName
                            ? 'text-foreground'
                            : 'text-muted-foreground italic',
                        )}
                      >
                        {route.driverName ?? 'Sem motorista'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      className={cn(
                        'rounded-full',
                        STATUS_META[route.status].schedulesBtn,
                      )}
                      asChild
                    >
                      <Link to={schedulePath}>
                        <CalendarDays className="h-3.5 w-3.5" />
                        Horarios
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'rounded-full',
                        isInactive || isSuspended
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100',
                      )}
                    >
                      {isInactive || isSuspended ? (
                        <PlayCircle className="h-3.5 w-3.5" />
                      ) : (
                        <PowerOff className="h-3.5 w-3.5" />
                      )}
                      {actionLabel}
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
                Proximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
