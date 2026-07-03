import { Filter } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  MOCK_COOPERATIVE_DETAILS,
  type CooperativeDetail,
} from '@/lib/data/mock-cooperative-details'
import { useCooperativesFilters, type CoopSort } from '@/hooks/use-cooperatives-filters'

import { CooperativesHeader } from './components/cooperatives-header'
import { CooperativesSearchBar } from './components/cooperatives-search-bar'
import { CooperativesFilterPanel } from './components/cooperatives-filter-panel'
import { CooperativesList } from './components/cooperatives-list'

function ratingValue(f: string): number {
  if (f === '3+') return 3
  if (f === '4+') return 4
  if (f === '5') return 5
  return 0
}

function sortCooperatives(list: CooperativeDetail[], sort: CoopSort): CooperativeDetail[] {
  return [...list].sort((a, b) => {
    let cmp = 0
    if (sort.field === 'name') cmp = a.name.localeCompare(b.name, 'pt-BR')
    else if (sort.field === 'route_count') cmp = a.routeCount - b.routeCount
    else if (sort.field === 'rating') cmp = a.rating - b.rating
    return sort.direction === 'asc' ? cmp : -cmp
  })
}

export function Cooperatives() {
  const navigate = useNavigate()
  const { q, cities, minRating, sort, setQ, setCities, setMinRating, setSort, resetAll, activeFilterCount } =
    useCooperativesFilters()
  const [sheetOpen, setSheetOpen] = useState(false)

  const filtered = useMemo(() => {
    let list = MOCK_COOPERATIVE_DETAILS
    if (q) list = list.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
    if (cities.length) list = list.filter((c) => cities.some((city) => c.citiesServed.includes(city)))
    if (minRating !== 'any') list = list.filter((c) => c.rating >= ratingValue(minRating))
    return sortCooperatives(list, sort)
  }, [q, cities, minRating, sort])

  // cidades disponíveis — respeita todos os filtros exceto city para manter contagens dinâmicas
  const availableCities = useMemo(() => {
    const baseList = MOCK_COOPERATIVE_DETAILS.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false
      if (minRating !== 'any' && c.rating < ratingValue(minRating)) return false
      return true
    })
    const allCities = new Set<string>()
    MOCK_COOPERATIVE_DETAILS.forEach((c) => c.citiesServed.forEach((city) => allCities.add(city)))
    return Array.from(allCities)
      .sort()
      .map((name) => ({
        name,
        count: baseList.filter((c) => c.citiesServed.includes(name)).length,
      }))
  }, [q, minRating])

  const totalCities = useMemo(
    () => new Set(MOCK_COOPERATIVE_DETAILS.flatMap((c) => c.citiesServed)).size,
    [],
  )

  const filterPanel = (
    <CooperativesFilterPanel
      filters={{ cities, minRating, sort }}
      onFiltersChange={(updates) => {
        if (updates.cities !== undefined) setCities(updates.cities)
        if (updates.minRating !== undefined) setMinRating(updates.minRating)
        if (updates.sort !== undefined) setSort(updates.sort)
      }}
      availableCities={availableCities}
      activeFilterCount={activeFilterCount}
      onReset={resetAll}
    />
  )

  return (
    <div className="min-h-screen">
      {/* header */}
      <div className="mx-auto flex max-w-7xl items-end justify-between px-6">
        <CooperativesHeader
          cooperativeCount={MOCK_COOPERATIVE_DETAILS.length}
          citiesServedCount={totalCities}
        />
        <Button
          variant="outline"
          size="sm"
          className="mb-8 flex items-center gap-2 lg:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
      </div>

      {/* content */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 pb-16 lg:grid-cols-[240px_1fr]">
        {/* rail desktop */}
        <aside className="hidden lg:block">
          {filterPanel}
        </aside>

        {/* main */}
        <main className="flex flex-col gap-4">
          <CooperativesSearchBar value={q} onChange={setQ} />
          <CooperativesList
            cooperatives={filtered}
            isLoading={false}
            onCooperativeClick={(id) => navigate(`/cooperatives/${id}`)}
          />
        </main>
      </div>

      {/* mobile sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          {filterPanel}
        </SheetContent>
      </Sheet>
    </div>
  )
}
