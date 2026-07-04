import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { RelativeTimeDisplay } from '@/components/relative-time-display'
import type { CooperativeRoute } from '@/lib/data/mock-cooperative-details'

type EnrichedRouteCardProps = {
  route: CooperativeRoute
}

export function EnrichedRouteCard({ route }: EnrichedRouteCardProps) {
  const navigate = useNavigate()
  const { id, displayName, durationText, stopsCount, schedulesTodayCount, priceFrom, nextDeparture, routeRating } = route

  return (
    <button
      type="button"
      onClick={() => navigate(`/routes/${id}`)}
      className="w-full cursor-pointer rounded-[14px] border border-border/50 bg-card p-[20px_24px] text-left transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-border"
    >
      {/* top block */}
      <p className="text-[15px] font-medium text-foreground">{displayName}</p>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        {durationText}
        {stopsCount > 0 && ` · ${stopsCount} paradas`}
      </p>
      {routeRating && (
        <div className="mt-1.5 flex items-center gap-1">
          <Star size={11} strokeWidth={1.75} className="fill-vh-amber text-vh-amber" />
          <span className="text-[12px] text-foreground">{routeRating.average.toFixed(1)}</span>
          <span className="text-[11px] text-muted-foreground">
            ({routeRating.count.toLocaleString('pt-BR')} avaliações)
          </span>
        </div>
      )}

      <div className="my-3 border-t border-border/50" />

      {/* bottom block */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {nextDeparture ? (
            <RelativeTimeDisplay departureTime={nextDeparture.departureTime} size="default" />
          ) : (
            <p className="text-[13px] text-muted-foreground">Nenhuma saída hoje</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[14px] font-medium text-foreground">
            R$ {priceFrom.toFixed(2).replace('.', ',')}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {schedulesTodayCount} horários hoje
          </p>
        </div>
      </div>
    </button>
  )
}
