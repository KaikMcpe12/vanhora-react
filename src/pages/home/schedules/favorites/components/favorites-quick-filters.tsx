import { MapPin, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/use-favorites'
import { getMockScheduleById } from '@/lib/data/mock-schedules'

interface QuickFiltersProps {
  onFilterChange?: (filters: { origin?: string; destination?: string }) => void
}

export function FavoritesQuickFilters({ onFilterChange }: QuickFiltersProps) {
  const { data: favoritesData } = useFavorites()
  const [selectedOrigin, setSelectedOrigin] = useState<string>()
  const [selectedDestination, setSelectedDestination] = useState<string>()

  // Extrair origens e destinos únicos dos favoritos
  const { origins, destinations } = useMemo(() => {
    if (!favoritesData?.ids.length) return { origins: [], destinations: [] }

    const schedules = favoritesData.ids
      .map((id) => getMockScheduleById(id))
      .filter((s) => s !== null)

    const originsSet = new Set(schedules.map((s) => s.origin))
    const destinationsSet = new Set(schedules.map((s) => s.destination))

    return {
      origins: Array.from(originsSet).sort(),
      destinations: Array.from(destinationsSet).sort(),
    }
  }, [favoritesData])

  const handleOriginClick = (origin: string) => {
    const newOrigin = selectedOrigin === origin ? undefined : origin
    setSelectedOrigin(newOrigin)
    onFilterChange?.({ origin: newOrigin, destination: selectedDestination })
  }

  const handleDestinationClick = (destination: string) => {
    const newDestination =
      selectedDestination === destination ? undefined : destination
    setSelectedDestination(newDestination)
    onFilterChange?.({ origin: selectedOrigin, destination: newDestination })
  }

  const handleClearAll = () => {
    setSelectedOrigin(undefined)
    setSelectedDestination(undefined)
    onFilterChange?.({})
  }

  const hasFilters = selectedOrigin || selectedDestination

  if (origins.length === 0 && destinations.length === 0) {
    return null
  }

  return (
    <div className="bg-card sticky top-0 z-20 border-b px-4 py-3 shadow-sm backdrop-blur-sm lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Label */}
          <div className="flex items-center gap-2">
            <MapPin className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm font-medium">
              Filtrar por:
            </span>
          </div>

          {/* Origins */}
          {origins.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Origem
              </span>
              {origins.map((origin) => (
                <Badge
                  key={origin}
                  variant={selectedOrigin === origin ? 'default' : 'outline'}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleOriginClick(origin)}
                >
                  {origin}
                </Badge>
              ))}
            </div>
          )}

          {/* Destinations */}
          {destinations.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-xs font-medium">
                Destino
              </span>
              {destinations.map((destination) => (
                <Badge
                  key={destination}
                  variant={
                    selectedDestination === destination ? 'default' : 'outline'
                  }
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => handleDestinationClick(destination)}
                >
                  {destination}
                </Badge>
              ))}
            </div>
          )}

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="hover:bg-destructive/10 hover:text-destructive ml-auto text-xs transition-colors"
            >
              <X className="h-3 w-3" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
