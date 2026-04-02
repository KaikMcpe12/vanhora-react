import { Heart } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { ScheduleCard } from '@/components/schedule-card'
import { Badge } from '@/components/ui/badge'
import { useFavorites } from '@/hooks/use-favorites'
import { getMockScheduleById } from '@/lib/data/mock-schedules'
import type { Schedule, ScheduleStatus } from '@/lib/types/schedule'

// Status group labels and badges
const STATUS_GROUPS: Record<
  ScheduleStatus,
  { label: string; badgeVariant: 'default' | 'secondary' | 'outline' }
> = {
  'upcoming-soon': {
    label: 'Disponíveis Agora',
    badgeVariant: 'default',
  },
  upcoming: {
    label: 'Em Breve',
    badgeVariant: 'secondary',
  },
  past: {
    label: 'Encerrados',
    badgeVariant: 'outline',
  },
}

interface FavoritesListProps {
  filters?: {
    origin?: string
    destination?: string
  }
}

// Loading Skeleton
function ListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="bg-muted mb-3 h-6 w-40 animate-pulse rounded" />
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {[1, 2].map((j) => (
              <div key={j} className="bg-muted h-64 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function FavoritesList({ filters }: FavoritesListProps) {
  const { data: favoritesData, isLoading } = useFavorites()

  // Buscar schedules completos
  const favoriteSchedules = useMemo(() => {
    if (!favoritesData?.ids.length) return []

    return favoritesData.ids
      .map((id) => getMockScheduleById(id))
      .filter((schedule): schedule is Schedule => schedule !== null)
  }, [favoritesData])

  // Aplicar filtros rápidos
  const filteredSchedules = useMemo(() => {
    if (!filters?.origin && !filters?.destination) return favoriteSchedules

    return favoriteSchedules.filter((schedule) => {
      const matchOrigin = !filters.origin || schedule.origin === filters.origin
      const matchDestination =
        !filters.destination || schedule.destination === filters.destination
      return matchOrigin && matchDestination
    })
  }, [favoriteSchedules, filters])

  // Agrupar por status (usando filteredSchedules)
  const groupedSchedules = useMemo(() => {
    const groups: Record<ScheduleStatus, Schedule[]> = {
      'upcoming-soon': [],
      upcoming: [],
      past: [],
    }

    filteredSchedules.forEach((schedule) => {
      groups[schedule.status].push(schedule)
    })

    return groups
  }, [filteredSchedules])

  // Loading state
  if (isLoading) {
    return <ListSkeleton />
  }

  // Empty state - verificação mais robusta
  if (
    !favoritesData ||
    !favoritesData.ids.length ||
    favoriteSchedules.length === 0
  ) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Heart className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-foreground mb-2 text-xl font-bold">
          Nenhum favorito salvo
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Explore os horários disponíveis e adicione seus favoritos
        </p>
        <Link
          to="/schedules"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
        >
          Explorar Horários
        </Link>
      </div>
    )
  }

  // No results after filtering
  if (filteredSchedules.length === 0) {
    return (
      <div className="bg-card rounded-xl border p-12 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <Heart className="text-muted-foreground h-6 w-6" />
        </div>
        <h2 className="text-foreground mb-2 text-lg font-bold">
          Nenhum favorito encontrado
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Tente ajustar os filtros para ver mais resultados
        </p>
      </div>
    )
  }

  return (
    <div
      className="space-y-8"
      key={`favorites-list-${favoriteSchedules.length}`}
    >
      {/* Renderizar grupos (apenas grupos com conteúdo) */}
      {(Object.keys(groupedSchedules) as ScheduleStatus[]).map((status) => {
        const schedules = groupedSchedules[status]
        if (schedules.length === 0) return null

        const group = STATUS_GROUPS[status]

        return (
          <section key={`${status}-${schedules.length}`}>
            {/* Section Header */}
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-foreground text-lg font-bold">
                {group.label}
              </h2>
              <Badge variant={group.badgeVariant} className="rounded-full">
                {schedules.length}
              </Badge>
            </div>

            {/* Schedule Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {schedules.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
