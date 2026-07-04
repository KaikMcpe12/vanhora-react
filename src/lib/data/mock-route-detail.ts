import type { CooperativeRecentHistory, CooperativeRoute } from './mock-cooperative-details'
import { MOCK_COOPERATIVE_DETAILS } from './mock-cooperative-details'
import { MOCK_ROUTES } from './mock-cities'
import { formatDuration } from '@/lib/utils/format'

export type RouteStop = {
  city: string
  time: string
  durationFromPrev: string | null
  isEndpoint: boolean
}

export type RouteOperatingDay = {
  key: string
  labelPt: string
  active: boolean
}

export type RouteStatistics = {
  delays: {
    last30DaysCount: number
    averageDelayMinutes: number
    severityDistribution: { low: number; medium: number; high: number }
  }
  cancellations: {
    last30DaysCount: number
    recent: Array<{ date: string; reason: string }>
  }
  onTimeRate: number
  schedulesOperated: number
  schedulesExpected: number
}

export type AlternativeRoute = {
  id: string
  displayName: string
  cooperativeName: string
  cooperativeColor: string
  cooperativeId: string
  priceFrom: number
  durationText: string
  nextDeparture: { departureTime: string; minutesUntil: number } | null
  routeRating: { average: number; count: number } | null
}

export type RouteDetail = {
  id: string
  displayName: string
  origin: string
  destination: string
  durationText: string
  durationMinutes: number
  priceFrom: number
  rating: { average: number; count: number } | null
  cooperative: {
    id: string
    name: string
    brandColor: string
    rating: { average: number; count: number }
  }
  stops: RouteStop[]
  operatingDays: RouteOperatingDay[]
  statistics: RouteStatistics
  alternatives: AlternativeRoute[]
}

const ALL_WEEKDAYS = [
  { key: 'monday', labelPt: 'Seg' },
  { key: 'tuesday', labelPt: 'Ter' },
  { key: 'wednesday', labelPt: 'Qua' },
  { key: 'thursday', labelPt: 'Qui' },
  { key: 'friday', labelPt: 'Sex' },
  { key: 'saturday', labelPt: 'Sáb' },
  { key: 'sunday', labelPt: 'Dom' },
]

function getOperatingDays(schedulesTodayCount: number): RouteOperatingDay[] {
  let activeKeys: string[]
  if (schedulesTodayCount >= 10) {
    activeKeys = ALL_WEEKDAYS.map((d) => d.key)
  } else if (schedulesTodayCount >= 6) {
    activeKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  } else {
    activeKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  }
  return ALL_WEEKDAYS.map((d) => ({ ...d, active: activeKeys.includes(d.key) }))
}

function buildStatistics(
  coopHistory: CooperativeRecentHistory,
  route: CooperativeRoute,
  routeFraction: number,
): RouteStatistics {
  const delayCount = Math.max(0, Math.round(coopHistory.delays.last30DaysCount * routeFraction))
  const dist = coopHistory.delays.severityDistribution
  const scaledLow = Math.min(delayCount, Math.round(dist.low * routeFraction))
  const scaledMed = Math.min(delayCount - scaledLow, Math.round(dist.medium * routeFraction))
  const scaledHigh = Math.max(0, delayCount - scaledLow - scaledMed)

  const cancelCount = Math.max(0, Math.round(coopHistory.cancellations.last30DaysCount * routeFraction))
  const recentCancellations = coopHistory.cancellations.recent
    .filter((c) => c.route === route.displayName)
    .map((c) => ({ date: c.date, reason: c.reason }))
    .slice(0, 3)

  const operatingDaysPerWeek = route.schedulesTodayCount >= 10 ? 7 : route.schedulesTodayCount >= 6 ? 6 : 5
  const schedulesExpected = route.schedulesTodayCount * Math.round((30 / 7) * operatingDaysPerWeek)

  return {
    delays: {
      last30DaysCount: delayCount,
      averageDelayMinutes: coopHistory.delays.averageDelayMinutes,
      severityDistribution: { low: scaledLow, medium: scaledMed, high: scaledHigh },
    },
    cancellations: {
      last30DaysCount: cancelCount,
      recent: recentCancellations,
    },
    onTimeRate: coopHistory.onTimeRate,
    schedulesOperated: Math.max(0, schedulesExpected - cancelCount),
    schedulesExpected,
  }
}

export function getMockRouteDetail(id: string): RouteDetail | null {
  for (const coop of MOCK_COOPERATIVE_DETAILS) {
    const route = coop.routes.find((r) => r.id === id)
    if (!route) continue

    const [origin, destination] = route.displayName.split(' → ')

    const mockRoute = MOCK_ROUTES.find(
      (r) => r.origin === origin && r.destination === destination,
    )
    const distanceKm = mockRoute?.distance ?? 100
    const durationMinutes = Math.round((distanceKm / 50) * 60)

    const departureTime = route.nextDeparture?.departureTime ?? '08:00'
    const [depH, depM] = departureTime.split(':').map(Number)
    const arrivalTotalMins = depH * 60 + depM + durationMinutes
    const arrivalTime = `${(Math.floor(arrivalTotalMins / 60) % 24).toString().padStart(2, '0')}:${(arrivalTotalMins % 60).toString().padStart(2, '0')}`

    const stops: RouteStop[] = [
      { city: origin, time: departureTime, durationFromPrev: null, isEndpoint: true },
      { city: destination, time: arrivalTime, durationFromPrev: formatDuration(durationMinutes), isEndpoint: true },
    ]

    const operatingDays = getOperatingDays(route.schedulesTodayCount)

    const totalCoopSchedules = coop.routes.reduce((s, r) => s + r.schedulesTodayCount, 0)
    const routeFraction = totalCoopSchedules > 0 ? route.schedulesTodayCount / totalCoopSchedules : 0.25
    const statistics = buildStatistics(coop.recentHistory, route, routeFraction)

    const alternatives: AlternativeRoute[] = []
    for (const otherCoop of MOCK_COOPERATIVE_DETAILS) {
      if (otherCoop.id === coop.id) continue
      const altRoute = otherCoop.routes.find((r) => r.displayName === route.displayName)
      if (!altRoute) continue
      alternatives.push({
        id: altRoute.id,
        displayName: altRoute.displayName,
        cooperativeName: otherCoop.name,
        cooperativeColor: otherCoop.brandColor,
        cooperativeId: otherCoop.id,
        priceFrom: altRoute.priceFrom,
        durationText: altRoute.durationText,
        nextDeparture: altRoute.nextDeparture,
        routeRating: altRoute.routeRating,
      })
    }

    return {
      id,
      displayName: route.displayName,
      origin,
      destination,
      durationText: route.durationText,
      durationMinutes,
      priceFrom: route.priceFrom,
      rating: route.routeRating,
      cooperative: {
        id: coop.id,
        name: coop.name,
        brandColor: coop.brandColor,
        rating: { average: coop.rating, count: coop.ratingCount },
      },
      stops,
      operatingDays,
      statistics,
      alternatives,
    }
  }

  return null
}
