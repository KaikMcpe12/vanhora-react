import type { Weekday } from '@/components/pickers/weekday-picker'

// id do motorista associado ao usuário mock de role 'driver'
export const MOCK_DRIVER_USER_ID = 'user-driver-1'

export interface DriverProfile {
  id: string
  name: string
  email: string
  phone: string
  cnh: string
  cnhType: string
  cooperativeId: string
  cooperativeName: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface DriverRoute {
  id: string
  code: string
  name: string
  origin: string
  destination: string
  schedulesTodayCount: number
  status: 'active' | 'suspended'
  nextDeparture: string | null
}

export interface DriverScheduleEntry {
  id: string
  routeCode: string
  routeName: string
  origin: string
  destination: string
  departureTime: string
  arrivalEstimate: string
  status: 'scheduled' | 'on_time' | 'delayed' | 'completed' | 'cancelled'
  delayMinutes?: number
  /** Dias da semana em que este horário recorre (usado em /meus-horarios). */
  activeDays?: Weekday[]
  /** Há exceção aberta (cancelamento/reagendamento) prevista nos próximos dias. */
  hasOpenException?: boolean
  /** Serviço extra pontual: existe só em uma data específica, não recorre. */
  isTemporary?: boolean
}

export const MOCK_DRIVER_PROFILE: DriverProfile = {
  id: 'user-driver-1',
  name: 'João Motorista',
  email: 'driver@vanhora.dev',
  phone: '(85) 99234-5678',
  cnh: '12345678900',
  cnhType: 'D',
  cooperativeId: '11111111-1111-4111-8111-111111111111',
  cooperativeName: 'Metro Transportes',
  status: 'active',
  createdAt: '2025-03-15T00:00:00Z',
}

export const MOCK_DRIVER_ROUTES: DriverRoute[] = [
  {
    id: 'route-1',
    code: 'R-204',
    name: 'Expresso Norte',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    schedulesTodayCount: 4,
    status: 'active',
    nextDeparture: '15:30',
  },
  {
    id: 'route-extra-1',
    code: 'R-101',
    name: 'Distrito Industrial',
    origin: 'Praça da Sé',
    destination: 'Distrito Industrial',
    schedulesTodayCount: 2,
    status: 'active',
    nextDeparture: '17:00',
  },
]

const fmt = (h: number, m: number) =>
  `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`

const WEEKDAYS: Weekday[] = ['seg', 'ter', 'qua', 'qui', 'sex']
const WEEKEND: Weekday[] = ['sab', 'dom']
const EVERY_DAY: Weekday[] = [...WEEKDAYS, ...WEEKEND]

const ALL_DRIVER_SCHEDULES_TODAY: DriverScheduleEntry[] = [
  {
    id: 'sch-d-001',
    routeCode: 'R-204',
    routeName: 'Expresso Norte',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: fmt(7, 30),
    arrivalEstimate: fmt(8, 15),
    status: 'completed',
    activeDays: WEEKDAYS,
  },
  {
    id: 'sch-d-002',
    routeCode: 'R-204',
    routeName: 'Expresso Norte',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: fmt(10, 0),
    arrivalEstimate: fmt(10, 45),
    status: 'completed',
    activeDays: EVERY_DAY,
    hasOpenException: true,
  },
  {
    id: 'sch-d-003',
    routeCode: 'R-101',
    routeName: 'Distrito Industrial',
    origin: 'Praça da Sé',
    destination: 'Distrito Industrial',
    departureTime: fmt(13, 0),
    arrivalEstimate: fmt(13, 50),
    status: 'completed',
    activeDays: WEEKDAYS,
  },
  {
    // viagem em andamento no "agora" simulado (15:50) — janela 15:30→16:15
    id: 'sch-d-004',
    routeCode: 'R-204',
    routeName: 'Expresso Norte',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: fmt(15, 30),
    arrivalEstimate: fmt(16, 15),
    status: 'on_time',
    activeDays: WEEKDAYS,
  },
  {
    id: 'sch-d-005',
    routeCode: 'R-101',
    routeName: 'Distrito Industrial',
    origin: 'Praça da Sé',
    destination: 'Distrito Industrial',
    departureTime: fmt(17, 0),
    arrivalEstimate: fmt(17, 50),
    status: 'scheduled',
    activeDays: WEEKDAYS,
  },
  {
    id: 'sch-d-006',
    routeCode: 'R-204',
    routeName: 'Expresso Norte',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: fmt(19, 0),
    arrivalEstimate: fmt(19, 45),
    status: 'scheduled',
    activeDays: [...WEEKDAYS, 'sab'],
  },
]

/**
 * Recorrência semanal completa dos horários atribuídos ao motorista. Cobre os
 * dois casos que o cronograma de hoje sozinho não expõe: horários que rodam só
 * no fim de semana e serviços extras pontuais (isTemporary).
 */
const ALL_DRIVER_SCHEDULES_WEEKLY: DriverScheduleEntry[] = [
  ...ALL_DRIVER_SCHEDULES_TODAY.map((s) => ({
    ...s,
    // No panorama semanal os status "agora" (on_time/delayed/completed) viram
    // "programado" — só ganham status real dentro do dia.
    status:
      s.status === 'on_time' || s.status === 'delayed' || s.status === 'completed'
        ? ('scheduled' as const)
        : s.status,
  })),
  {
    id: 'sch-d-007',
    routeCode: 'R-330',
    routeName: 'Litoral Fim de Semana',
    origin: 'Terminal Central',
    destination: 'Praia do Futuro',
    departureTime: fmt(9, 0),
    arrivalEstimate: fmt(9, 45),
    status: 'scheduled',
    activeDays: WEEKEND,
  },
  {
    id: 'sch-d-008',
    routeCode: 'R-330',
    routeName: 'Litoral Fim de Semana',
    origin: 'Terminal Central',
    destination: 'Praia do Futuro',
    departureTime: fmt(14, 0),
    arrivalEstimate: fmt(14, 50),
    status: 'scheduled',
    activeDays: WEEKEND,
  },
  {
    // serviço extra pontual — não recorre; existe só na data
    id: 'sch-d-tmp-01',
    routeCode: 'R-204',
    routeName: 'Alta demanda feriado',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    departureTime: fmt(21, 0),
    arrivalEstimate: fmt(21, 40),
    status: 'scheduled',
    activeDays: [],
    isTemporary: true,
  },
]

export interface DriverStats {
  onTimeRate: number // % de pontualidade
  onTimeDelta: number // Δ em pontos vs semana passada
  delaysReported: number
}

export const MOCK_DRIVER_STATS: DriverStats = {
  onTimeRate: 94,
  onTimeDelta: 2,
  delaysReported: 3,
}

/**
 * DEV: cenário simulado da home do motorista. Troque para validar os 3 casos:
 *   'in_progress' → viagem em andamento (padrão)
 *   'upcoming'    → sem viagem atual, mas com próximas saídas
 *   'empty'       → nenhuma saída no dia
 */
export type DriverHomeScenario = 'in_progress' | 'upcoming' | 'empty'
// `as` evita o narrowing do const p/ o literal — o flag precisa ser comparável aos 3 valores
export const DRIVER_HOME_SCENARIO = 'in_progress' as DriverHomeScenario

// "agora" simulado — só o horário importa (getCurrentTrip compara minutos do dia).
// backend real usaria new Date(); fixo aqui para uma demo determinística.
function mockNow(hour: number, minute: number): Date {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d
}

export const MOCK_DRIVER_NOW: Date =
  DRIVER_HOME_SCENARIO === 'upcoming' ? mockNow(6, 0) : mockNow(15, 50)

export const MOCK_DRIVER_SCHEDULES_TODAY: DriverScheduleEntry[] =
  DRIVER_HOME_SCENARIO === 'empty' ? [] : ALL_DRIVER_SCHEDULES_TODAY

/**
 * Panorama semanal recorrente (usado em /meus-horarios). Diferente de
 * `MOCK_DRIVER_SCHEDULES_TODAY`, este dataset inclui horários que rodam só em
 * outros dias da semana e serviços extras pontuais.
 */
export const MOCK_DRIVER_SCHEDULES_WEEKLY: DriverScheduleEntry[] =
  ALL_DRIVER_SCHEDULES_WEEKLY
