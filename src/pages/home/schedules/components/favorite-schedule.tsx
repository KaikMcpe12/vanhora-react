import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { type Favorite, FavoriteCard } from './favorite-card'

interface FavoriteSchedulesProps {
  schedules?: Favorite[]
  defaultOpen?: boolean
}

const MOCK_FAVORITES: Favorite[] = [
  {
    id: '1',
    cooperativeName: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    status: 'upcoming-soon',
    badge: 'available',
  },
  {
    id: '2',
    cooperativeName: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    status: 'past',
    badge: 'cancelled',
  },
  {
    id: '3',
    cooperativeName: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    status: 'upcoming',
    badge: 'available',
  },
]

export function FavoriteSchedules({
  schedules = MOCK_FAVORITES,
}: FavoriteSchedulesProps) {
  const availableCount = schedules.filter(
    (s) => s.status !== 'past' && s.badge === 'available',
  ).length

  if (schedules.length === 0) {
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
      {/* ✅ Header simplificado */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 shrink-0 fill-rose-500 text-rose-500" />
          <span className="text-foreground text-sm font-semibold">
            Seus Favoritos
          </span>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            {schedules.length}
          </span>
          {availableCount > 0 && (
            <span className="text-muted-foreground text-xs">
              • {availableCount} disponíve{availableCount > 1 ? 'is' : 'l'}
            </span>
          )}
        </div>
      </div>

      {/* ✅ Lista sempre visível */}
      <div className="space-y-3 p-4">
        {schedules.map((favorite) => (
          <FavoriteCard key={favorite.id} favorite={favorite} />
        ))}
      </div>
    </div>
  )
}
