import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'

interface AdminSectionTitleProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
}

export function AdminSectionTitle({
  title,
  description,
  icon: Icon,
  actions,
}: AdminSectionTitleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <p className="text-[15px] font-medium text-foreground">{title}</p>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Separator />
    </div>
  )
}
