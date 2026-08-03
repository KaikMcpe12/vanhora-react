import { Filter } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useFavorites } from '@/hooks/use-favorites'
import { useMediaQuery } from '@/hooks/use-media-query'
import { getMockSchedules } from '@/lib/data/mock-schedules'
import type { Schedule } from '@/lib/types/schedule'
import { getCooperativeColor } from '@/lib/utils/schedule-status'

import { FavoritesEmptyState } from './components/favorites-empty-state'
import { FavoritesFeed } from './components/favorites-feed'
import {
  type AvailableCoop,
  type AvailableRoute,
  FavoritesFilterPanel,
  type FavoritesFilters,
} from './components/favorites-filter-panel'
import { FavoritesHeader } from './components/favorites-header'

function deriveAvailableRoutes(schedules: Schedule[]): AvailableRoute[] {
  const map = new Map<string, { label: string; count: number }>()
  schedules.forEach((s) => {
    const key = `${s.origin}|${s.destination}`
    const existing = map.get(key)
    if (existing) existing.count++
    else map.set(key, { label: `${s.origin} → ${s.destination}`, count: 1 })
  })
  return Array.from(map.entries()).map(([id, { label, count }]) => ({ id, label, count }))
}

function deriveAvailableCoops(schedules: Schedule[]): AvailableCoop[] {
  const map = new Map<string, { color: string; count: number }>()
  schedules.forEach((s) => {
    const existing = map.get(s.cooperativeName)
    if (existing) existing.count++
    else map.set(s.cooperativeName, { color: getCooperativeColor(s.cooperativeName), count: 1 })
  })
  return Array.from(map.entries()).map(([name, { color, count }]) => ({ name, color, count }))
}

function applyFavoritesFilters(schedules: Schedule[], filters: FavoritesFilters): Schedule[] {
  return schedules.filter((s) => {
    if (filters.status === 'active' && s.badge === 'cancelled') return false
    if (filters.status === 'cancelled' && s.badge !== 'cancelled') return false
    if (filters.routeKeys.length > 0) {
      const key = `${s.origin}|${s.destination}`
      if (!filters.routeKeys.includes(key)) return false
    }
    if (filters.cooperativeNames.length > 0) {
      if (!filters.cooperativeNames.includes(s.cooperativeName)) return false
    }
    return true
  })
}

export function Favorites() {
  const { favoriteIds } = useFavorites()
  const [filters, setFilters] = useState<FavoritesFilters>({
    routeKeys: [],
    cooperativeNames: [],
    status: 'active',
  })
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 1023px)')

  const allFavoriteSchedules = useMemo(
    () => getMockSchedules().filter((s) => favoriteIds.includes(s.id)),
    [favoriteIds],
  )

  const availableRoutes = useMemo(() => deriveAvailableRoutes(allFavoriteSchedules), [allFavoriteSchedules])
  const availableCooperatives = useMemo(() => deriveAvailableCoops(allFavoriteSchedules), [allFavoriteSchedules])

  const filteredSchedules = useMemo(
    () => applyFavoritesFilters(allFavoriteSchedules, filters),
    [allFavoriteSchedules, filters],
  )

  const activeFilterCount =
    filters.routeKeys.length +
    filters.cooperativeNames.length +
    (filters.status !== 'all' ? 1 : 0)

  if (favoriteIds.length === 0) return <FavoritesEmptyState />

  const filterPanel = (
    <FavoritesFilterPanel
      filters={filters}
      onFiltersChange={setFilters}
      availableRoutes={availableRoutes}
      availableCooperatives={availableCooperatives}
    />
  )

  return (
    <div className="min-h-screen">
      {/* header */}
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6">
        <FavoritesHeader
          favoriteCount={favoriteIds.length}
          distinctRoutesCount={availableRoutes.length}
        />
        {isMobile && (
          <Button
            variant="outline"
            size="sm"
            className="mb-8 flex items-center gap-2"
            onClick={() => setSheetOpen(true)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Button>
        )}
      </div>

      {/* content grid */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-16 lg:grid-cols-[240px_1fr]">
        {!isMobile && <aside>{filterPanel}</aside>}
        <main>
          <FavoritesFeed schedules={filteredSchedules} />
        </main>
      </div>

      {isMobile && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="w-72 overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            {filterPanel}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
