/**
 * Acesso a dados por cooperativa — camada única que espelha os endpoints da API
 * (`api-spec.md` §3.5). Hoje lê dos mocks; quando o backend existir, cada seletor
 * vira uma chamada ao endpoint documentado, sem tocar as abas. Os hooks
 * react-query correspondentes vivem em `@/lib/api/mock-cooperatives-api`.
 *
 * IMPORTANTE: não há endpoint agregado. A aba Geral consome
 * `GET /api/cooperatives/:id`; Rotas/Motoristas/Atrasos consomem
 * `GET /api/admin/{routes,users,delays}?cooperative_id={id}` — cada um isolado.
 */
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { type AdminDelay, MOCK_ADMIN_DELAYS } from '@/lib/data/mock-admin-delays'
import type {
  CooperativeCityServed,
  CooperativeOperatingStats,
  CooperativeRecentHistory,
} from '@/lib/data/mock-cooperative-details'
import { MOCK_ROUTES, type Route } from '@/lib/data/mock-routes'
import { MOCK_USERS, type User } from '@/lib/data/mock-users'

/** GET /api/admin/routes?cooperative_id={id} */
export function getCooperativeRoutes(cooperativeId: string): Route[] {
  return MOCK_ROUTES.filter((r) => r.cooperative_id === cooperativeId)
}

/** GET /api/admin/users?cooperative_id={id}&role=driver */
export function getCooperativeDrivers(cooperativeId: string): User[] {
  return MOCK_USERS.filter(
    (u) => u.role === 'driver' && u.cooperativeId === cooperativeId,
  )
}

/** GET /api/admin/delays?cooperative_id={id} (param na spec §3.7) */
export function getCooperativeDelays(cooperativeId: string): AdminDelay[] {
  return MOCK_ADMIN_DELAYS.filter((d) => d.cooperativeId === cooperativeId)
}

/** Nome do motorista atrelado a uma rota (Route.driver_id → User.name). */
export function getDriverName(driverId?: string): string | null {
  if (!driverId) return null
  return MOCK_USERS.find((u) => u.id === driverId)?.name ?? null
}

// ── Derivações para a aba Geral (GET /api/cooperatives/:id) ──────────────────

const WEEKDAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const PT_TO_EN: Record<string, string> = {
  seg: 'monday',
  ter: 'tuesday',
  qua: 'wednesday',
  qui: 'thursday',
  sex: 'friday',
  sab: 'saturday',
  dom: 'sunday',
}

const DEFAULT_ACTIVE_DAYS = ['seg', 'ter', 'qua', 'qui', 'sex']
/** partidas médias por rota/dia — deriva contagem plausível de horários */
const DEPARTURES_PER_ROUTE = 3

function citiesServedFromRoutes(routes: Route[]): CooperativeCityServed[] {
  const seen = new Set<string>()
  const cities: CooperativeCityServed[] = []
  for (const route of routes) {
    for (const name of [route.origin, route.destination]) {
      if (name && !seen.has(name)) {
        seen.add(name)
        cities.push({
          id: name,
          name,
          state: 'CE',
          role: 'origin_or_destination',
        })
      }
    }
  }
  return cities
}

function operatingStatsFromRoutes(routes: Route[]): CooperativeOperatingStats {
  const active = routes.filter((r) => r.status !== 'inactive')

  const schedulesPerWeekday: Record<string, number> = Object.fromEntries(
    WEEKDAY_ORDER.map((day) => [day, 0]),
  )
  for (const route of active) {
    const days = route.active_days?.length ? route.active_days : DEFAULT_ACTIVE_DAYS
    for (const code of days) {
      const en = PT_TO_EN[code]
      if (en) schedulesPerWeekday[en] += DEPARTURES_PER_ROUTE
    }
  }
  const busiestDay =
    WEEKDAY_ORDER.reduce((best, day) =>
      schedulesPerWeekday[day] > schedulesPerWeekday[best] ? day : best,
    'monday' as string) ?? 'friday'

  // destino mais frequente
  const byDest = new Map<string, number>()
  for (const route of active) {
    byDest.set(route.destination, (byDest.get(route.destination) ?? 0) + 1)
  }
  let topDestName = ''
  let topDestRoutes = 0
  for (const [name, count] of byDest) {
    if (count > topDestRoutes) {
      topDestName = name
      topDestRoutes = count
    }
  }

  const prices = active
    .map((r) => r.price)
    .filter((p): p is number => typeof p === 'number')
  const avgPrice = prices.length
    ? prices.reduce((s, p) => s + p, 0) / prices.length
    : 0

  return {
    schedulesPerWeekday,
    busiestDay,
    topDestination: {
      cityName: topDestName,
      scheduleCount: topDestRoutes * DEPARTURES_PER_ROUTE,
    },
    avgPrice,
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
  }
}

const CANCELLATION_REASONS = [
  'veículo em manutenção',
  'chuva forte na rota',
  'motorista indisponível',
]

