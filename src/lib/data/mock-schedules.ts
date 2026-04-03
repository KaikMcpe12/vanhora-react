import type {
  Schedule,
  ScheduleBadge,
  ScheduleStatus,
} from '@/lib/types/schedule'

import { calculatePrice, MOCK_ROUTES } from './mock-cities'
import { MOCK_COOPERATIVES } from './mock-cooperatives'

// ===== FUNÇÕES PARA GERAÇÃO DETERMINÍSTICA =====

/**
 * Hash simples para gerar seed a partir de string
 * Garante que mesmos inputs sempre geram mesmos outputs
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Gerador pseudo-random com seed (Linear Congruential Generator)
 * Sempre retorna mesma sequência para mesmo seed
 */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

// Gera horários de funcionamento realistas (05:00 às 22:30)
const generateDepartureTimes = (): string[] => {
  const times: string[] = []

  // Horários da manhã (05:00 - 12:00): mais frequentes
  for (let hour = 5; hour <= 11; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)
    times.push(`${hour.toString().padStart(2, '0')}:30`)

    // Horários extras no rush matinal (06:00 - 08:00)
    if (hour >= 6 && hour <= 7) {
      times.push(`${hour.toString().padStart(2, '0')}:15`)
      times.push(`${hour.toString().padStart(2, '0')}:45`)
    }
  }

  // Meio-dia
  times.push('12:00')

  // Tarde (13:00 - 18:00): frequência moderada
  for (let hour = 13; hour <= 17; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)

    // Menos frequente que manhã
    if (hour % 2 === 0) {
      times.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  // Noite (18:00 - 22:30): menos frequente
  times.push('18:00', '19:00', '20:00', '21:00', '22:00', '22:30')

  return times.sort()
}

