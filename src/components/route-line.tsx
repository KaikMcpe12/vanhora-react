import { cn } from '@/lib/utils'

interface RouteLineProps {
  origin: string
  destination: string
  durationLabel: string
  cooperativeColor: string
  variant?: 'default' | 'muted'
}

export function RouteLine({
  origin,
  destination,
  durationLabel,
  cooperativeColor,
  variant = 'default',
}: RouteLineProps) {
  const isMuted = variant === 'muted'
  const lineColor = isMuted ? undefined : cooperativeColor
  const lineOpacity = isMuted ? 0.3 : 0.7

  return (
    <div className="grid items-center gap-2" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
      {/* origem */}
      <span
        className={cn(
          'max-w-[90px] truncate text-sm font-medium leading-tight',
          isMuted ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {origin}
      </span>

      {/* linha central com dots e duração */}
      <div className="relative flex items-center">
        {/* dot esquerdo */}
        <span
          className="shrink-0 rounded-full"
          style={{
            width: 7,
            height: 7,
            backgroundColor: lineColor ?? 'currentColor',
            opacity: lineOpacity,
            color: 'var(--muted-foreground)',
          }}
        />

        {/* linha + label de duração centralizado */}
        <div className="relative flex flex-1 items-center">
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2"
            style={{
              height: 1.5,
              backgroundColor: lineColor ?? 'currentColor',
              opacity: lineOpacity,
              color: 'var(--muted-foreground)',
            }}
          />
          <span
            className={cn(
              'relative z-10 mx-auto bg-card px-1 font-mono text-[10px] uppercase tracking-[0.4px]',
              'text-muted-foreground',
            )}
          >
            {durationLabel}
          </span>
        </div>

        {/* dot direito */}
        <span
          className="shrink-0 rounded-full"
          style={{
            width: 7,
            height: 7,
            backgroundColor: lineColor ?? 'currentColor',
            opacity: lineOpacity,
            color: 'var(--muted-foreground)',
          }}
        />
      </div>

      {/* destino */}
      <span
        className={cn(
          'max-w-[90px] truncate text-right text-sm font-medium leading-tight',
          isMuted ? 'text-muted-foreground' : 'text-foreground',
        )}
      >
        {destination}
      </span>
    </div>
  )
}
