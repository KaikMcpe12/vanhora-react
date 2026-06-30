import type {
  Schedule,
  ScheduleBadge,
  ScheduleStatus,
} from '@/lib/types/schedule'

import { calculatePrice, MOCK_ROUTES } from './mock-cities'
import { MOCK_COOPERATIVES } from './mock-cooperatives'

/** hash simples para gerar seed a partir de string */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // convert to 32bit integer
  }
  return Math.abs(hash)
}

/** gerador pseudo-random com seed (linear congruential generator) */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

// Gera horários de saída específicos por rota, com minutos variados dentro de
// cada bucket. Isso garante que rotas diferentes tenham departure_time distintos
// (ex: Fortaleza→Sobral parte às 07:23, Fortaleza→Tianguá às 07:41) em vez de
// todos acumulados em :00/:30, o que causaria clustering de countdowns.
const generateRouteDepartureTimes = (routeSeed: number): string[] => {
  const rand = seededRandom(routeSeed)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const times: string[] = []

  const addBucket = (hours: number[], count: number) => {
    for (let i = 0; i < count; i++) {
      const h = hours[Math.floor(rand() * hours.length)]
      const m = Math.floor(rand() * 60)
      times.push(`${pad(h)}:${pad(m)}`)
    }
  }

  addBucket([4, 5], 3)           // madrugada: 3 saídas
  addBucket([6, 7, 8, 9, 10, 11], 14)   // manhã: 14 saídas
  addBucket([12, 13, 14, 15, 16, 17], 12) // tarde: 12 saídas
  addBucket([18, 19, 20, 21, 22], 7)    // noite: 7 saídas

  return [...new Set(times)].sort()
}

const calculateArrivalTime = (
  departureTime: string,
  distance: number,
): string => {
  const [hours, minutes] = departureTime.split(':').map(Number)
  const departureInMinutes = hours * 60 + minutes

  // velocidade média: 60km/h + paradas (50km/h efetivo)
  const travelTimeMinutes = Math.round((distance / 50) * 60)
  const arrivalInMinutes = departureInMinutes + travelTimeMinutes

  const arrivalHours = Math.floor(arrivalInMinutes / 60) % 24
  const arrivalMinutes = arrivalInMinutes % 60

  return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`
}

const calculateDuration = (distance: number): string => {
  const hours = Math.floor(distance / 50)
  const minutes = Math.round(((distance / 50) % 1) * 60)

  if (hours === 0) {
    return `${minutes}min`
  } else if (minutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${minutes}min`
  }
}

// determina status baseado no horário atual (seed determinístico para cancelamentos)
const getScheduleStatus = (
  departureTime: string,
  scheduleId: string,
): {
  status: ScheduleStatus
  badge: ScheduleBadge
  exceptionReason?: string
} => {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const [depHour, depMin] = departureTime.split(':').map(Number)
  const departureInMinutes = depHour * 60 + depMin

  const [currentHour, currentMin] = currentTime.split(':').map(Number)
  const currentInMinutes = currentHour * 60 + currentMin

  // ~2% de cancelamento determinístico (reduzido de 5% para não saturar a seção)
  const cancelSeed = simpleHash(scheduleId + '-cancel')
  const isCancelled = seededRandom(cancelSeed)() < 0.02
  if (isCancelled) {
    return {
      status: 'past',
      badge: 'cancelled',
      exceptionReason: 'Manutenção preventiva do veículo',
    }
  }

  if (departureInMinutes < currentInMinutes) {
    return { status: 'past', badge: 'available' }
  } else if (departureInMinutes <= currentInMinutes + 60) {
    return { status: 'upcoming-soon', badge: 'available' }
  } else {
    return { status: 'upcoming', badge: 'available' }
  }
}

// gera código único da viagem determinístico
const generateTripCode = (
  origin: string,
  destination: string,
  time: string,
  cooperativeName: string,
): string => {
  const originCode = origin.substring(0, 3).toUpperCase()
  const destCode = destination.substring(0, 3).toUpperCase()
  const timeCode = time.replace(':', '')

  const seed = simpleHash(`${origin}-${destination}-${time}-${cooperativeName}`)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = seededRandom(seed)
  const suffix =
    chars[Math.floor(random() * chars.length)] +
    chars[Math.floor(random() * chars.length)]

  return `${originCode}${destCode}${timeCode}${suffix}`
}

