import { ArrowRight, Bus, MapPin, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'

const PARTNER_COOPERATIVES = [
  {
    id: 1,
    name: 'Cootraps',
    logo: '/logos/cootraps.png',
    color: 'from-emerald-500 to-emerald-600',
    routesCount: 15,
    rating: 4.8,
    reviews: 240,
    mainCities: ['Fortaleza', 'Sobral', 'Cratéus'],
    state: 'Ceará',
  },
  {
    id: 2,
    name: 'Coopfor',
    logo: '/logos/coopfor.png',
    color: 'from-blue-500 to-blue-600',
    routesCount: 12,
    rating: 4.5,
    reviews: 180,
    mainCities: ['Cratéus', 'Ipueiras', 'Fortaleza'],
    state: 'Ceará',
  },
  {
    id: 3,
    name: 'TopVans',
    logo: '/logos/topvans.png',
    color: 'from-purple-500 to-purple-600',
    routesCount: 8,
    rating: 4.9,
    reviews: 320,
    mainCities: ['Fortaleza', 'Cratéus'],
    state: 'Ceará',
  },
]

interface PartnerCoopCardProps {
  name: string
  color: string
  routesCount: number
  rating: number
  reviews: number
  mainCities: string[]
}

export function PartnerCoopCard({
  name,
  color,
  routesCount,
  rating,
  reviews,
  mainCities,
}: PartnerCoopCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={`bg-linear-to-r ${color} p-6 text-white`}>
        <div className="mb-2 flex items-center justify-between">
          <Bus className="h-8 w-8" />
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
            {routesCount} rotas
          </span>
        </div>
        <h3 className="text-xl font-semibold">{name}</h3>
      </div>

      <div className="space-y-3 bg-white p-4">
        <div className="flex items-start gap-2">
          <MapPin className="text-muted-foreground mt-1 h-4 w-4 shrink-0" />
          <p className="text-muted-foreground text-sm">
            {mainCities.slice(0, 2).join(', ')}
            {mainCities.length > 2 && (
              <span className="font-medium"> +{mainCities.length - 2}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{rating}</span>
          <span className="text-muted-foreground text-xs">({reviews})</span>
        </div>
      </div>
    </div>
  )
}

export function PartnerCoopsSection() {
  const navigate = useNavigate()

  return (
    <section className="bg-muted/30 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">🤝 Cooperativas Parceiras</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Trabalhamos com as principais cooperativas do Ceará para oferecer
            mais opções de viagem
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PARTNER_COOPERATIVES.map((coop) => (
            <PartnerCoopCard key={coop.id} {...coop} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={() => navigate('/schedules')}
            variant="outline"
            className="border-primary text-primary hover:bg-primary group flex items-center justify-center gap-2 rounded-xl border-2 font-bold transition-colors hover:text-white"
          >
            Ver todas as cooperativas
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  )
}
