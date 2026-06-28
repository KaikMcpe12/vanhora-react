import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { RatingStars } from '@/components/rating-stars'
import { Skeleton } from '@/components/ui/skeleton'
import { useRating } from '@/hooks/use-rating'
import { cn } from '@/lib/utils'

interface InlineRatingProps {
  scheduleId: string
  className?: string
}

export function InlineRating({ scheduleId, className }: InlineRatingProps) {
  const [selected, setSelected] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const { hasRated, isLoading, submitRating, isSubmitting } = useRating({
    scheduleId,
    onSuccess: () => setSubmitted(true),
  })

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (hasRated || submitted) {
    return (
      <div className={cn('flex items-center gap-1.5 pointer-events-none', className)}>
        <CheckCircle2 size={14} className="text-[#0F6E56]" strokeWidth={2} />
        <span className="text-[13px] font-medium" style={{ color: '#0F6E56' }}>
          Enviado
        </span>
      </div>
    )
  }

  const handleConfirm = () => {
    if (selected > 0 && !isSubmitting) submitRating(selected)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <span className="block text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Como foi essa viagem?
      </span>

      <div className="flex items-center justify-between gap-3">
        <RatingStars value={selected} onChange={setSelected} size="sm" disabled={isSubmitting} />

        {selected > 0 && (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex cursor-pointer items-center gap-0.5 text-[12px] text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            {isSubmitting ? 'enviando…' : 'confirmar'}
            <ArrowRight size={12} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  )
}
