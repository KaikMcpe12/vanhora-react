import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RatingDisplayProps {
  rating: number
  reviews?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  variant?: 'default' | 'compact'
  className?: string
}

const SIZE_CONFIG = {
  sm: { star: 'h-3 w-3', text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 'h-3.5 w-3.5', text: 'text-xs', gap: 'gap-1' },
  lg: { star: 'h-4 w-4', text: 'text-sm', gap: 'gap-1.5' },
}

export function RatingDisplay({
  rating,
  reviews,
  size = 'md',
  showLabel = true,
  variant = 'default',
  className,
}: RatingDisplayProps) {
  const config = SIZE_CONFIG[size]
  const fullStars = Math.floor(rating)
  const hasPartial = rating % 1 !== 0
  const partialPercentage = ((rating % 1) * 100).toFixed(0)

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center', config.gap, className)}>
        <Star className={cn(config.star, 'fill-yellow-400 text-yellow-400')} />
        <span className={cn('font-medium', config.text)}>
          {rating.toFixed(1)}
        </span>
        {showLabel && reviews !== undefined && (
          <span className={cn('text-muted-foreground', config.text)}>
            ({reviews})
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      {/* estrelas */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = star <= fullStars
          const isPartial = star === fullStars + 1 && hasPartial

          return (
            <div key={star} className="relative">
              <Star
                className={cn(
                  config.star,
                  'fill-muted/30 text-muted-foreground/40',
                )}
              />
              {(isFull || isPartial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    width: isPartial ? `${partialPercentage}%` : '100%',
                  }}
                >
                  <Star
                    className={cn(
                      config.star,
                      'fill-yellow-400 text-yellow-400',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* rating numérico */}
      <span className={cn('font-medium', config.text)}>
        {rating.toFixed(1)}
      </span>

      {/* reviews count */}
      {showLabel && reviews !== undefined && (
        <span className={cn('text-muted-foreground', config.text)}>
          ({reviews} {reviews === 1 ? 'avaliação' : 'avaliações'})
        </span>
      )}
    </div>
  )
}