export function generateMockSchedules(): Schedule[] {
  const schedules: Schedule[] = []

  MOCK_ROUTES.forEach((route) => {
    const routeSeed = simpleHash(`${route.origin}-${route.destination}`)
    const departureTimes = generateRouteDepartureTimes(routeSeed)

    const availableCooperatives = MOCK_COOPERATIVES.filter((coop) => {
      const routes = coop.routes as readonly string[]
      return routes.includes(route.origin) && routes.includes(route.destination)
    })

    const cooperatives =
      availableCooperatives.length > 0
        ? availableCooperatives
        : MOCK_COOPERATIVES.slice(0, 3)

    departureTimes.forEach((departureTime) => {
      const timeSeed = simpleHash(
        `${route.origin}-${route.destination}-${departureTime}`,
      )
      const routeRandom = seededRandom(timeSeed)

      // nem todos os horários têm todas as cooperativas (realismo)
      const activeCooperatives = cooperatives.filter(() => routeRandom() > 0.3)

      activeCooperatives.forEach((cooperative) => {
        const scheduleId =
          `${route.origin}-${route.destination}-${departureTime}-${cooperative.name}`
            .replace(/\s/g, '-')
            .toLowerCase()

        const arrivalTime = calculateArrivalTime(departureTime, route.distance)
        const duration = calculateDuration(route.distance)
        const { status, badge, exceptionReason } = getScheduleStatus(
          departureTime,
          scheduleId,
        )
        const price = calculatePrice(route.basePrice, cooperative.name)
        const tripCode = generateTripCode(
          route.origin,
          route.destination,
          departureTime,
          cooperative.name,
        )

        schedules.push({
          id: scheduleId,
          cooperativeName: cooperative.name,
          cooperativeImage: cooperative.image,
          cooperativeRating: cooperative.rating,
          cooperativeReviews: cooperative.reviews,
          tripCode,
          departureTime,
          arrivalTime,
          duration,
          origin: route.origin,
          destination: route.destination,
          price,
          status,
          badge,
          exceptionReason,
        })
      })
    })
  })

  return schedules
}

// Cache por sessão — os tempos relativos são calculados no carregamento do módulo
// (HMR re-executa em dev, forçando recalculo). Sem cache seria regeneração a cada call.
let _cachedSchedules: Schedule[] | null = null

export function getMockSchedules(): Schedule[] {
  if (!_cachedSchedules) {
    _cachedSchedules = generateMockSchedules()
  }
  return _cachedSchedules
}

export function getMockScheduleById(id: string): Schedule | null {
  const schedules = getMockSchedules()
  return schedules.find((schedule) => schedule.id === id) || null
}

export function expandToScheduleDetails(schedule: Schedule) {
  return {
    ...schedule,
    description: `Viagem confortável de ${schedule.origin} para ${schedule.destination} com a ${schedule.cooperativeName}.`,
    cities: [schedule.origin, schedule.destination],
    operatingDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    contact: {
      phone: '(85) 3234-5678',
      email: `contato@${schedule.cooperativeName.toLowerCase().replace(/\s+/g, '')}.com.br`,
      website: `www.${schedule.cooperativeName.toLowerCase().replace(/\s+/g, '')}.com.br`,
    },
  }
}

export function getMockScheduleStats() {
  const schedules = getMockSchedules()

  return {
    totalSchedules: schedules.length,
    totalRoutes: MOCK_ROUTES.length,
    totalCooperatives: MOCK_COOPERATIVES.length,
    averagePrice: Math.round(
      schedules.reduce((sum, s) => sum + s.price, 0) / schedules.length,
    ),
    statusBreakdown: {
      'upcoming-soon': schedules.filter((s) => s.status === 'upcoming-soon')
        .length,
      upcoming: schedules.filter((s) => s.status === 'upcoming').length,
      past: schedules.filter((s) => s.status === 'past').length,
    },
  }
}
