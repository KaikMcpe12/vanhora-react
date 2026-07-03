import * as React from 'react'

import { cn } from '@/lib/utils'

type FeaturedAmberCardProps = {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function FeaturedAmberCard({ children, className, onClick }: FeaturedAmberCardProps) {
  return (
    <div
      className={cn(
        'rounded-[12px] border border-vh-amber-border bg-vh-amber-card-bg p-[14px_16px]',
        onClick && 'cursor-pointer transition-transform hover:-translate-y-px',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
