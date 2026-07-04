import { useNavigate } from 'react-router-dom'

import { CooperativeAvatar } from '@/components/cooperative-avatar'
import { RatingDisplay } from '@/components/rating-display'
import type { AlternativeRoute } from '@/lib/data/mock-route-detail'
import { formatPrice } from '@/lib/utils/format'

type AlternativeRoutesBlockProps = {
  routes: AlternativeRoute[]
}

export function AlternativeRoutesBlock({ routes }: AlternativeRoutesBlockProps) {
  const navigate = useNavigate()

  if (routes.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-[18px] font-medium text-foreground">
        Outras opções para esta rota
      </h2>
      <div className="overflow-hidden rounded-[14px] border border-border/50">
        {routes.map((alt, idx) => (
          <button
            key={alt.id}
            type="button"
            onClick={() => navigate(`/routes/${alt.id}`)}
            className="flex w-full items-center gap-3 bg-card px-5 py-4 text-left transition-colors hover:bg-muted/50"
            style={idx > 0 ? { borderTop: '1px solid var(--border)' } : undefined}
          >
            <CooperativeAvatar name={alt.cooperativeName} color={alt.cooperativeColor} size="md" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-foreground">
                {alt.cooperativeName}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[12px] text-muted-foreground">{alt.durationText}</span>
                {alt.nextDeparture && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[12px] text-muted-foreground">
                      próxima {alt.nextDeparture.departureTime}
                    </span>
                  </>
                )}
                {alt.routeRating && (
                  <>
                    <span className="text-muted-foreground/40">·</span>
                    <RatingDisplay
                      rating={alt.routeRating.average}
                      size="sm"
                      variant="compact"
                      showLabel={false}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[14px] font-medium text-foreground">
                {formatPrice(alt.priceFrom)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
