import { Filter } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFavorites } from '@/hooks/use-favorites'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'
import { CITY_ID_TO_NAME } from '@/lib/data/mock-cities'

import { FavoritesPastTab } from './favorites-past-tab'
import { FavoritesUpcomingTab } from './favorites-upcoming-tab'

export function FavoritesTabs() {
  const { favoriteIds } = useFavorites()
  const { filtersFromUrl } = useScheduleFilters()

  // Se não tem favoritos, não renderiza tabs
  if (favoriteIds.length === 0) return null

  // Verifica se há filtros ativos (exceto data)
  const hasActiveFilters = Boolean(
    filtersFromUrl.origin || filtersFromUrl.destination,
  )

  // Monta descrição dos filtros ativos
  const getFilterDescription = () => {
    const parts: string[] = []

    if (filtersFromUrl.origin) {
      const originName =
        CITY_ID_TO_NAME[filtersFromUrl.origin] || filtersFromUrl.origin
      parts.push(`Origem: ${originName}`)
    }

    if (filtersFromUrl.destination) {
      const destName =
        CITY_ID_TO_NAME[filtersFromUrl.destination] ||
        filtersFromUrl.destination
      parts.push(`Destino: ${destName}`)
    }

    return parts.join(' • ')
  }

  return (
    <div className="space-y-4">
      {hasActiveFilters && (
        <Alert className="border-primary/20 bg-primary/5">
          <Filter className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <span className="font-medium">Filtros aplicados:</span>{' '}
            {getFilterDescription()}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="past">Decorridos</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <FavoritesUpcomingTab />
        </TabsContent>

        <TabsContent value="past">
          <FavoritesPastTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
