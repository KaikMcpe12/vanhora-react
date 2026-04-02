import { Heart } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useFavorites, useToggleFavorite } from '@/hooks/use-favorites'
import { getMockScheduleById } from '@/lib/data/mock-schedules'
import type { Schedule } from '@/lib/types/schedule'

import { type Favorite, FavoriteCard } from './favorite-card'

// Helper: Convert Schedule → Favorite
function scheduleToFavorite(schedule: Schedule): Favorite {
  return {
    id: schedule.id,
    cooperativeName: schedule.cooperativeName,
    cooperativeImage: schedule.cooperativeImage,
    departureTime: schedule.departureTime,
    arrivalTime: schedule.arrivalTime,
    duration: schedule.duration,
    origin: schedule.origin,
    destination: schedule.destination,
    price: schedule.price,
    status: schedule.status,
    badge: schedule.badge,
  }
}

// Loading Skeleton
function FavoritesSkeleton() {
  return (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-5 w-5 animate-pulse rounded" />
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-4 w-6 animate-pulse rounded-full" />
        </div>
      </div>
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-24 animate-pulse items-center gap-3 rounded-xl border p-3"
          >
            <div className="bg-muted h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-3 w-32 rounded" />
              <div className="bg-muted h-4 w-48 rounded" />
              <div className="bg-muted h-2 w-40 rounded" />
            </div>
            <div className="bg-muted h-8 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function FavoriteSchedules() {
  const { data: favoritesData, isLoading } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()

  // Buscar schedules completos e converter para Favorite
  const favorites = useMemo(() => {
    if (!favoritesData?.ids.length) return []

    return favoritesData.ids
      .map((id) => getMockScheduleById(id))
      .filter((schedule): schedule is Schedule => schedule !== null)
      .map(scheduleToFavorite)
  }, [favoritesData])

  // Filtrar apenas ativos (upcoming-soon) e limitar a 3
  const activeFavorites = useMemo(
    () => favorites.filter((f) => f.status === 'upcoming-soon').slice(0, 3),
    [favorites],
  )

  // Calcular quantos favoritos não estão sendo mostrados
  const totalFavorites = favorites.length
  const activeCount = favorites.filter(
    (f) => f.status === 'upcoming-soon',
  ).length
  const hiddenCount = Math.max(0, activeCount - 3)

  // Loading state
  if (isLoading) {
    return <FavoritesSkeleton />
  }

  // Empty state
  if (totalFavorites === 0) {
    return (
      <div className="bg-card rounded-xl border p-6 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
          <Heart className="h-6 w-6 text-rose-500" />
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          Você ainda não tem horários favoritos
        </p>
        <Link
          to="/schedules"
          className="text-primary hover:text-primary/80 text-xs font-medium"
        >
          Explorar horários →
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border shadow-sm">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 shrink-0 fill-rose-500 text-rose-500" />
          <span className="text-foreground text-sm font-semibold">
            Seus Favoritos
          </span>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            {totalFavorites}
          </span>
          {activeCount > 0 && (
            <span className="text-muted-foreground text-xs">
              • {activeCount} disponíve{activeCount > 1 ? 'is' : 'l'}
            </span>
          )}
        </div>
      </div>

      {/* Lista (máximo 3 ativos) */}
      <div className="space-y-3 p-4">
        {activeFavorites.length > 0 ? (
          activeFavorites.map((favorite) => (
            <FavoriteCard
              key={favorite.id}
              favorite={favorite}
              onRemove={(id) => toggleFavorite(id)}
            />
          ))
        ) : (
          <p className="text-muted-foreground py-4 text-center text-xs">
            Nenhum favorito ativo no momento
          </p>
        )}
      </div>

      {/* Footer: Botão "Ver todos" */}
      {hiddenCount > 0 && (
        <div className="border-t p-3 text-center">
          <Link
            to="/schedules/favorites"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium transition-colors"
          >
            Ver todos os favoritos
            <span className="text-muted-foreground">
              ({hiddenCount} outros)
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}
