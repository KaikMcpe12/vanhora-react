import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MinuteStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  quickAdds?: number[]
  className?: string
}

/**
 * Seletor de minutos sem teclado: [ − ] valor [ + ] + atalhos rápidos.
 * Substitui o campo numérico nativo. Alvos de toque de 44px (size-11).
 */
export function MinuteStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  step = 5,
  quickAdds = [5, 10, 15],
  className,
}: MinuteStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Diminuir minutos"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          className="border-input bg-background text-foreground hover:bg-muted flex size-11 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40"
        >
          <Minus className="size-5" />
        </button>

        <div className="min-w-24 text-center">
          <span className="text-3xl font-semibold tabular-nums">{value}</span>
          <span className="text-muted-foreground ml-1 text-sm">min</span>
        </div>

        <button
          type="button"
          aria-label="Aumentar minutos"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          className="border-input bg-background text-foreground hover:bg-muted flex size-11 items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="size-5" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        {quickAdds.map((q) => (
          <Button
            key={q}
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11 rounded-full px-4"
            onClick={() => onChange(clamp(value + q))}
          >
            +{q}
          </Button>
        ))}
      </div>
    </div>
  )
}
