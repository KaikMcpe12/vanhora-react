import { ChevronRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { ScheduleCard } from './scschedule-card'

interface Schedule {
  id: string
  name: string
  departureTime: string
  arrivalTime: string
  duration: string
  origin: string
  destination: string
  price: number
  available: boolean
}

interface FavoriteSchedulesProps {
  schedules?: Schedule[]
}

// mocks

const MOCK_FAVORITES: Schedule[] = [
  {
    id: '1',
    name: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    available: true,
  },
  {
    id: '2',
    name: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    available: false,
  },
]

export function FavoriteSchedules({
  schedules = MOCK_FAVORITES,
}: FavoriteSchedulesProps) {
  if (schedules.length === 0) return null

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-6 w-6 text-rose-500" />
        <h2 className="text-foreground text-sm font-semibold">
          Seus Favoritos
        </h2>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <ScheduleCard key={schedule.id} schedule={schedule} />
        ))}
      </div>

      <div className="mt-4">
        <Button
          asChild
          className="w-full text-sm font-medium"
          variant="default"
        >
          <Link
            to="/favorites"
            className="flex items-center justify-center gap-1.5 bg-rose-500 text-white hover:bg-rose-600"
          >
            Ver todos os favoritos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
