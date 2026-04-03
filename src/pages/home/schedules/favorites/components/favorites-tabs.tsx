import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFavorites } from '@/hooks/use-favorites'

import { FavoritesPastTab } from './favorites-past-tab'
import { FavoritesUpcomingTab } from './favorites-upcoming-tab'

export function FavoritesTabs() {
  const { favoriteIds } = useFavorites()

  // Se não tem favoritos, não renderiza tabs
  if (favoriteIds.length === 0) return null

  return (
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
  )
}
