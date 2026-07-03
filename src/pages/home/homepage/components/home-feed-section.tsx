import { Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ScheduleCard } from '@/components/schedule-card'
import { Section } from '@/components/section'
import { useFavorites } from '@/hooks/use-favorites'
import { getMockSchedules } from '@/lib/data/mock-schedules'
import { getRecentDestinations, type RecentDestination } from '@/lib/recent-destinations'
import type { Schedule } from '@/lib/types/schedule'

import { RecentDestinationChip } from './recent-destination-chip'

export function HomeFeedSection() {
  const { favoriteIds } = useFavorites()
  const navigate = useNavigate()

  const [favoriteSchedules, setFavoriteSchedules] = useState<Schedule[]>([])
  const [recentDestinations, setRecentDestinations] = useState<RecentDestination[]>([])

  useEffect(() => {
    const allSchedules = getMockSchedules()
    const favorites = allSchedules
      .filter((s) => favoriteIds.includes(s.id) && s.badge !== 'cancelled')
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
      .slice(0, 4)
    setFavoriteSchedules(favorites)
    setRecentDestinations(getRecentDestinations())
  }, [favoriteIds])

  if (!favoriteSchedules.length && !recentDestinations.length) return null

  return (
    <div className="flex flex-col gap-8">
      {favoriteSchedules.length > 0 && (
        <Section title="Suas rotas favoritas" hint={{ text: 'Feed', icon: <Zap size={9} strokeWidth={2} /> }}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {favoriteSchedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
          <Link
            to="/schedules/favorites"
            className="mt-1 block text-sm font-medium text-primary hover:underline"
          >
            Ver todos os favoritos ({favoriteIds.length}) →
          </Link>
        </Section>
      )}

      {recentDestinations.length > 0 && (
        <Section title="Suas últimas buscas">
          <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {recentDestinations.map((dest) => (
              <RecentDestinationChip
                key={dest.cityId}
                cityId={dest.cityId}
                cityName={dest.cityName}
                cityState="CE"
                lastSearchedAt={dest.lastSearchedAt}
                onClick={() => navigate(`/schedules?destination=${dest.cityId}`)}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}
