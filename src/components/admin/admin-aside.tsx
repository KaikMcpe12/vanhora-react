import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import Logo from '@/assets/logo.svg'
import { Button } from '@/components/ui/button'
import {
  ADMIN_ROLE_LABEL,
  type AdminRole,
  getAdminNavigationByRole,
} from '@/lib/config/admin-navigation'
import { cn } from '@/lib/utils'

interface AdminAsideProps {
  role: AdminRole
  userName: string
  userEmail: string
  onNavigate?: () => void
  onSignOut: () => void
}

function getInitials(name: string) {
  const [first = '', second = ''] = name.split(' ')
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

export function AdminAside({
  role,
  userName,
  userEmail,
  onNavigate,
  onSignOut,
}: AdminAsideProps) {
  const { pathname } = useLocation()
  const navigationGroups = getAdminNavigationByRole(role)

  return (
    <div className="bg-card flex h-full flex-col">
      <div className="border-border bg-primary/5 flex items-center gap-3 border-b px-5 py-4">
        <img src={Logo} alt="VanHora" className="h-9 w-9" />
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold tracking-tight">
            VanHora
          </p>
          <p className="text-muted-foreground truncate text-xs">
            Painel administrativo
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group) => (
          <section key={group.id} className="space-y-1.5">
            <p className="text-muted-foreground px-2 text-[11px] font-semibold tracking-wide uppercase">
              {group.label}
            </p>

            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.path === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.path)

                const Icon = item.icon

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/12 text-primary border-primary/40 border'
                        : 'text-muted-foreground hover:bg-accent/80 hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </section>
        ))}
      </div>

      <div className="border-border bg-background border-t p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-md border px-2.5 py-2">
          <div className="bg-primary/15 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              {userName}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {userEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border px-2 py-1.5">
          <p className="text-muted-foreground text-xs">
            {ADMIN_ROLE_LABEL[role]}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Sair</span>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
