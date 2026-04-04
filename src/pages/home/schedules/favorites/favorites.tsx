import { ChevronDown, Filter, Heart } from 'lucide-react'

import { AdvanceFilter } from '@/components/advance-filter'
import { EmptyState } from '@/components/empty-state'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'

import { FavoritesHero } from './components/favorites-hero'
import { FavoritesNowSection } from './components/favorites-now-section'
import { FavoritesTabs } from './components/favorites-tabs'

export function Favorites() {
  const { favoriteIds } = useFavorites()

  return (
    <div className="from-muted/30 to-background min-h-screen bg-linear-to-b">
      <FavoritesHero />

      {/* estado vazio */}
      {favoriteIds.length === 0 ? (
        <div className="mx-auto max-w-2xl px-4 py-16">
          <EmptyState
            icon={Heart}
            title="Você ainda não tem favoritos"
            description="Explore horários e adicione seus preferidos tocando no coração"
          />
        </div>
      ) : (
        <div className="px-2 py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-12">
            {/* sidebar */}
            <aside
              className={cn(
                'col-span-1 space-y-6 transition-all duration-300 sm:col-span-1 lg:col-span-4',
                'lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto',
              )}
            >
              {/* filtros avançados */}
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between rounded-lg border p-4 transition-colors">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filtros Avançados</span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <AdvanceFilter />
                </CollapsibleContent>
              </Collapsible>
            </aside>

            {/* conteúdo principal */}
            <main className="col-span-1 sm:col-span-2 lg:col-span-8">
              <FavoritesNowSection />
              <FavoritesTabs />
            </main>
          </div>
        </div>
      )}
    </div>
  )
}
