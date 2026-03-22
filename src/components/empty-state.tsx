import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('py-12 text-center', className)}>
      <div className="bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground h-8 w-8" />
      </div>

      <h3 className="text-foreground mb-2 text-lg font-semibold">{title}</h3>

      {description && (
        <p className="text-muted-foreground mx-auto mb-6 max-w-md text-sm leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'outline'}
          className="min-w-32"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}
