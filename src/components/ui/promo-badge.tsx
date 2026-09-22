import * as React from 'react'

import { cn } from '@/lib/utils'

type PromoBadgeProps = {
  children: React.ReactNode
  icon?: React.ReactNode
  size?: 'sm' | 'md'
  className?: string
}

export function PromoBadge({ children, icon, size = 'sm', className }: PromoBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium tracking-[0.3px] bg-vh-amber-bg text-vh-amber-text',
        size === 'sm'
          ? 'gap-[4px] rounded-[8px] px-[7px] py-[2px] text-[10px]'
          : 'gap-[4px] rounded-[10px] px-[8px] py-[3px] text-[11px]',
        className,
      )}
    >
      {icon && <span className="flex-shrink-0 flex items-center">{icon}</span>}
      {children}
    </span>
  )
}
