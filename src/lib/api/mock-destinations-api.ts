import { CITIES_WITH_IDS } from '@/lib/data/mock-cities'
import { getMockSchedules } from '@/lib/data/mock-schedules'

export type DestinationSummary = {
  cityId: string
  cityName: string
  scheduleCount: number
  priceFrom: number
  primaryCooperativeName?: string
}

export function getDestinationSummaries(cityNames: string[]): DestinationSummary[] {
  const allSchedules = getMockSchedules()

  return cityNames.map((cityName) => {
    const cityData = CITIES_WITH_IDS.find((c) => c.name === cityName)
    const destinationSchedules = allSchedules.filter(
      (s) => s.destination === cityName && s.badge !== 'cancelled',
    )

    const scheduleCount = destinationSchedules.length
    const priceFrom =
      scheduleCount > 0 ? Math.min(...destinationSchedules.map((s) => s.price)) : 0

    const coopCounts: Record<string, number> = {}
    destinationSchedules.forEach((s) => {
      coopCounts[s.cooperativeName] = (coopCounts[s.cooperativeName] ?? 0) + 1
    })
    const primaryCoop = Object.entries(coopCounts).sort(([, a], [, b]) => b - a)[0]?.[0]

    return {
      cityId: cityData?.id ?? cityName,
      cityName,
      scheduleCount,
      priceFrom,
      primaryCooperativeName: primaryCoop,
    }
  })
}
