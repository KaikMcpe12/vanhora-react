import type { CooperativeRoute } from '@/lib/data/mock-cooperative-details'

import { EnrichedRouteCard } from './enriched-route-card'

type CooperativeRoutesListProps = {
  routes: CooperativeRoute[]
}

export function CooperativeRoutesList({ routes }: CooperativeRoutesListProps) {
  if (routes.length === 0) {
    return (
      <p className="text-[14px] text-muted-foreground">
        Esta cooperativa ainda não tem rotas cadastradas.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {routes.map((route) => (
        <EnrichedRouteCard key={route.id} route={route} />
      ))}
    </div>
  )
}
