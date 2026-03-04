import { Clock, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export interface Schedule {
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

export function ScheduleCard({ schedule }: { schedule: Schedule }) {
  return (
    <div className="group border-border bg-background hover:border-primary/30 rounded-lg border p-4 transition-all duration-200 hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-foreground text-sm leading-tight font-semibold">
          {schedule.name}
        </span>
        <Badge
          variant={schedule.available ? 'default' : 'secondary'}
          className={`py-1 px-2 text-xs
            ${schedule.available
              ? 'rounded-full bg-emerald-500 text-white hover:bg-emerald-500'
              : 'rounded-full'}
          `}
        >
          {schedule.available ? 'Disponível' : 'Indisponível'}
        </Badge>
      </div>

      <p className="text-foreground/80 mb-3 text-sm font-medium">
        {schedule.departureTime} - {schedule.arrivalTime}
      </p>

      <div className="text-muted-foreground space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{schedule.duration}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>
            {schedule.origin} → {schedule.destination}
          </span>
        </div>
      </div>

      <div className="border-border mt-3 border-t pt-3">
        <span className="text-muted-foreground text-xs">
          Preço:{' '}
          <span className="text-foreground font-semibold">
            R${schedule.price.toFixed(2).replace('.', ',')}
          </span>
        </span>
      </div>
    </div>
  )
}
