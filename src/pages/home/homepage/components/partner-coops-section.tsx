import { StubLink } from '@/components/ui/stub-link'
import { Section } from '@/components/section'
import { MOCK_COOPERATIVES } from '@/lib/data/mock-cooperatives'
import { COOPERATIVE_COLORS } from '@/lib/utils/schedule-status'

import { CooperativeCard } from './cooperative-card'

const FEATURED_COOPERATIVES = MOCK_COOPERATIVES.slice(0, 3).map((coop) => ({
  name: coop.name,
  brandColor: COOPERATIVE_COLORS[coop.name] ?? '#185FA5',
  citiesServed: [...coop.routes] as string[],
  rating: coop.rating,
  ratingCount: coop.reviews,
  routeCount: coop.routes.length,
}))

export function PartnerCoopsSection() {
  return (
    <Section title="Cooperativas parceiras">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURED_COOPERATIVES.map((coop) => (
          <CooperativeCard key={coop.name} {...coop} />
        ))}
      </div>
      <div className="mt-1 text-center">
        <StubLink className="text-sm text-muted-foreground">Ver todas as cooperativas →</StubLink>
      </div>
    </Section>
  )
}
