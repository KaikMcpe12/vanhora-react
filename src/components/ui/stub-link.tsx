import * as React from 'react'

import { cn } from '@/lib/utils'

type StubLinkProps = {
  children: React.ReactNode
  className?: string
  tooltipMessage?: string
}

export function StubLink({
  children,
  className,
  tooltipMessage = 'em breve',
}: StubLinkProps) {
  return (
    <span
      title={tooltipMessage}
      className={cn('cursor-not-allowed select-none opacity-60', className)}
    >
      {children}
    </span>
  )
}