// Calcula horário de chegada baseado na distância
const calculateArrivalTime = (
  departureTime: string,
  distance: number,
): string => {
  const [hours, minutes] = departureTime.split(':').map(Number)
  const departureInMinutes = hours * 60 + minutes

  // Velocidade média: 60km/h + paradas (50km/h efetivo)
  const travelTimeMinutes = Math.round((distance / 50) * 60)
  const arrivalInMinutes = departureInMinutes + travelTimeMinutes

  const arrivalHours = Math.floor(arrivalInMinutes / 60) % 24
  const arrivalMinutes = arrivalInMinutes % 60

  return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`
}

// Calcula duração da viagem
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

// Determina status baseado no horário atual
// Usa seed determinístico para cancelamentos consistentes
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

  // 5% chance de cancelamento - DETERMINÍSTICO baseado no scheduleId
  const cancelSeed = simpleHash(scheduleId + '-cancel')
  const isCancelled = seededRandom(cancelSeed)() < 0.05
  if (isCancelled) {
    return {
      status: 'past',
      badge: 'cancelled',
      exceptionReason: 'Manutenção preventiva do veículo',
    }
  }

  // Determina status baseado no tempo
  if (departureInMinutes < currentInMinutes) {
    return { status: 'past', badge: 'available' }
  } else if (departureInMinutes <= currentInMinutes + 60) {
    return { status: 'upcoming-soon', badge: 'available' }
  } else {
    return { status: 'upcoming', badge: 'available' }
  }
}

// Gera código único da viagem - DETERMINÍSTICO
const generateTripCode = (
  origin: string,
  destination: string,
  time: string,
  cooperativeName: string,
): string => {
  const originCode = origin.substring(0, 3).toUpperCase()
  const destCode = destination.substring(0, 3).toUpperCase()
  const timeCode = time.replace(':', '')

  // Gera sufixo determinístico baseado em todos os parâmetros
  const seed = simpleHash(`${origin}-${destination}-${time}-${cooperativeName}`)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const random = seededRandom(seed)
  const suffix =
    chars[Math.floor(random() * chars.length)] +
    chars[Math.floor(random() * chars.length)]

  return `${originCode}${destCode}${timeCode}${suffix}`
}

// Gera dados mockados de horários
export function generateMockSchedules(): Schedule[] {
  const schedules: Schedule[] = []
  const departureTimes = generateDepartureTimes()

  // Para cada rota, gera horários com diferentes cooperativas
  MOCK_ROUTES.forEach((route) => {
    const availableCooperatives = MOCK_COOPERATIVES.filter((coop) => {
      const routes = coop.routes as readonly string[]
      return routes.includes(route.origin) && routes.includes(route.destination)
    })

    // Se não há cooperativas específicas, usar algumas aleatórias
    const cooperatives =
      availableCooperatives.length > 0
        ? availableCooperatives
        : MOCK_COOPERATIVES.slice(0, 3)

    departureTimes.forEach((departureTime) => {
      // Seed DETERMINÍSTICO para filtrar cooperativas
      const routeSeed = simpleHash(
        `${route.origin}-${route.destination}-${departureTime}`,
      )
      const routeRandom = seededRandom(routeSeed)

      // Nem todos os horários têm todas as cooperativas (realismo)
      const activeCooperatives = cooperatives.filter(() => routeRandom() > 0.3)

      activeCooperatives.forEach((cooperative) => {
        // ID determinístico
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
          // isFavorite removido - será gerenciado via localStorage
        })
      })
    })
  })

  return schedules
}

// Cache dos dados mockados para melhor performance
let cachedSchedules: Schedule[] | null = null

export function getMockSchedules(): Schedule[] {
  if (!cachedSchedules) {
    cachedSchedules = generateMockSchedules()
  }
  return cachedSchedules
}

// ✅ Novo: Paginação para infinite scroll
export function getMockSchedulesPage(
  page: number = 1,
  limit: number = 12,
  filters?: {
    origin?: string
    destination?: string
    date?: string
    cooperative?: string
    dayOfWeek?: string[]
    priceMin?: number
    priceMax?: number
    minRating?: number
    departureAfter?: string
    departureBefore?: string
  },
) {
  const allSchedules = getMockSchedules()
  const filteredSchedules = filters
    ? filterMockSchedules(allSchedules, filters)
    : allSchedules

  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const schedules = filteredSchedules.slice(startIndex, endIndex)

  return {
    schedules,
    hasNextPage: endIndex < filteredSchedules.length,
    nextPage: endIndex < filteredSchedules.length ? page + 1 : null,
    totalCount: filteredSchedules.length,
    currentPage: page,
    totalPages: Math.ceil(filteredSchedules.length / limit),
  }
}

// Helper para buscar horários por filtros
export function filterMockSchedules(
  schedules: Schedule[],
  filters: {
    origin?: string
    destination?: string
    date?: string
    cooperative?: string
    dayOfWeek?: string[]
    priceMin?: number
    priceMax?: number
    minRating?: number
    departureAfter?: string
    departureBefore?: string
  },
): Schedule[] {
  return schedules.filter((schedule) => {
    // Filtro de origem
    if (filters.origin && schedule.origin !== filters.origin) {
      return false
    }

    // Filtro de destino
    if (filters.destination && schedule.destination !== filters.destination) {
      return false
    }

    // Filtro de cooperativa
    if (
      filters.cooperative &&
      schedule.cooperativeName !== filters.cooperative
    ) {
      return false
    }

    // Filtro de preço mínimo
    if (filters.priceMin && schedule.price < filters.priceMin) {
      return false
    }

    // Filtro de preço máximo
    if (filters.priceMax && schedule.price > filters.priceMax) {
      return false
    }

    // Filtro de avaliação mínima
    if (
      filters.minRating &&
      schedule.cooperativeRating &&
      schedule.cooperativeRating < filters.minRating
    ) {
      return false
    }

    // Filtro de horário de partida (depois de)
    if (
      filters.departureAfter &&
      schedule.departureTime <= filters.departureAfter
    ) {
      return false
    }

    // Filtro de horário de partida (antes de)
    if (
      filters.departureBefore &&
      schedule.departureTime >= filters.departureBefore
    ) {
      return false
    }

    return true
  })
}

// ✅ Busca schedule por ID (implementação simples)
export function getMockScheduleById(id: string): Schedule | null {
  const schedules = getMockSchedules()
  return schedules.find((schedule) => schedule.id === id) || null
}

// ✅ Expansão de Schedule básico para ScheduleDetails
export function expandToScheduleDetails(schedule: Schedule) {
  return {
    ...schedule,
    // Campos adicionais básicos para o dialog
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

// Estatísticas dos dados mockados
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
