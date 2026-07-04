import type { RouteDetail } from '@/lib/data/mock-route-detail'

type RouteTimelineFullProps = {
  route: RouteDetail
}

export function RouteTimelineFull({ route }: RouteTimelineFullProps) {
  const { stops, cooperative } = route
  const color = cooperative.brandColor

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-[18px] font-medium text-foreground">Paradas</h2>
      <div className="rounded-[14px] border border-border/50 bg-card p-[20px_24px]">
        {stops.map((stop, idx) => (
          <div key={`${stop.city}-${idx}`}>
            {/* duration label between stops */}
            {stop.durationFromPrev && (
              <div className="ml-[17px] flex items-center gap-2 py-1">
                <div
                  className="w-px self-stretch"
                  style={{ backgroundColor: color, opacity: 0.35 }}
                />
                <span className="py-1 text-[11px] text-muted-foreground">
                  {stop.durationFromPrev}
                </span>
              </div>
            )}

            {/* stop row */}
            <div className="flex items-start gap-3">
              {/* dot */}
              <div className="flex shrink-0 flex-col items-center pt-[3px]">
                {stop.isEndpoint ? (
                  <span
                    className="rounded-full"
                    style={{ width: 12, height: 12, backgroundColor: color }}
                  />
                ) : (
                  <span
                    className="rounded-full border-2"
                    style={{
                      width: 10,
                      height: 10,
                      borderColor: color,
                      backgroundColor: 'var(--card)',
                    }}
                  />
                )}
              </div>

              {/* city + label */}
              <div className="min-w-0 flex-1">
                {stop.isEndpoint && (
                  <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-muted-foreground">
                    {idx === 0 ? 'SAÍDA' : 'CHEGADA'}
                  </span>
                )}
                <p
                  className={
                    stop.isEndpoint
                      ? 'text-[15px] font-medium text-foreground'
                      : 'text-[14px] text-muted-foreground'
                  }
                >
                  {stop.city}
                </p>
              </div>

              {/* time */}
              <span className="shrink-0 pt-[3px] font-mono text-[13px] text-muted-foreground">
                {stop.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
