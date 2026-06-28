import { Ban, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getMinutesUntilDeparture, type ScheduleVisualStatus } from '@/lib/utils/schedule-status'
import { cn } from '@/lib/utils'

interface RelativeTimeDisplayProps {
  departureTime: string // "HH:mm"
  status?: ScheduleVisualStatus
  delayMinutes?: number
  /** 'featured' usa 42px e letter-spacing -0.8px para o card de destaque */
  size?: 'default' | 'featured'
  className?: string
}

function formatRelativeTime(mins: number): string {
  if (mins < 0) return 'Partiu'
  if (mins === 0) return 'Partindo agora'
  if (mins < 60) return `Em ${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `Em ${h}h ${m}min` : `Em ${h}h`
}

export function RelativeTimeDisplay({
  departureTime,
  status,
  delayMinutes,
  size = 'default',
  className,
}: RelativeTimeDisplayProps) {
  const [mins, setMins] = useState(() => getMinutesUntilDeparture(departureTime))

  useEffect(() => {
    const id = setInterval(() => {
      setMins(getMinutesUntilDeparture(departureTime))
    }, 30_000)
    return () => clearInterval(id)
  }, [departureTime])

  const isCancelled = status === 'cancelled'
  const isDelayed = status === 'delayed'
  const isUrgent = status === 'urgent' || (mins >= 0 && mins <= 15 && !isCancelled)

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      {isCancelled ? (
        <span
          className="flex items-center gap-1.5 text-base font-medium"
          style={{ color: '#A32D2D' }}
        >
          <Ban size={16} strokeWidth={2} aria-hidden />
          Cancelado hoje
        </span>
      ) : (
        <div className="flex items-baseline gap-2">
          <span
            className="font-medium leading-none"
            style={{
              fontSize: size === 'featured' ? 42 : 27,
              letterSpacing: size === 'featured' ? '-0.8px' : '-0.4px',
              color: isUrgent ? '#0F6E56' : 'inherit',
            }}
          >
            {formatRelativeTime(mins)}
          </span>
          {isDelayed && delayMinutes && (
            <span
              className="text-sm font-medium"
              style={{ color: '#BA7517' }}
            >
              +{delayMinutes}min atraso
            </span>
          )}
        </div>
      )}

      <span className="flex items-center gap-1 font-mono text-[12px] text-muted-foreground">
        <Clock size={12} strokeWidth={1.5} aria-hidden />
        <span className={cn(isCancelled && 'line-through')}>
          {isCancelled ? 'saía às' : 'sai às'} {departureTime}
        </span>
      </span>
    </div>
  )
}
