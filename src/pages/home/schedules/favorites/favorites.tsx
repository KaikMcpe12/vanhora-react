import { ChevronDown, Filter } from 'lucide-react'
import { useState } from 'react'

import { AdvanceFilter } from '@/components/advance-filter'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

import { FavoritesHero } from './components/favorites-hero'
import { FavoritesList } from './components/favorites-list'
import { FavoritesQuickFilters } from './components/favorites-quick-filters'

export function Favorites() {
  const [quickFilters, setQuickFilters] = useState<{
    origin?: string
    destination?: string
  }>({})

  return (
    <div className="from-muted/30 to-background min-h-screen bg-linear-to-b">
      <FavoritesHero />
      <FavoritesQuickFilters onFilterChange={setQuickFilters} />

      <div className="px-2 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-12">
          {/* Sidebar - 1/3 of width (4 columns) */}
          <aside
            className={cn(
              'col-span-1 space-y-6 transition-all duration-300 sm:col-span-1 lg:col-span-4',
              'lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto',
            )}
          >
            {/* Advanced Filters */}
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

          {/* Main Content - 2/3 of width (8 columns) */}
          <main className="col-span-1 sm:col-span-2 lg:col-span-8">
            <FavoritesList filters={quickFilters} />
          </main>
        </div>
      </div>
    </div>
  )
}
