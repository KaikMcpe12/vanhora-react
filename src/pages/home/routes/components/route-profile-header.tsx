import { Link } from 'react-router-dom'

import { CooperativeAvatar } from '@/components/cooperative-avatar'
import { RatingDisplay } from '@/components/rating-display'
import { RouteLine } from '@/components/route-line'
import type { RouteDetail } from '@/lib/data/mock-route-detail'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

type RouteProfileHeaderProps = {
  route: RouteDetail
}

export function RouteProfileHeader({ route }: RouteProfileHeaderProps) {
  return (
    <div className="mt-8 rounded-[14px] border border-border/50 bg-card p-[24px_28px]">
      {/* route line grande */}
      <div className="mb-1">
        <RouteLine
          origin={route.origin}
          destination={route.destination}
          durationLabel={route.durationText}
          cooperativeColor={route.cooperative.brandColor}
        />
      </div>

      {/* meta */}
      <p className="mt-3 text-[13px] text-muted-foreground">
        {route.durationText}
        {' · '}
        {(() => {
          const mid = route.stops.filter((s) => !s.isEndpoint).length
          return mid > 0 ? `${mid} parada${mid !== 1 ? 's' : ''}` : 'direto'
        })()}
        {' · '}
        a partir de {formatPrice(route.priceFrom)}
      </p>

      {/* rating da rota */}
      {route.rating && (
        <div className="mt-2">
          <RatingDisplay
            rating={route.rating.average}
            reviews={route.rating.count}
            size="sm"
            variant="compact"
          />
        </div>
      )}

      <div className="my-5 border-t border-border/50" />

      {/* cooperativa */}
      <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.5px] text-muted-foreground">
        Operado por
      </div>
      <div className="flex items-center gap-2">
        <CooperativeAvatar
          name={route.cooperative.name}
          color={route.cooperative.brandColor}
          size="md"
        />
        <Link
          to={`/cooperatives/${route.cooperative.id}`}
          className="text-[14px] font-medium text-foreground transition-opacity hover:opacity-70"
        >
          {route.cooperative.name}
        </Link>
        <RatingDisplay
          rating={route.cooperative.rating.average}
          reviews={route.cooperative.rating.count}
          size="sm"
          variant="compact"
          showLabel={false}
          className="ml-1"
        />
      </div>

      <div className="my-5 border-t border-border/50" />

      {/* dias de operação */}
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-muted-foreground">
        Opera
      </div>
      <div className="flex flex-wrap gap-1.5">
        {route.operatingDays.map((day) => (
          <span
            key={day.key}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[11px] font-semibold',
              day.active
                ? 'bg-vh-amber-bg text-vh-amber-text'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {day.labelPt}
          </span>
        ))}
      </div>
    </div>
  )
}
