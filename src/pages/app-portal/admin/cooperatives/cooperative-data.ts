/**
 * Acesso a dados por cooperativa — camada única que espelha os endpoints da API
 * (`api-spec.md`). Hoje lê dos mocks; quando o backend existir, cada seletor vira
 * uma chamada react-query ao endpoint documentado, sem tocar as abas.
 */
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { type AdminDelay, MOCK_ADMIN_DELAYS } from '@/lib/data/mock-admin-delays'
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

/**
 * GET /api/admin/delays?cooperative_id={id}
 * (o param `cooperative_id` foi adicionado à spec — seção 3.7)
 */
export function getCooperativeDelays(cooperativeId: string): AdminDelay[] {
  return MOCK_ADMIN_DELAYS.filter((d) => d.cooperativeId === cooperativeId)
}

export interface CooperativeStats {
  routeCount: number
  activeRouteCount: number
  driverCount: number
  activeDriverCount: number
  rating: number
  reviewCount: number
  /** recent_history.on_time_rate de GET /api/cooperatives/:id (0–100) */
  onTimeRate: number
  /** atrasos de alta severidade pendentes — derivado (sem campo direto na spec) */
  criticalAlerts: number
  pendingDelays: number
  avgDelayMinutes: number
}

/**
 * Métricas exibidas no header do detalhe e nas abas. Combina os counts admin de
 * `GET /api/admin/cooperatives` (routeCount/driverCount) com dados derivados dos
 * atrasos. `onTimeRate` mapeia para `recent_history.on_time_rate` de
 * `GET /api/cooperatives/:id`.
 */
export function getCooperativeStats(
  cooperative: AdminCooperative,
): CooperativeStats {
  const routes = getCooperativeRoutes(cooperative.id)
  const drivers = getCooperativeDrivers(cooperative.id)
  const delays = getCooperativeDelays(cooperative.id)

  const resolved = delays.filter((d) => d.status === 'resolved').length
  const onTimeRate = delays.length
    ? Math.round((resolved / delays.length) * 100)
    : 98
  const avgDelayMinutes = delays.length
    ? Math.round(
        delays.reduce((sum, d) => sum + d.delayMinutes, 0) / delays.length,
      )
    : 0

  return {
    routeCount: cooperative.routeCount,
    activeRouteCount: routes.filter((r) => r.status === 'active').length,
    driverCount: cooperative.driverCount,
    activeDriverCount: drivers.filter((d) => d.status === 'active').length,
    rating: cooperative.rating,
    reviewCount: cooperative.reviewCount,
    onTimeRate,
    criticalAlerts: delays.filter(
      (d) => d.severity === 'high' && d.status === 'pending',
    ).length,
    pendingDelays: delays.filter((d) => d.status === 'pending').length,
    avgDelayMinutes,
  }
}
