import { ArrowRight, Bus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PopularRoute {
  id: string
  origin: string
  destination: string
  schedules: number
  priceFrom: number
}

const POPULAR_ROUTES: PopularRoute[] = [
  {
    id: '1',
    origin: 'Fortaleza',
    destination: 'Sobral',
    schedules: 12,
    priceFrom: 35.0,
  },
  {
    id: '2',
    origin: 'Fortaleza',
    destination: 'Quixadá',
    schedules: 8,
    priceFrom: 28.0,
  },
  {
    id: '3',
    origin: 'Sobral',
    destination: 'Fortaleza',
    schedules: 15,
    priceFrom: 35.0,
  },
  {
    id: '4',
    origin: 'Itapipoca',
    destination: 'Fortaleza',
    schedules: 6,
    priceFrom: 25.0,
  },
]

interface PopularRouteCardProps {
  route: PopularRoute
  className?: string
  style?: React.CSSProperties
}

function PopularRouteCard({ route, className, style }: PopularRouteCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className={cn(
        'group animate-fade-in border-border bg-card rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md',
        className,
      )}
      style={style}
    >
      <div className="bg-primary/10 text-primary mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
        <Bus className="h-6 w-6" />
      </div>

      <h3 className="text-foreground mb-1 text-lg font-bold">
        {route.origin} → {route.destination}
      </h3>

      <p className="text-muted-foreground mb-6 text-sm">
        {route.schedules} horários disponíveis
      </p>

      <div className="mb-6">
        <span className="text-muted-foreground mb-1 block text-xs">
          A partir de
        </span>
        <span className="text-primary text-2xl font-black">
          R$ {route.priceFrom.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <Button
        onClick={() => navigate('/schedules')}
        variant="outline"
        className="border-primary text-primary hover:bg-primary group flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2.5 font-bold transition-colors hover:text-white"
      >
        Ver horários
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  )
}

export function PopularRoutesSection() {
  const navigate = useNavigate()

  return (
    <section className="bg-background mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-2 text-3xl font-black">
            Rotas Mais Buscadas
          </h2>
          <p className="text-muted-foreground">
            Destinos populares com saídas frequentes todos os dias.
          </p>
        </div>

        <Button
          onClick={() => navigate('/schedules')}
          variant="ghost"
          className="text-primary hidden items-center gap-2 font-bold transition-all hover:gap-3 md:flex"
        >
          Ver todas as rotas
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {POPULAR_ROUTES.map((route, index) => (
          <PopularRouteCard
            key={route.id}
            route={route}
            style={
              {
                animationDelay: `${index * 0.1}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </section>
  )
}
