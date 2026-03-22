export type ScheduleStatus = 'upcoming-soon' | 'upcoming' | 'past'
export type ScheduleBadge = 'available' | 'cancelled'

export interface Schedule {
  id: string
  cooperativeName: string
  cooperativeImage?: string
  cooperativeRating?: number
  cooperativeReviews?: number
  tripCode?: string
  departureTime: string // "15:30" format
  arrivalTime: string // "17:45" format
  duration: string // "1h 30min"
  origin: string
  destination: string
  price: number
  status: ScheduleStatus // ✅ Campo adicionado da versão schedule-card.tsx
  badge: ScheduleBadge
  isFavorite?: boolean
  exceptionReason?: string // "Feriado - Natal", "Manutenção da frota"
}

export interface SchedulesResponse {
  schedules: Schedule[]
  meta: {
    pageIndex: number
    perPage: number
    totalCount: number
  }
}

export interface ScheduleFilters {
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

  page?: number
  limit?: number
}

export type ScheduleCategory = 'leaving-now' | 'upcoming' | 'past'
