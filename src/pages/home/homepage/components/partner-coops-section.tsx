import { Link, useNavigate } from 'react-router-dom'

import { Section } from '@/components/section'
import { MOCK_COOPERATIVE_DETAILS } from '@/lib/data/mock-cooperative-details'

import { CooperativeCard } from './cooperative-card'

const FEATURED_COOPERATIVES = MOCK_COOPERATIVE_DETAILS.slice(0, 3)

export function PartnerCoopsSection() {
  const navigate = useNavigate()

  return (
    <Section title="Cooperativas parceiras">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURED_COOPERATIVES.map((coop) => (
          <CooperativeCard
            key={coop.id}
            name={coop.name}
            brandColor={coop.brandColor}
            citiesServed={coop.citiesServed}
            rating={coop.rating}
            ratingCount={coop.ratingCount}
            routeCount={coop.routeCount}
            onClick={() => navigate(`/cooperatives/${coop.id}`)}
          />
        ))}
      </div>
      <div className="mt-1 text-center">
        <Link to="/cooperatives" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Ver todas as cooperativas →
        </Link>
      </div>
    </Section>
  )
}
