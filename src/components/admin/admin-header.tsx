import { Menu } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ADMIN_ROLE_LABEL, type AdminRole } from '@/lib/config/admin-navigation'

interface AdminHeaderProps {
  role: AdminRole
  userName: string
  title: string
  breadcrumb: string
  onOpenMobileMenu: () => void
}

export function AdminHeader({
  role,
  userName,
  title,
  breadcrumb,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()

  return (
    <header className="bg-background border-border flex h-20 items-center justify-between border-b px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="lg:hidden"
          onClick={onOpenMobileMenu}
        >
          <span className="sr-only">Abrir menu administrativo</span>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{breadcrumb}</p>
          <p className="text-foreground truncate text-sm font-semibold md:text-base">
            {title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Badge variant="secondary" className="hidden md:inline-flex">
          {ADMIN_ROLE_LABEL[role]}
        </Badge>

        <div className="bg-primary/15 text-primary flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
          {initials}
        </div>
      </div>
    </header>
  )
}
