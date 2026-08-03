import { Inbox, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface AdminEmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
}

export function AdminEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </span>
      <p className="mt-4 text-[15px] font-medium text-foreground">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-5 gap-2"
        >
          {action.icon && <action.icon className="h-3.5 w-3.5" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}