function recentHistoryFromDelays(delays: AdminDelay[]): CooperativeRecentHistory {
  const severityDistribution = {
    low: delays.filter((d) => d.severity === 'low').length,
    medium: delays.filter((d) => d.severity === 'medium').length,
    high: delays.filter((d) => d.severity === 'high').length,
  }
  const averageDelayMinutes = delays.length
    ? Math.round(delays.reduce((s, d) => s + d.delayMinutes, 0) / delays.length)
    : 0

  // Cancelamentos são derivados dos atrasos graves (mock) — cooperativas sem
  // atraso grave ficam com zero, exercitando o estado "boa notícia".
  const highDelays = [...delays]
    .filter((d) => d.severity === 'high')
    .sort((a, b) => +new Date(b.reportedAt) - +new Date(a.reportedAt))
    .slice(0, 2)
  const cancellationsRecent = highDelays.map((d, i) => ({
    date: d.reportedAt.slice(0, 10),
    route: `${d.routeName} (${d.routeCode})`,
    reason: CANCELLATION_REASONS[i % CANCELLATION_REASONS.length],
  }))

  const onTimeRate = Math.max(
    0.6,
    Math.min(
      0.99,
      0.99 -
        severityDistribution.low * 0.004 -
        severityDistribution.medium * 0.02 -
        severityDistribution.high * 0.05,
    ),
  )

  return {
    delays: {
      last30DaysCount: delays.length,
      averageDelayMinutes,
      severityDistribution,
    },
    cancellations: {
      last30DaysCount: cancellationsRecent.length,
      recent: cancellationsRecent,
    },
    onTimeRate,
  }
}

export interface AdminCooperativeDetailRoute {
  id: string
  name: string
  code?: string
  origin: string
  destination: string
  status: Route['status']
  price?: number
  driverName: string | null
}

/**
 * Shape de `GET /api/cooperatives/:id` no contexto admin — combina o detalhe
 * público (cities_served, operating_stats, recent_history, routes) com os
 * counts admin da própria cooperativa.
 */
export interface AdminCooperativeDetail {
  id: string
  name: string
  phone: string
  site?: string
  logoUrl?: string
  description?: string
  brandColor: string
  status: AdminCooperative['status']
  rating: number
  reviewCount: number
  activeSinceYear: number
  routeCount: number
  activeRouteCount: number
  driverCount: number
  activeDriverCount: number
  schedulesTodayCount: number
  citiesServed: CooperativeCityServed[]
  operatingStats: CooperativeOperatingStats
  recentHistory: CooperativeRecentHistory
  topRoutes: AdminCooperativeDetailRoute[]
}

export function buildCooperativeDetail(
  coop: AdminCooperative,
): AdminCooperativeDetail {
  const routes = getCooperativeRoutes(coop.id)
  const drivers = getCooperativeDrivers(coop.id)
  const delays = getCooperativeDelays(coop.id)
  const operatingStats = operatingStatsFromRoutes(routes)
  const schedulesTodayCount = Object.values(
    operatingStats.schedulesPerWeekday,
  ).length
    ? routes.filter((r) => r.status === 'active').length * DEPARTURES_PER_ROUTE
    : 0

  return {
    id: coop.id,
    name: coop.name,
    phone: coop.phone,
    site: coop.site,
    logoUrl: coop.logoUrl,
    description: coop.description,
    brandColor: coop.brandColor,
    status: coop.status,
    rating: coop.rating,
    reviewCount: coop.reviewCount,
    activeSinceYear: new Date(coop.createdAt).getFullYear(),
    routeCount: routes.length,
    activeRouteCount: routes.filter((r) => r.status === 'active').length,
    driverCount: drivers.length,
    activeDriverCount: drivers.filter((d) => d.status === 'active').length,
    schedulesTodayCount,
    citiesServed: citiesServedFromRoutes(routes),
    operatingStats,
    recentHistory: recentHistoryFromDelays(delays),
    topRoutes: routes.slice(0, 5).map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      origin: r.origin,
      destination: r.destination,
      status: r.status,
      price: r.price,
      driverName: getDriverName(r.driver_id),
    })),
  }
}

export interface CooperativeHealth {
  routeCount: number
  activeRouteCount: number
  driverCount: number
  /** recent_history.on_time_rate (0–100) — indicador de saúde na lista */
  onTimeRate: number
  recentDelays: number
}

/**
 * Resumo leve para os cards da lista master (sem montar o detalhe completo).
 * Usa as contagens reais dos mocks (mesmas do painel/abas) para não divergir do
 * detalhe — evita "12 rotas" na lista e "2 rotas" no cabeçalho.
 */
export function getCooperativeHealth(coop: AdminCooperative): CooperativeHealth {
  const routes = getCooperativeRoutes(coop.id)
  const delays = getCooperativeDelays(coop.id)
  const { onTimeRate } = recentHistoryFromDelays(delays)
  return {
    routeCount: routes.length,
    activeRouteCount: routes.filter((r) => r.status === 'active').length,
    driverCount: getCooperativeDrivers(coop.id).length,
    onTimeRate: Math.round(onTimeRate * 100),
    recentDelays: delays.length,
  }
}
