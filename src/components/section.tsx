import * as React from 'react'

import { cn } from '@/lib/utils'

import { PromoBadge } from './ui/promo-badge'

type SectionProps = {
  title: string
  count?: number
  countLabel?: string
  hint?: { text: string; icon?: React.ReactNode }
  children: React.ReactNode
  className?: string
}

export function Section({ title, count, countLabel, hint, children, className }: SectionProps) {
  const countLabel_ = countLabel ?? (count === 1 ? 'horário' : 'horários')

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div>
        {/* Primary row: title (left) + hint on desktop + count (right) */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-foreground font-semibold">{title}</span>
            {hint && (
              <span className="hidden shrink-0 md:inline-flex">
                <PromoBadge size="sm" icon={hint.icon}>{hint.text}</PromoBadge>
              </span>
            )}
          </div>
          {count !== undefined && (
            <span className="text-muted-foreground shrink-0 text-sm">
              {count} {countLabel_}
            </span>
          )}
        </div>
        {/* Hint on its own line on mobile */}
        {hint && (
          <div className="mt-1 md:hidden">
            <PromoBadge size="sm" icon={hint.icon}>{hint.text}</PromoBadge>
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
