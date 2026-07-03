import { Building2 } from 'lucide-react'

import { CooperativeCard } from '@/pages/home/homepage/components/cooperative-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { CooperativeDetail } from '@/lib/data/mock-cooperative-details'

type CooperativesListProps = {
  cooperatives: CooperativeDetail[]
  isLoading: boolean
  onCooperativeClick: (id: string) => void
}

function CooperativeCardSkeleton() {
  return (
    <Skeleton className="h-[140px] rounded-[12px]" />
  )
}

export function CooperativesList({ cooperatives, isLoading, onCooperativeClick }: CooperativesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CooperativeCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (cooperatives.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/60 bg-muted/10 px-6 py-14 text-center">
        <Building2 size={40} strokeWidth={1.5} className="text-muted-foreground" />
        <div>
          <p className="text-[15px] font-medium text-foreground">
            Nenhuma cooperativa corresponde aos filtros
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Ajuste ou limpe os filtros para ver resultados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cooperatives.map((coop) => (
        <CooperativeCard
          key={coop.id}
          name={coop.name}
          brandColor={coop.brandColor}
          citiesServed={coop.citiesServed}
          rating={coop.rating}
          ratingCount={coop.ratingCount}
          routeCount={coop.routeCount}
          onClick={() => onCooperativeClick(coop.id)}
        />
      ))}
    </div>
  )
}
