/**
 * Hooks react-query da página master-detail de Cooperativas. Cada aba tem o seu
 * — os 4 endpoints da `api-spec.md` §3.5 ficam ISOLADOS (sem endpoint agregado):
 *
 * - `useCooperativeDetail`  → GET /api/cooperatives/:id                (aba Geral)
 * - `useCooperativeRoutes`  → GET /api/admin/routes?cooperative_id     (aba Rotas)
 * - `useCooperativeDrivers` → GET /api/admin/users?cooperative_id&role=driver
 * - `useCooperativeDelays`  → GET /api/admin/delays?cooperative_id     (aba Atrasos)
 *
 * Hoje resolvem a partir dos mocks; quando o backend existir, troca-se só o
 * `queryFn` por uma chamada axios, sem tocar as abas.
 */
import { useQuery } from '@tanstack/react-query'

import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { queryKeys } from '@/lib/query-keys'

import {
  buildCooperativeDetail,
  getCooperativeDelays,
  getCooperativeDrivers,
  getCooperativeRoutes,
} from './cooperative-data'

const API_DELAY = 250
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** GET /api/cooperatives/:id — detalhe rico consumido pela aba Geral. */
export function useCooperativeDetail(cooperative: AdminCooperative | null) {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.detail(cooperative?.id ?? ''),
    queryFn: async () => {
      await delay(API_DELAY)
      return buildCooperativeDetail(cooperative!)
    },
    enabled: !!cooperative,
  })
}

/** GET /api/admin/routes?cooperative_id={id} — aba Rotas. */
export function useCooperativeRoutes(cooperativeId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.routes(cooperativeId ?? ''),
    queryFn: async () => {
      await delay(API_DELAY)
      return getCooperativeRoutes(cooperativeId!)
    },
    enabled: !!cooperativeId,
  })
}

/** GET /api/admin/users?cooperative_id={id}&role=driver — aba Motoristas. */
export function useCooperativeDrivers(cooperativeId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.drivers(cooperativeId ?? ''),
    queryFn: async () => {
      await delay(API_DELAY)
      return getCooperativeDrivers(cooperativeId!)
    },
    enabled: !!cooperativeId,
  })
}

/** GET /api/admin/delays?cooperative_id={id} — aba Atrasos. */
export function useCooperativeDelays(cooperativeId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.cooperatives.delays(cooperativeId ?? ''),
    queryFn: async () => {
      await delay(API_DELAY)
      return getCooperativeDelays(cooperativeId!)
    },
    enabled: !!cooperativeId,
  })
}
