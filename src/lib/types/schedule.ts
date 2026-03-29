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

// ========================================
// 🆕 RATING TYPES
// ========================================

export interface Rating {
  id: string
  scheduleId: string // Relacionado ao Schedule específico
  stars: number // 1-5
  createdAt: string // ISO 8601
}

export interface RatingStats {
  average: number // 4.5
  total: number // 120
  distribution: {
    5: number // 45 avaliações
    4: number // 50 avaliações
    3: number // 15 avaliações
    2: number // 8 avaliações
    1: number // 2 avaliações
  }
}

export interface CheckRatingResponse {
  hasRated: boolean
  rating?: {
    id: string
    stars: number
    createdAt: string
  }
}

export interface SubmitRatingResponse {
  success: boolean
  action: 'created' | 'updated'
  rating: {
    id: string
    stars: number
  }
}
