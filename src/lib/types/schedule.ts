export type ScheduleStatus = 'upcoming-soon' | 'upcoming' | 'past'
export type ScheduleBadge = 'available' | 'cancelled'

export interface Schedule {
  id: string
  cooperativeName: string
  cooperativeImage?: string
  cooperativeRating?: number
  cooperativeReviews?: number
  tripCode?: string
  departureTime: string // "15:30"
  arrivalTime: string // "17:45"
  duration: string // "1h 30min"
  origin: string
  destination: string
  price: number
  status: ScheduleStatus
  badge: ScheduleBadge
  isFavorite?: boolean
  exceptionReason?: string // "feriado - natal", "manutenção da frota"
}

// rating types

export interface Rating {
  id: string
  scheduleId: string
  stars: number // 1-5
  createdAt: string // iso 8601
}

export interface RatingStats {
  average: number
  total: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
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
