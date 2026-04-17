import { ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  APP_PORTAL_ROLE_LABEL,
  type AppPortalRole,
  getNavigationPath,
} from '@/pages/app-portal/app-portal-navigation'

interface AppPortalHeaderProps {
  role: AppPortalRole
  userName: string
  title: string
  breadcrumb: string
  basePath: string
  onOpenMobileMenu: () => void
  onSignOut: () => void
}

function getInitials(name: string) {
  const [first = '', second = ''] = name.split(' ')
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

export function AppPortalHeader({
  role,
  userName,
  title,
  breadcrumb,
  basePath,
  onOpenMobileMenu,
  onSignOut,
}: AppPortalHeaderProps) {
  const profilePath =
    role === 'driver' ? getNavigationPath(basePath, 'me') : basePath

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
          {APP_PORTAL_ROLE_LABEL[role]}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="hover:bg-accent/80 h-10 rounded-full px-1.5"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={profilePath}>
                <UserRound className="h-4 w-4" />
                Meu perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
