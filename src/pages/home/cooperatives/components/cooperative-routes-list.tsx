import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import type { CooperativeRoute } from '@/lib/data/mock-cooperative-details'

type CooperativeRoutesListProps = {
  routes: CooperativeRoute[]
}

export function CooperativeRoutesList({ routes }: CooperativeRoutesListProps) {
  const navigate = useNavigate()

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
        <button
          key={route.id}
          type="button"
          onClick={() => navigate(`/routes/${route.id}`)}
          className="flex w-full cursor-pointer items-center gap-4 rounded-[12px] border border-border/50 bg-card p-[16px_18px] text-left transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-border"
        >
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-foreground">{route.displayName}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              {route.durationText}
              {route.stopsCount > 0 && ` · ${route.stopsCount} paradas`}
              {' · '}
              {route.schedulesTodayCount} horários hoje
            </p>
          </div>
          <div className="shrink-0 text-right">
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
              a partir de
            </span>
            <span className="block text-[14px] font-medium text-foreground">
              R$ {route.priceFrom.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  )
}
