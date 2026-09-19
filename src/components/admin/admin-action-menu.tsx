import { type LucideIcon, MoreHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface AdminActionMenuItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  divider?: boolean
}

interface AdminActionMenuProps {
  items: AdminActionMenuItem[]
  align?: 'start' | 'end'
}

export function AdminActionMenu({
  items,
  align = 'end',
}: AdminActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="relative h-7 w-7 rounded-full text-muted-foreground hover:text-foreground before:absolute before:-inset-2 before:content-[''] sm:before:hidden"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mais opções</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[180px]">
        {items.map((item, index) => {
          if (item.divider) {
            return <DropdownMenuSeparator key={`divider-${index}`} />
          }

          const Icon = item.icon

          return (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              disabled={item.disabled}
              variant={item.variant === 'danger' ? 'destructive' : 'default'}
              className="gap-2 text-[13px]"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {item.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
