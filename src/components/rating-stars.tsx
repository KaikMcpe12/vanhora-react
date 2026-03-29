import { Star } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

interface RatingStarsProps {
  value: number
  onChange: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}

const SIZE_CONFIG = {
  sm: { star: 'h-6 w-6', gap: 'gap-1', container: 'min-h-[44px]' },
  md: { star: 'h-8 w-8', gap: 'gap-2', container: 'min-h-[44px]' },
  lg: { star: 'h-10 w-10', gap: 'gap-2', container: 'min-h-[44px]' },
}

export function RatingStars({
  value,
  onChange,
  size = 'md',
  disabled = false,
  className,
}: RatingStarsProps) {
  const [hoveredValue, setHoveredValue] = useState(0)
  const config = SIZE_CONFIG[size]

  const displayValue = hoveredValue || value

  const handleClick = (stars: number) => {
    if (disabled) return

    // Haptic feedback (mobile)
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }

    onChange(stars)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center',
        config.container,
        config.gap,
        className,
      )}
      role="radiogroup"
      aria-label="Avaliação de 1 a 5 estrelas"
    >
      {[1, 2, 3, 4, 5].map((stars) => {
        const isFilled = stars <= displayValue
        const isHovered = stars <= hoveredValue

        return (
          <button
            key={stars}
            type="button"
            role="radio"
            aria-checked={stars === value}
            aria-label={`${stars} estrela${stars > 1 ? 's' : ''}`}
            disabled={disabled}
            onClick={() => handleClick(stars)}
            onMouseEnter={() => !disabled && setHoveredValue(stars)}
            onMouseLeave={() => setHoveredValue(0)}
            className={cn(
              // Base
              'flex items-center justify-center rounded-md p-1',
              'transition-all duration-150 ease-out',

              // States
              disabled && 'cursor-not-allowed opacity-50',
              !disabled && 'cursor-pointer hover:scale-110 active:scale-95',

              // Focus
              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            )}
          >
            <Star
              className={cn(
                config.star,
                'transition-all duration-150',

                // Empty
                !isFilled && 'fill-muted/30 text-muted-foreground/40',

                // Hover preview
                isHovered && 'fill-yellow-300 text-yellow-400',

                // Selected
                isFilled && !isHovered && 'fill-yellow-400 text-yellow-400',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
