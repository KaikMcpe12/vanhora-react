import { cn } from '@/lib/utils'

export interface RouteStop {
  city: string
  time?: string
  isEndpoint: boolean
}

interface RouteTimelineProps {
  stops: RouteStop[]
  cooperativeColor: string
  className?: string
}

export function RouteTimeline({ stops, cooperativeColor, className }: RouteTimelineProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {stops.map((stop, i) => {
        const isLast = i === stops.length - 1

        return (
          <div key={`${stop.city}-${i}`} className="flex items-stretch gap-3">
            {/* coluna da linha + dot */}
            <div className="flex w-5 shrink-0 flex-col items-center">
              {/* dot */}
              {stop.isEndpoint ? (
                <span
                  className="relative z-10 shrink-0 rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: cooperativeColor,
                    marginTop: 2,
                  }}
                />
              ) : (
                <span
                  className="relative z-10 shrink-0 rounded-full bg-card"
                  style={{
                    width: 8,
                    height: 8,
                    border: `1.5px solid ${cooperativeColor}`,
                    boxShadow: `0 0 0 3px var(--card)`,
                    marginTop: 3,
                  }}
                />
              )}

              {/* linha vertical entre stops */}
              {!isLast && (
                <div
                  className="flex-1"
                  style={{
                    width: 1.5,
                    backgroundColor: cooperativeColor,
                    opacity: 0.5,
                    marginTop: 2,
                    marginBottom: 2,
                  }}
                />
              )}
            </div>

            {/* conteúdo: cidade + hora */}
            <div
              className={cn(
                'flex min-h-[28px] flex-1 items-start justify-between pb-2',
                isLast && 'pb-0',
              )}
            >
              <span
                className={cn(
                  'text-sm leading-tight',
                  stop.isEndpoint
                    ? 'font-medium text-foreground'
                    : 'font-normal text-muted-foreground',
                )}
              >
                {stop.city}
              </span>
              {stop.time && (
                <span className="font-mono text-[12px] text-muted-foreground">
                  {stop.time}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
