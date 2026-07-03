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
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-semibold">{title}</span>
          {hint && (
            <PromoBadge size="sm" icon={hint.icon}>
              {hint.text}
            </PromoBadge>
          )}
        </div>
        {count !== undefined && (
          <span className="text-muted-foreground text-sm">
            {count} {countLabel ?? (count === 1 ? 'horário' : 'horários')}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
