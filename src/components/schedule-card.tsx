import { ChevronDown, Heart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { CooperativeAvatar } from '@/components/cooperative-avatar'
import { InlineRating } from '@/components/inline-rating'
import { RelativeTimeDisplay } from '@/components/relative-time-display'
import { RouteLine } from '@/components/route-line'
import { RouteTimeline, type RouteStop } from '@/components/route-timeline'
import { Dialog } from '@/components/ui/dialog'
import { useFavorites } from '@/hooks/use-favorites'
import type { Schedule } from '@/lib/types/schedule'
import {
  getCooperativeColor,
  getVisualStatus,
} from '@/lib/utils/schedule-status'
import { cn } from '@/lib/utils'

import { ScheduleDialog } from './schedule-dialog'

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  const [expanded, setExpanded] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites()

  const isFavorite = checkIsFavorite(schedule.id)
  const cooperativeColor = getCooperativeColor(schedule.cooperativeName)
  const visualStatus = getVisualStatus(schedule.departureTime, schedule.badge)
  const isCancelled = visualStatus === 'cancelled'

  const stops: RouteStop[] = [
    { city: schedule.origin, time: schedule.departureTime, isEndpoint: true },
    { city: schedule.destination, time: schedule.arrivalTime, isEndpoint: true },
  ]

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const wasFavorite = isFavorite
    toggleFavorite(schedule.id)
    if (wasFavorite) {
      toast.info('Removido dos favoritos', {
        description: `${schedule.origin} → ${schedule.destination} às ${schedule.departureTime}`,
      })
    } else {
      toast.success('Adicionado aos favoritos', {
        description: `${schedule.origin} → ${schedule.destination} às ${schedule.departureTime}`,
      })
    }
  }

  return (
    <div
      className={cn(
        'bg-card rounded-[14px] border border-border/80 overflow-hidden transition-opacity duration-200',
        isCancelled && 'opacity-80',
      )}
    >
      {/* ── bloco principal (sempre visível) ── */}
      <div className="px-[18px] pt-4 pb-0 space-y-3">

        {/* linha 1: countdown + heart */}
        <div className="flex items-start justify-between gap-2">
          <RelativeTimeDisplay
            departureTime={schedule.departureTime}
            status={visualStatus}
          />
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className="mt-0.5 shrink-0 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              size={22}
              strokeWidth={1.75}
              className={cn(
                'transition-colors duration-150',
                isFavorite
                  ? 'fill-[#D4537E] text-[#D4537E]'
                  : 'fill-none text-muted-foreground hover:text-foreground',
              )}
            />
          </button>
        </div>

        {/* linha 2: route line */}
        <RouteLine
          origin={schedule.origin}
          destination={schedule.destination}
          durationLabel={schedule.duration}
          cooperativeColor={cooperativeColor}
          variant={isCancelled ? 'muted' : 'default'}
        />

        {/* linha 3: meta (avatar + nome + rating | preço) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <CooperativeAvatar
              name={schedule.cooperativeName}
              color={cooperativeColor}
              size="sm"
            />
            <div className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-foreground leading-tight">
                {schedule.cooperativeName}
              </span>
              {schedule.cooperativeRating && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  ★ {schedule.cooperativeRating.toFixed(1)}
                  {schedule.cooperativeReviews && (
                    <span className="ml-1">({schedule.cooperativeReviews})</span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span
              className={cn(
                'text-[18px] font-bold tabular-nums leading-tight',
                isCancelled ? 'text-muted-foreground line-through' : 'text-foreground',
              )}
            >
              R$ {schedule.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      {/* ── chevron / expand trigger ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-border/50 px-[18px] py-2.5 text-[11px] font-medium uppercase tracking-[0.4px] text-muted-foreground transition-colors hover:bg-muted/30"
        aria-expanded={expanded}
        aria-label={expanded ? 'Fechar detalhes' : 'Ver paradas e avaliar'}
      >
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={cn(
            'transition-transform duration-[240ms]',
            expanded && 'rotate-180',
          )}
        />
        {expanded ? 'Fechar' : 'Paradas e avaliação'}
      </button>

      {/* ── seção expandível ── */}
      <div
        className={cn(
          'grid transition-all duration-[240ms] ease-in-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 px-[18px] pt-4 pb-4">

            {/* sub-header rota */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
                Rota
              </span>
              <span className="text-[10px] font-medium uppercase tracking-[0.4px] text-muted-foreground">
                {stops.length} {stops.length === 1 ? 'parada' : 'paradas'}
              </span>
            </div>

            {/* timeline */}
            <RouteTimeline
              stops={stops}
              cooperativeColor={cooperativeColor}
            />

            {/* divider */}
            <div className="border-t border-border/40" />

            {/* rating inline */}
            <InlineRating scheduleId={schedule.id} />

            {/* divider */}
            <div className="border-t border-border/40" />

            {/* ver detalhes */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setDialogOpen(true)
              }}
              className="flex w-full cursor-pointer items-center justify-end gap-1 text-[13px] font-medium text-primary transition-opacity hover:opacity-75"
            >
              Ver detalhes da rota →
            </button>
          </div>
        </div>
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
