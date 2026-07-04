import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { CooperativeCityServed } from '@/lib/data/mock-cooperative-details'
import { cn } from '@/lib/utils'

type CooperativeCitiesGridProps = {
  cities: CooperativeCityServed[]
}

export function CooperativeCitiesGrid({ cities }: CooperativeCitiesGridProps) {
  const navigate = useNavigate()

  if (cities.length === 0) return null

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-[18px] font-medium text-foreground">Cidades atendidas</h2>
        <span className="shrink-0 text-sm text-muted-foreground">{cities.length} cidades</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => navigate(`/schedules?destination=${city.id}`)}
            className={cn(
              'flex flex-col gap-0.5 rounded-[10px] border p-[12px_14px] text-left',
              'cursor-pointer transition-[border-color] duration-150 hover:border-border',
              city.role === 'stop'
                ? 'border-border/40 opacity-75'
                : 'border-border/50',
            )}
          >
            <MapPin
              size={13}
              strokeWidth={1.75}
              className={cn(
                city.role === 'stop' ? 'text-muted-foreground' : 'text-vh-amber-text',
              )}
            />
            <span className="mt-1 text-[14px] font-medium text-foreground">{city.name}</span>
            <span className="text-[11px] text-muted-foreground">{city.state}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
