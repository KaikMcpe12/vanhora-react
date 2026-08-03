import { TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { Section } from '@/components/section'
import { getDestinationSummaries } from '@/lib/api/mock-destinations-api'
import { CITIES_WITH_IDS } from '@/lib/data/mock-cities'
import { COOPERATIVE_COLORS } from '@/lib/utils/schedule-status'

import { DestinationCard } from './destination-card'

const POPULAR_DESTINATIONS = [
  { cityName: 'Sobral', isPopular: true },
  { cityName: 'Juazeiro do Norte', isPopular: true },
  { cityName: 'Crato', isPopular: false },
  { cityName: 'Iguatu', isPopular: false },
  { cityName: 'Crateús', isPopular: false },
  { cityName: 'Quixadá', isPopular: false },
]

export function PopularRoutesSection() {
  const navigate = useNavigate()

  const summaries = useMemo(
    () => getDestinationSummaries(POPULAR_DESTINATIONS.map((d) => d.cityName)),
    [],
  )

  return (
    <Section
      title="Rotas populares no interior do Ceará"
      hint={{ text: 'mais buscadas', icon: <TrendingUp size={8} strokeWidth={2} /> }}
      count={POPULAR_DESTINATIONS.length}
      countLabel="destinos"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_DESTINATIONS.map(({ cityName, isPopular }) => {
          const summary = summaries.find((s) => s.cityName === cityName)
          const cityId = CITIES_WITH_IDS.find((c) => c.name === cityName)?.id ?? ''
          const cooperativeColor = summary?.primaryCooperativeName
            ? COOPERATIVE_COLORS[summary.primaryCooperativeName]
            : undefined

          return (
            <DestinationCard
              key={cityName}
              cityId={cityId}
              cityName={cityName}
              cityState="CE"
              scheduleCount={summary?.scheduleCount ?? 0}
              priceFrom={summary?.priceFrom ?? 0}
              primaryCooperativeName={summary?.primaryCooperativeName}
              primaryCooperativeColor={cooperativeColor}
              isPopular={isPopular}
              onClick={() => navigate(`/schedules?destination=${cityId}`)}
            />
          )
        })}
      </div>
    </Section>
  )
}
