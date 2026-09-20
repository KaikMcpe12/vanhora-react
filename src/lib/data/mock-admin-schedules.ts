import type { AdminRoute } from '@/lib/types/admin-schedule'

// UUIDs consistentes com MOCK_ADMIN_COOPERATIVES (api-spec.md §1.2).
const METRO_ID = '11111111-1111-4111-8111-111111111111'
const EXPRESSO_ID = '22222222-2222-4222-8222-222222222222'
const VALE_ID = '33333333-3333-4333-8333-333333333333'

const R204_ID = 'a1a1a1a1-0204-4204-8204-000000000204'
const R319_ID = 'a2a2a2a2-0319-4319-8319-000000000319'
const L12_ID = 'a3a3a3a3-0012-4012-8012-000000000012'

export const MOCK_ADMIN_ROUTES: AdminRoute[] = [
  {
    id: R204_ID,
    code: 'R-204',
    cooperativeId: METRO_ID,
    cooperativeName: 'Metro Transportes',
    origin: 'Juazeiro',
    destination: 'Petrolina',
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    basePrice: 24,
    openExceptionsCount: 2,
    nextExceptionDate: '18/04/2026',
    openExceptions: [
      {
        date: '18/04/2026',
        type: 'rescheduled',
        newDepartureTime: '09:15',
        reason: 'Alta demanda — saída adiada',
        scheduleId: 'r204-0715',
        departureTime: '07:15',
      },
      {
        date: '21/04/2026',
        type: 'cancelled',
        reason: 'Feriado municipal em Petrolina',
        scheduleId: 'r204-0630',
        departureTime: '06:30',
      },
    ],
    stops: [
      { city: 'Juazeiro Centro', time: '06:00' },
      { city: 'Lagoa Grande', time: '07:10' },
      { city: 'Petrolina Terminal', time: '07:45' },
    ],
    schedules: [
      {
        id: 'r204-0630',
        departureTime: '06:30',
        dayOfWeek: 'sex',
        activeDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
        routeId: R204_ID,
        cooperativeId: METRO_ID,
        cooperativeName: 'Metro Transportes',
        origin: 'Juazeiro',
        destination: 'Petrolina',
        routeCode: 'R-204',
        recordStatus: 'active',
        operationalStatus: 'in_operation',
        rating: { average: 4.6, total: 128, lastAt: 'hoje 08:12' },
      },
      {
        id: 'r204-0715',
        departureTime: '07:15',
        dayOfWeek: 'qua',
        activeDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
        routeId: R204_ID,
        cooperativeId: METRO_ID,
        cooperativeName: 'Metro Transportes',
        origin: 'Juazeiro',
        destination: 'Petrolina',
        routeCode: 'R-204',
        recordStatus: 'active',
        operationalStatus: 'delayed',
        notes: 'Parada rapida no Centro',
        nextException: {
          date: '18/04/2026',
          type: 'rescheduled',
          newDepartureTime: '09:15',
          reason: 'Alta demanda — saída adiada',
        },
        rating: { average: 4.2, total: 89, lastAt: 'hoje 06:30' },
      },
    ],
    temporarySchedules: [
      {
        id: 'tmp-r204-01',
        routeId: R204_ID,
        departureTime: '10:00',
        date: '19/04/2026',
        reason: 'Alta demanda feriado',
        status: 'active',
      },
    ],
  },
  {
    id: R319_ID,
    code: 'R-319',
    cooperativeId: EXPRESSO_ID,
    cooperativeName: 'Expresso São Francisco',
    origin: 'Juazeiro',
    destination: 'Petrolina',
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    basePrice: 28,
    openExceptionsCount: 1,
    nextExceptionDate: '18/04/2026',
    openExceptions: [
      {
        date: '18/04/2026',
        type: 'suspended',
        reason: 'Manutenção programada da frota',
        scheduleId: 'r319-1400',
        departureTime: '14:00',
      },
    ],
    stops: [
      { city: 'Juazeiro Centro', time: '14:00' },
      { city: 'Lagoa Grande', time: '14:45' },
      { city: 'Petrolina Terminal', time: '15:30' },
    ],
    schedules: [
      {
        id: 'r319-1400',
        departureTime: '14:00',
        dayOfWeek: 'sex',
        activeDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
        routeId: R319_ID,
        cooperativeId: EXPRESSO_ID,
        cooperativeName: 'Expresso São Francisco',
        origin: 'Juazeiro',
        destination: 'Petrolina',
        routeCode: 'R-319',
        recordStatus: 'cancelled',
        operationalStatus: 'cancelled',
      },
    ],
  },
  {
    id: L12_ID,
    code: 'L-12',
    cooperativeId: VALE_ID,
    cooperativeName: 'Cooperativa Vale',
    origin: 'Vila Nova',
    destination: 'Shopping',
    activeDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
    basePrice: 12,
    openExceptionsCount: 0,
    stops: [
      { city: 'Vila Nova', time: '05:45' },
      { city: 'Shopping', time: '06:20' },
    ],
    schedules: [
      {
        id: 'l12-0545',
        departureTime: '05:45',
        dayOfWeek: 'seg',
        activeDays: ['seg', 'ter', 'qua', 'qui', 'sex'],
        routeId: L12_ID,
        cooperativeId: VALE_ID,
        cooperativeName: 'Cooperativa Vale',
        origin: 'Vila Nova',
        destination: 'Shopping',
        routeCode: 'L-12',
        recordStatus: 'active',
        operationalStatus: 'in_operation',
        rating: { average: 4.8, total: 210, lastAt: 'hoje 05:50' },
      },
    ],
    temporarySchedules: [
      {
        id: 'tmp-l12-01',
        routeId: L12_ID,
        departureTime: '22:30',
        date: '22/04/2026',
        reason: 'Fim de semana promocional',
        status: 'active',
      },
    ],
  },
]

export const ADMIN_SCHEDULE_SUMMARY = {
  activeSchedulesToday: 1284,
  openExceptions: 18,
  monitoredRoutes: 892,
}
