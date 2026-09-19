import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import Logo from '@/assets/logo.svg'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  type AppPortalRole,
  getAppPortalNavigationGroups,
  getNavigationPath,
} from '@/pages/app-portal/app-portal-navigation'

interface AppPortalAsideProps {
  role: AppPortalRole
  basePath: string
  userName: string
  userEmail: string
  onNavigate?: () => void
  onSignOut: () => void
}

function getInitials(name: string) {
  const [first = '', second = ''] = name.split(' ')
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

export function AppPortalAside({
  role,
  basePath,
  userName,
  userEmail,
  onNavigate,
  onSignOut,
}: AppPortalAsideProps) {
  const { pathname } = useLocation()
  const navigationGroups = getAppPortalNavigationGroups(role)

  return (
    <div className="bg-card flex h-full flex-col">
      <div className="border-border flex items-center gap-3 border-b px-5 py-[18px]">
        <span className="bg-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
          <img src={Logo} alt="VanHora" className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <p className="text-foreground truncate text-base font-bold tracking-tight">
            VanHora
          </p>
          <p className="text-muted-foreground truncate text-[11px] font-medium uppercase tracking-[0.6px]">
            Painel administrativo
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group, groupIndex) => (
          <section
            key={group.id}
            className={cn('space-y-0.5', groupIndex > 0 && 'mt-[18px]')}
          >
            <p className="text-muted-foreground mb-1.5 px-2 text-[10px] font-semibold tracking-[0.6px] uppercase">
              {group.label}
            </p>

            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const itemPath = getNavigationPath(basePath, item.path)
                const isActive =
                  itemPath === basePath
                    ? pathname === basePath
                    : pathname.startsWith(itemPath)
                const Icon = item.icon

                return (
                  <Link
                    key={item.id}
                    to={itemPath}
                    onClick={onNavigate}
                    className={cn(
                      'relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-accent/40 text-foreground'
                        : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground',
                    )}
                  >
                    {isActive && (
                      <span className="bg-primary absolute top-1 bottom-1 left-0 w-0.5 rounded-r-full" />
                    )}
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </section>
        ))}
      </div>

      <div className="border-border border-t p-3">
        <div className="mb-1 flex items-center gap-2.5 px-1 py-1.5">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-[13px] font-medium leading-tight">
              {userName}
            </p>
            <p className="text-muted-foreground truncate text-[11px] leading-tight">
              {userEmail}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="text-muted-foreground hover:text-destructive w-full justify-start gap-2 px-1"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </Button>
      </div>
    </div>
  )
}
