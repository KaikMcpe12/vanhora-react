import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export type ScheduleStatus = 'upcoming-soon' | 'upcoming' | 'past'
export type ScheduleBadge = 'available' | 'cancelled'

export interface Schedule {
  id: string
  cooperativeName: string
  cooperativeImage?: string
  cooperativeRating?: number
  cooperativeReviews?: number
  tripCode?: string
  departureTime: string
  arrivalTime: string
  duration: string
  origin: string
  destination: string
  price: number
  status: ScheduleStatus
  badge: ScheduleBadge
  isFavorite?: boolean
}

const STATUS_CONFIG: Record<ScheduleStatus, { badge: string; label: string }> =
  {
    'upcoming-soon': {
      badge: 'bg-emerald-500 text-white',
      label: 'Disponível',
    },
    upcoming: { badge: 'bg-blue-500 text-white', label: 'Em breve' },
    past: { badge: 'bg-muted text-muted-foreground', label: 'Encerrado' },
  }

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const statusConfig = STATUS_CONFIG[schedule.status]
  const isPast = schedule.status === 'past'
  const isCancelled = schedule.badge === 'cancelled'
  const isDimmed = isPast || isCancelled

  return (
    <div
      className={`border-border bg-card overflow-hidden rounded-2xl border shadow-sm transition-all duration-200 ${!isDimmed ? 'hover:shadow-lg' : 'opacity-70'}`}
    >
      <div className="relative h-32 overflow-hidden">
        {schedule.cooperativeImage ? (
          <img
            src={schedule.cooperativeImage}
            alt={schedule.cooperativeName}
            className={`h-full w-full object-cover ${isDimmed ? 'grayscale' : ''}`}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: isDimmed
                ? 'linear-gradient(135deg, #4b5563, #6b7280)'
                : 'linear-gradient(135deg, #166534, #16a34a)',
            }}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black tracking-tight text-white drop-shadow-lg">
            {schedule.cooperativeName}
          </span>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-14"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-2.5">
          <div>
            <p className="text-sm leading-tight font-semibold text-white drop-shadow">
              {schedule.cooperativeName}
            </p>
            {schedule.cooperativeRating && (
              <div className="mt-0.5 flex items-center gap-1">
                <Star className="h-3 w-3 text-white/70" />
                <span className="text-xs text-white/90">
                  {schedule.cooperativeRating}
                  {schedule.cooperativeReviews && (
                    <span className="text-white/60">
                      {' '}
                      ({schedule.cooperativeReviews} avaliações)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {schedule.isFavorite !== undefined && (
          <button className="absolute top-3 right-3 z-10">
            <Star
              className={`h-5 w-5 drop-shadow ${
                schedule.isFavorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-white/30 text-white/60'
              }`}
            />
          </button>
        )}
      </div>

      <div className="px-4 pt-3.5 pb-0">
        <div className="mb-3 flex items-center justify-between">
          {isCancelled ? (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              Cancelado
            </span>
          ) : (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.badge}`}
            >
              {statusConfig.label}
            </span>
          )}
          {schedule.tripCode && (
            <span className="text-muted-foreground font-mono text-xs">
              #{schedule.tripCode}
            </span>
          )}
        </div>

        <div className="mb-1 flex items-start gap-3">
          <div>
            <p
              className={`text-3xl leading-none font-bold tabular-nums ${isDimmed ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {schedule.departureTime}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {schedule.origin}
            </p>
          </div>

          <div className="mt-3 flex flex-1 items-center gap-1.5">
            <div className="border-border h-px flex-1 border-t border-dashed" />
            <span className="text-muted-foreground shrink-0 text-[10px] whitespace-nowrap">
              {schedule.duration}
            </span>
            <div className="border-border h-px flex-1 border-t border-dashed" />
            <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          </div>

          <div className="text-right">
            <p
              className={`text-3xl leading-none font-bold tabular-nums ${isDimmed ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {schedule.arrivalTime}
            </p>
            <p className="text-muted-foreground mt-1 text-right text-xs">
              {schedule.destination}
            </p>
          </div>
        </div>
      </div>

      <div className="border-border mx-4 mt-3.5 flex items-center justify-between border-t py-3">
        <div>
          <p className="text-muted-foreground mb-0.5 text-[10px] font-medium tracking-wide uppercase">
            Preço
          </p>
          <p
            className={`text-xl font-bold tabular-nums ${
              isCancelled
                ? 'text-muted-foreground line-through'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            R$ {schedule.price.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="rounded-xl border-2 border-emerald-500 font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
          disabled={isCancelled || isPast}
        >
          <Link to={`/schedules/${schedule.id}`}>Ver Detalhes</Link>
        </Button>
      </div>
    </div>
  )
}
