const STORAGE_KEY = 'vh_recent_destinations'

export type RecentDestination = {
  cityId: string
  cityName: string
  lastSearchedAt: string
}

export function getRecentDestinations(): RecentDestination[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentDestination(cityId: string, cityName: string): void {
  try {
    const existing = getRecentDestinations()
    const filtered = existing.filter((d) => d.cityId !== cityId)
    const updated = [
      { cityId, cityName, lastSearchedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage unavailable
  }
}
