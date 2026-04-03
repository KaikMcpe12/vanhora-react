import { ArrowRight, Heart, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/use-favorites'
import type { Schedule, ScheduleStatus } from '@/lib/types/schedule'
import { cn } from '@/lib/utils'

import { ScheduleDialog } from './schedule-dialog'
import { Dialog } from './ui/dialog'

const STATUS_CONFIG: Record<ScheduleStatus, { badge: string; label: string }> =
  {
    'upcoming-soon': {
      badge: 'bg-emerald-500 text-white',
      label: 'Disponível',
    },
    upcoming: { badge: 'bg-blue-500 text-white', label: 'Em breve' },
    past: {
      badge: 'bg-muted text-muted-foreground ring-1 ring-border',
      label: 'Encerrado',
    },
  }

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const [dialogOpen, setDialogOpen] = useState(false)

  // Hooks de favoritos
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites()
  const isFavorite = checkIsFavorite(schedule.id)

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

        <button
          onClick={(e) => {
            e.stopPropagation()
            const wasFavorite = isFavorite
            toggleFavorite(schedule.id)

            // Feedback visual com toast
            if (wasFavorite) {
              toast.info('Removido dos favoritos', {
                description: `${schedule.origin} → ${schedule.destination} às ${schedule.departureTime}`,
              })
            } else {
              toast.success('Adicionado aos favoritos', {
                description: `${schedule.origin} → ${schedule.destination} às ${schedule.departureTime}`,
              })
            }
          }}
          className="absolute top-3 right-3 z-10 transition-transform hover:scale-110 active:scale-95"
          aria-label={
            isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
          }
        >
          <Heart
            className={cn(
              'h-5 w-5 drop-shadow transition-all duration-200',
              isFavorite
                ? 'fill-rose-500 text-rose-500'
                : 'fill-white/30 text-white/60 hover:fill-white/50 hover:text-white/80',
            )}
          />
        </button>
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
          variant="outline"
          onClick={() => setDialogOpen(true)}
          className={`rounded-xl ${isDimmed ? 'border-border text-muted-foreground' : 'border-emerald-500 text-emerald-600'} border-2 font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950`}
          disabled={false}
        >
          Ver Detalhes
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <ScheduleDialog
          open={dialogOpen}
          scheduleId={schedule.id}
          onOpenChange={setDialogOpen}
        />
      </Dialog>
    </div>
  )
}
