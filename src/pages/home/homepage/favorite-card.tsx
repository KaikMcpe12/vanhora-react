import { ArrowRight, Clock, Heart, MapPin } from 'lucide-react'

export type FavoriteCardStatus = 'upcoming-soon' | 'upcoming' | 'past'
export type FavoriteCardBadge = 'available' | 'cancelled'

export interface Favorite {
  id: string
  cooperativeName: string
  cooperativeImage?: string
  departureTime: string
  arrivalTime: string
  duration: string
  origin: string
  destination: string
  price: number
  status: FavoriteCardStatus
  badge: FavoriteCardBadge
}

const STATUS_STRIPE: Record<FavoriteCardStatus, string> = {
  'upcoming-soon': 'bg-emerald-500',
  upcoming: 'bg-blue-500',
  past: 'bg-muted-foreground/30',
}

interface FavoriteCardProps {
  favorite: Favorite
  onRemove?: (id: string) => void
}

export function FavoriteCard({ favorite, onRemove }: FavoriteCardProps) {
  const isPast = favorite.status === 'past'
  const isCancelled = favorite.badge === 'cancelled'
  const isDimmed = isPast || isCancelled

  return (
    <div
      className={`group relative flex overflow-hidden rounded-xl border transition-all duration-200 ${
        isDimmed
          ? 'border-border/50'
          : 'border-border hover:border-primary/30 hover:shadow-md'
      } `}
    >
      <div
        className={`absolute top-0 left-0 h-full w-2 shrink-0 transition-all duration-200 ${STATUS_STRIPE[favorite.status]} ${!isDimmed ? 'group-hover:w-2.5' : ''}`}
      />

      <div
        className={`flex flex-1 items-center gap-3 py-3 pr-3 pl-6 transition-opacity duration-200 ${isDimmed ? 'opacity-60' : ''}`}
      >
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          {favorite.cooperativeImage ? (
            <img
              src={favorite.cooperativeImage}
              alt={favorite.cooperativeName}
              className={`h-full w-full object-cover ${isDimmed ? 'grayscale' : ''}`}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: isDimmed
                  ? 'linear-gradient(135deg, #4b5563, #6b7280)'
                  : 'linear-gradient(135deg, #166534, #16a34a)',
              }}
            >
              <span className="text-[10px] leading-none font-black text-white">
                {favorite.cooperativeName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}

          {!isCancelled && (
            <span
              className={`border-background absolute right-0.5 bottom-0.5 h-2 w-2 rounded-full border ${
                favorite.status === 'upcoming-soon'
                  ? 'bg-emerald-500'
                  : favorite.status === 'upcoming'
                    ? 'bg-blue-500'
                    : 'bg-muted-foreground/40'
              }`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span
              className={`truncate text-xs font-semibold ${isDimmed ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {favorite.cooperativeName}
            </span>

            {isCancelled && (
              <span className="shrink-0 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-red-500">
                Cancelado
              </span>
            )}
          </div>

          <div className="mb-1.5 flex items-center gap-1.5">
            <span
              className={`text-sm font-bold tabular-nums ${isDimmed ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {favorite.departureTime}
            </span>
            <div className="flex flex-1 items-center gap-0.5">
              <div className="bg-border h-px flex-1" />
              <ArrowRight className="text-muted-foreground h-2.5 w-2.5 shrink-0" />
            </div>
            <span
              className={`text-sm font-bold tabular-nums ${isDimmed ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {favorite.arrivalTime}
            </span>
          </div>

          <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              {favorite.origin} → {favorite.destination}
            </span>
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5 shrink-0" />
              {favorite.duration}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={() => onRemove?.(favorite.id)}
            className="text-rose-400 opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-rose-600"
            title="Remover favorito"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
          </button>

          <div className="text-right">
            <span className="text-muted-foreground block text-[9px] leading-none">
              a partir de
            </span>
            <span
              className={`text-sm font-bold tabular-nums ${
                isCancelled
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              R${favorite.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
