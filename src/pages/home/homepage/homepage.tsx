import { ChevronDown } from 'lucide-react'

import { type Schedule, ScheduleCard } from '@/components/schedule-card'
import { ScheduleFilters } from '@/components/schedule-filter'
import { Button } from '@/components/ui/button'

import { FavoriteSchedules } from './favorite-schedule'
import { HeroSection } from './hero-section'

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: '1',
    cooperativeName: 'TopVans',
    cooperativeRating: 8.5,
    cooperativeReviews: 240,
    tripCode: '4415',
    departureTime: '15:45',
    arrivalTime: '17:30',
    duration: '1h 45m',
    origin: 'São Paulo',
    destination: 'Campinas',
    price: 42,
    status: 'upcoming-soon',
    badge: 'available',
    isFavorite: true,
  },
  {
    id: '2',
    cooperativeName: 'TopVans',
    cooperativeRating: 9.0,
    cooperativeReviews: 240,
    tripCode: '4415',
    departureTime: '15:45',
    arrivalTime: '17:30',
    duration: '1h 45m',
    origin: 'São Paulo',
    destination: 'Campinas',
    price: 42,
    status: 'past',
    badge: 'available',
    isFavorite: true,
  },
  {
    id: '3',
    cooperativeName: 'TopVans',
    cooperativeRating: 9.0,
    cooperativeReviews: 240,
    tripCode: '4415',
    departureTime: '15:45',
    arrivalTime: '17:30',
    duration: '1h 45m',
    origin: 'São Paulo',
    destination: 'Campinas',
    price: 42,
    status: 'upcoming',
    badge: 'available',
    isFavorite: false,
  },
  {
    id: '4',
    cooperativeName: 'TopVans',
    cooperativeRating: 9.0,
    cooperativeReviews: 240,
    tripCode: '4415',
    departureTime: '15:45',
    arrivalTime: '17:30',
    duration: '1h 45m',
    origin: 'São Paulo',
    destination: 'Campinas',
    price: 42,
    status: 'upcoming',
    badge: 'cancelled',
    isFavorite: false,
  },
]

export function HomePage() {
  return (
    <div className="w-full">
      <HeroSection />

      <div className="wrap grid grid-cols-1 gap-8 px-2 py-6 md:grid md:grid-cols-3 md:px-8">
        {/* column 1 */}
        <aside className="col-span-1 animate-slide-in flex shrink-0 flex-col gap-4 md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
          <ScheduleFilters />
          <FavoriteSchedules />
        </aside>

        {/* column 2 */}
        <div className="col-span-1 grid items-center space-y-8 md:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-sm font-semibold">
              Horários disponíveis
            </h2>
            <span className="text-muted-foreground text-xs">
              {MOCK_SCHEDULES.length} resultado
              {MOCK_SCHEDULES.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {MOCK_SCHEDULES.map((schedule, index) => (
              <div 
                key={schedule.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ScheduleCard schedule={schedule} />
              </div>
            ))}
          </div>

          {/* button */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="group border-primary/30 text-primary hover:bg-primary gap-2 rounded-xl px-10 transition-all duration-300 hover:text-white"
            >
              Mostrar mais
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
