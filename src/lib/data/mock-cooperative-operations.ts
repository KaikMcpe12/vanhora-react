import { MOCK_ADMIN_DELAYS } from '@/lib/data/mock-admin-delays'
import { MOCK_COOP_PORTAL_USER_ID } from '@/lib/data/mock-cooperative-portal'
import type { Severity } from '@/lib/delays/severity'
import { isTripActive, tripProgress } from '@/lib/driver/current-trip'
import type { OperationalStatus } from '@/lib/types/admin-schedule'

export interface CoopOperation {
  id: string
  routeCode: string
  origin: string
  destination: string
  departureTime: string // HH:MM
  arrivalEstimate: string // HH:MM
  operationalStatus: OperationalStatus
  /** opcional — muitas rotas não têm motorista atribuído (regra do PRD) */
  driverName?: string
}

export interface CoopOperationView extends CoopOperation {
  progressPct: number
  minutesRemaining: number
}

/**
 * DEV: cenário simulado do painel. Troque para validar os estados degradados:
 *   'operating' → operações rodando agora (padrão)
 *   'night'     → nenhuma operação neste momento (madrugada)
 *   'new_coop'  → cooperativa nova, sem histórico/atrasos
 */
export type CoopPanelScenario = 'operating' | 'night' | 'new_coop'
// `as` evita o narrowing do const p/ o literal — precisa ser comparável aos 3 valores
export const COOP_PANEL_SCENARIO = 'operating' as CoopPanelScenario

function at(hour: number, minute: number): Date {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d
}
// "agora" simulado — só o horário importa (comparação por minutos do dia).
export const COOP_NOW: Date =
  COOP_PANEL_SCENARIO === 'night' ? at(3, 0) : at(14, 20)

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

const ALL_COOP_OPERATIONS: CoopOperation[] = [
  {
    id: 'op-1',
    routeCode: 'R-204',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: '13:50',
    arrivalEstimate: '14:40',
    operationalStatus: 'in_operation',
    driverName: 'Carlos Mendes',
  },
  {
    id: 'op-2',
    routeCode: 'R-101',
    origin: 'Praça da Sé',
    destination: 'Distrito Industrial',
    departureTime: '14:00',
    arrivalEstimate: '15:10',
    operationalStatus: 'delayed',
    driverName: 'Ana Souza',
  },
  {
    id: 'op-3',
    routeCode: 'L-12',
    origin: 'Vila Nova',
    destination: 'Shopping Iguatemi',
    departureTime: '14:05',
    arrivalEstimate: '14:50',
    operationalStatus: 'in_operation',
  },
  {
    id: 'op-4',
    routeCode: 'N-07',
    origin: 'Centro',
    destination: 'Bairro Norte',
    departureTime: '14:15',
    arrivalEstimate: '15:00',
    operationalStatus: 'suspended',
  },
  {
    id: 'op-5',
    routeCode: 'R-204',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: '15:30',
    arrivalEstimate: '16:20',
    operationalStatus: 'in_operation',
    driverName: 'Carlos Mendes',
  },
  {
    id: 'op-6',
    routeCode: 'L-12',
    origin: 'Vila Nova',
    destination: 'Shopping Iguatemi',
    departureTime: '16:00',
    arrivalEstimate: '16:45',
    operationalStatus: 'in_operation',
  },
]

const opsForScenario = (): CoopOperation[] =>
  COOP_PANEL_SCENARIO === 'new_coop' ? [] : ALL_COOP_OPERATIONS

// urgência: problemas primeiro (delayed → cancelled → suspended → em operação)
const URGENCY_RANK: Record<OperationalStatus, number> = {
  delayed: 0,
  cancelled: 1,
  suspended: 2,
  in_operation: 3,
}

export function getActiveOperations(now: Date): CoopOperationView[] {
  return opsForScenario()
    .filter((o) => isTripActive(o.departureTime, o.arrivalEstimate, now))
    .map((o) => ({
      ...o,
      ...tripProgress(o.departureTime, o.arrivalEstimate, now),
    }))
    .sort(
      (a, b) =>
        URGENCY_RANK[a.operationalStatus] - URGENCY_RANK[b.operationalStatus],
    )
}

export function getNextDepartures(now: Date): CoopOperation[] {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return opsForScenario()
    .filter((o) => toMin(o.departureTime) > nowMin)
    .sort((a, b) => toMin(a.departureTime) - toMin(b.departureTime))
}

export interface CoopPanelKpis {
  emOperacao: number
  atrasadas: number
  suspensas: number
  pendentes: number
}

const coopDelays = () =>
  COOP_PANEL_SCENARIO === 'new_coop'
    ? []
    : MOCK_ADMIN_DELAYS.filter(
        (d) => d.cooperativeId === MOCK_COOP_PORTAL_USER_ID,
      )

export function getPanelKpis(now: Date): CoopPanelKpis {
  const active = getActiveOperations(now)
  const all = opsForScenario()
  return {
    emOperacao: active.filter((o) => o.operationalStatus === 'in_operation')
      .length,
    atrasadas: active.filter((o) => o.operationalStatus === 'delayed').length,
    suspensas: all.filter((o) => o.operationalStatus === 'suspended').length,
    pendentes: coopDelays().filter((d) => d.status === 'pending').length,
  }
}

export interface OnTimePoint {
  date: string
  rate: number // %
}

export function getOnTimeHistory(): OnTimePoint[] {
  if (COOP_PANEL_SCENARIO === 'new_coop') return []
  const base = new Date('2026-07-25')
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() - (29 - i))
    const rate = Math.round((0.86 + 0.1 * Math.abs(Math.sin(i / 3))) * 100)
    const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return { date: label, rate }
  })
}

export interface RouteDelayCount {
  routeCode: string
  count: number
}

export function getDelaysByRoute(): RouteDelayCount[] {
  const map = new Map<string, number>()
  for (const d of coopDelays())
    map.set(d.routeCode, (map.get(d.routeCode) ?? 0) + 1)
  return [...map.entries()]
    .map(([routeCode, count]) => ({ routeCode, count }))
    .sort((a, b) => b.count - a.count)
}

export interface SeverityCount {
  severity: Severity
  count: number
}

export function getSeverityDistribution(): SeverityCount[] {
  const order: Severity[] = ['low', 'medium', 'high']
  const map = new Map<Severity, number>()
  for (const d of coopDelays())
    map.set(d.severity, (map.get(d.severity) ?? 0) + 1)
  return order
    .map((severity) => ({ severity, count: map.get(severity) ?? 0 }))
    .filter((s) => s.count > 0)
}
