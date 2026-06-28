import { ArrowUpDown, Heart, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { AdvanceFilter } from '@/components/advance-filter'
import { FavoriteCard } from './favorite-card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useFavorites } from '@/hooks/use-favorites'
import { useSchedules } from '@/hooks/use-schedules'
import type { SortMode } from '@/lib/utils/group-schedules'
import { cn } from '@/lib/utils'
import type { Schedule } from '@/lib/types/schedule'

function scheduleToFavorite(s: Schedule) {
  return {
    id: s.id,
    cooperativeName: s.cooperativeName,
    cooperativeImage: s.cooperativeImage,
    departureTime: s.departureTime,
    arrivalTime: s.arrivalTime,
    duration: s.duration,
    origin: s.origin,
    destination: s.destination,
    price: s.price,
    status: s.status,
    badge: s.badge,
  }
}

const SORT_LABELS: Record<SortMode, string> = {
  earliest: 'Mais cedo',
  cheapest: 'Mais barato',
  highest_rated: 'Mais avaliado',
}

interface FilterChipProps {
  label: string
  icon: React.ReactNode
  active?: boolean
  badge?: number
  onClick: () => void
  className?: string
}

function FilterChip({ label, icon, active, badge, onClick, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-[5px]',
        'text-[12px] font-medium transition-all duration-150',
        active
          ? 'border-[#0F6E56] text-[#0F6E56] bg-[rgba(15,110,86,0.06)] dark:bg-[rgba(15,110,86,0.12)]'
          : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground',
        className,
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold',
            active
              ? 'bg-[#0F6E56] text-white'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

interface FilterToolbarProps {
  activeFiltersCount: number
  favoritesCount: number
  sortMode: SortMode
  onSortChange: (m: SortMode) => void
  className?: string
}

export function FilterToolbar({
  activeFiltersCount,
  favoritesCount,
  sortMode,
  onSortChange,
  className,
}: FilterToolbarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [favOpen, setFavOpen] = useState(false)

  const { favoriteIds, toggleFavorite } = useFavorites()
  const { schedules: favSchedules } = useSchedules({ ids: favoriteIds }, { limit: 50 })

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-2 overflow-x-auto border-b border-border/40 bg-background px-4 py-2.5',
          'scrollbar-none [&::-webkit-scrollbar]:hidden',
          className,
        )}
        role="toolbar"
        aria-label="Filtros e ordenação"
      >
        {/* Filtros avançados */}
        <FilterChip
          label="Filtros"
          icon={<SlidersHorizontal size={13} strokeWidth={1.75} />}
          active={activeFiltersCount > 0}
          badge={activeFiltersCount}
          onClick={() => setFiltersOpen(true)}
        />

        {/* Ordenar */}
        <FilterChip
          label={SORT_LABELS[sortMode]}
          icon={<ArrowUpDown size={13} strokeWidth={1.75} />}
          active={sortMode !== 'earliest'}
          onClick={() => setSortOpen(true)}
        />

        {/* Favoritos */}
        <FilterChip
          label="Favoritos"
          icon={<Heart size={13} strokeWidth={1.75} />}
          badge={favoritesCount}
          active={favoritesCount > 0}
          onClick={() => setFavOpen(true)}
        />
      </div>

      {/* Sheet: filtros avançados */}
      <Sheet open={filtersOpen} onOpenChange={(v) => !v && setFiltersOpen(false)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-5 pb-8 pt-5">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-semibold">Filtros avançados</SheetTitle>
          </SheetHeader>
          <AdvanceFilter />
        </SheetContent>
      </Sheet>

      {/* Sheet: ordenação */}
      <Sheet open={sortOpen} onOpenChange={(v) => !v && setSortOpen(false)}>
        <SheetContent side="bottom" className="rounded-t-2xl px-5 pb-8 pt-5">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-semibold">Ordenar por</SheetTitle>
          </SheetHeader>
          <div className="space-y-1">
            {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  onSortChange(mode)
                  setSortOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3 text-[14px] transition-colors',
                  sortMode === mode
                    ? 'bg-[rgba(15,110,86,0.08)] font-medium text-[#0F6E56]'
                    : 'text-foreground hover:bg-muted/60',
                )}
              >
                {SORT_LABELS[mode]}
                {sortMode === mode && (
                  <span className="text-[#0F6E56] text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet: favoritos */}
      <Sheet open={favOpen} onOpenChange={(v) => !v && setFavOpen(false)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl px-5 pb-8 pt-5">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-base font-semibold">
              Favoritos
              {favoritesCount > 0 && (
                <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                  ({favoritesCount})
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          {favoritesCount === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Você ainda não tem favoritos. Toque no coração de qualquer horário para salvar.
            </p>
          ) : (
            <div className="space-y-3">
              {favSchedules.map((s) => (
                <FavoriteCard
                  key={s.id}
                  favorite={scheduleToFavorite(s)}
                  onRemove={() => toggleFavorite(s.id)}
                />
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
