import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'

interface AdminSectionTitleProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminSectionTitle({
  title,
  description,
  actions,
}: AdminSectionTitleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-foreground">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Separator />
    </div>
  )
}
