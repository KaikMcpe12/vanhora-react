import { ChevronDown, ChevronRight, Heart } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

import { type Favorite, FavoriteCard } from './favorite-card'

interface FavoriteSchedulesProps {
  schedules?: Favorite[]
  defaultOpen?: boolean
}

const MOCK_FAVORITES: Favorite[] = [
  {
    id: '1',
    cooperativeName: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    status: 'upcoming-soon',
    badge: 'available',
  },
  {
    id: '2',
    cooperativeName: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    status: 'past',
    badge: 'cancelled',
  },
  {
    id: '3',
    cooperativeName: 'Expresso Regional',
    departureTime: '8:00',
    arrivalTime: '11:30',
    duration: '3h 30min',
    origin: 'Fortaleza',
    destination: 'Ceará',
    price: 60,
    status: 'upcoming',
    badge: 'available',
  },
]

export function FavoriteSchedules({
  schedules = MOCK_FAVORITES,
  defaultOpen = true,
}: FavoriteSchedulesProps) {
  const [open, setOpen] = useState(defaultOpen)

  if (schedules.length === 0) return null

  const availableCount = schedules.filter(
    (s) => s.status !== 'past' && s.badge !== 'cancelled',
  ).length

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="border-border bg-card rounded-xl border shadow-sm"
    >
      <CollapsibleTrigger asChild>
        <button className="hover:bg-muted/50 flex w-full items-center gap-2 rounded-xl p-5 transition-colors">
          <Heart className="h-5 w-5 shrink-0 fill-rose-500 text-rose-500" />

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-foreground text-sm font-semibold">
              Seus Favoritos
            </span>
            
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              {schedules.length}
            </span>
            
            {!open && availableCount > 0 && (
              <p className="text-muted-foreground min-w-0 truncate text-xs">
                {availableCount} disponíve{availableCount > 1 ? 'is' : 'l'}
              </p>
            )}
          </div>

          <ChevronDown
            className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent style={{ overflow: 'hidden' }} forceMount>
        <div
          style={{
            display: 'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.25s ease-out',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div className="px-4 pb-4">
              <div className="border-border mb-4 border-t" />

              <div className="space-y-3">
                {schedules.map((favorite) => (
                  <FavoriteCard key={favorite.id} favorite={favorite} />
                ))}
              </div>

              <div className="mt-4">
                <Button
                  asChild
                  className="w-full bg-rose-500 text-sm font-medium text-white hover:bg-rose-600"
                >
                  <Link
                    to="/favorites"
                    className="flex items-center justify-center gap-1.5"
                  >
                    Ver todos os favoritos
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
