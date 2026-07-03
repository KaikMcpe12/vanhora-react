import { Star } from 'lucide-react'

import { CooperativeAvatar } from '@/components/cooperative-avatar'
import { cn } from '@/lib/utils'

type CooperativeCardProps = {
  name: string
  brandColor: string
  logoUrl?: string
  citiesServed: string[]
  rating: number
  ratingCount: number
  routeCount: number
  onClick?: () => void
}

export function CooperativeCard({
  name,
  brandColor,
  citiesServed,
  rating,
  ratingCount,
  routeCount,
  onClick,
}: CooperativeCardProps) {
  const displayCities = citiesServed.slice(0, 3)
  const extraCities = citiesServed.length - displayCities.length

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-[12px] border border-border/50 bg-card p-[16px_18px]',
        onClick && 'cursor-pointer transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-border',
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <CooperativeAvatar name={name} color={brandColor} size="md" />
        <div>
          <span className="block text-[14px] font-medium text-foreground">{name}</span>
          <span className="block font-mono text-[11px] text-muted-foreground">
            {routeCount} rotas
          </span>
        </div>
      </div>

      <div>
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
          Atende
        </span>
        <p className="text-[12px] text-foreground">
          {displayCities.join(', ')}
          {extraCities > 0 && (
            <span className="text-muted-foreground"> +{extraCities}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Star className="h-3.5 w-3.5 fill-vh-amber text-vh-amber" />
        <span className="text-[13px] font-medium text-foreground">{rating.toFixed(1)}</span>
        <span className="text-[11px] text-muted-foreground">
          ({ratingCount.toLocaleString('pt-BR')} avaliações)
        </span>
      </div>
    </div>
  )
}
