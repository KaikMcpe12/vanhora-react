import {
  AlertTriangle,
  BarChart3,
  Building2,
  Clock3,
  type LucideIcon,
  MapPinned,
  Route,
  UserRound,
  Users,
} from 'lucide-react'

export type AdminRole = 'admin' | 'cooperative' | 'driver'
export type AdminNavigationGroupId = 'main' | 'transport'

export interface AdminUser {
  name: string
  email: string
  role: AdminRole
}

export interface AdminNavigationItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  group: AdminNavigationGroupId
  roles: AdminRole[]
}

export interface AdminNavigationGroup {
  id: AdminNavigationGroupId
  label: string
  items: AdminNavigationItem[]
}

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  admin: 'Administrador',
  cooperative: 'Cooperativa',
  driver: 'Motorista',
}

export const ADMIN_NAVIGATION_GROUP_LABEL: Record<
  AdminNavigationGroupId,
  string
> = {
  main: 'Menu Principal',
  transport: 'Dados de Transporte',
}

export const ADMIN_NAVIGATION_ITEMS: AdminNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: BarChart3,
    group: 'main',
    roles: ['admin', 'cooperative', 'driver'],
  },
  {
    id: 'cities',
    label: 'Cidades',
    path: '/admin/cities',
    icon: MapPinned,
    group: 'main',
    roles: ['admin'],
  },
  {
    id: 'cooperatives',
    label: 'Cooperativas',
    path: '/admin/cooperatives',
    icon: Building2,
    group: 'main',
    roles: ['admin'],
  },
  {
    id: 'users',
    label: 'Usuarios',
    path: '/admin/users',
    icon: Users,
    group: 'main',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'my-cooperative',
    label: 'Minha Cooperativa',
    path: '/admin/my-cooperative',
    icon: Building2,
    group: 'main',
    roles: ['cooperative'],
  },
  {
    id: 'me',
    label: 'Meu Perfil',
    path: '/admin/me',
    icon: UserRound,
    group: 'main',
    roles: ['driver'],
  },
  {
    id: 'routes',
    label: 'Rotas',
    path: '/admin/routes',
    icon: Route,
    group: 'transport',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'my-routes',
    label: 'Minhas Rotas',
    path: '/admin/my-routes',
    icon: Route,
    group: 'transport',
    roles: ['driver'],
  },
  {
    id: 'schedules',
    label: 'Horarios',
    path: '/admin/schedules',
    icon: Clock3,
    group: 'transport',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'my-schedules',
    label: 'Meus Horarios',
    path: '/admin/my-schedules',
    icon: Clock3,
    group: 'transport',
    roles: ['driver'],
  },
  {
    id: 'delays',
    label: 'Atrasos',
    path: '/admin/delays',
    icon: AlertTriangle,
    group: 'transport',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'report-delay',
    label: 'Reportar Atraso',
    path: '/admin/report-delay',
    icon: AlertTriangle,
    group: 'transport',
    roles: ['driver'],
  },
]

export const ADMIN_MOCK_USERS: Record<AdminRole, AdminUser> = {
  admin: {
    name: 'Ana Gestora',
    email: 'admin@vanhora.dev',
    role: 'admin',
  },
  cooperative: {
    name: 'Carlos Cooperativa',
    email: 'coop@vanhora.dev',
    role: 'cooperative',
  },
  driver: {
    name: 'Joao Motorista',
    email: 'driver@vanhora.dev',
    role: 'driver',
  },
}

export function isAdminRole(value: string | null): value is AdminRole {
  return value === 'admin' || value === 'cooperative' || value === 'driver'
}

export function getAdminNavigationItems(role: AdminRole) {
  return ADMIN_NAVIGATION_ITEMS.filter((item) => item.roles.includes(role))
}

export function getAdminNavigationByRole(
  role: AdminRole,
): AdminNavigationGroup[] {
  const items = getAdminNavigationItems(role)
  const orderedGroups: AdminNavigationGroupId[] = ['main', 'transport']

  return orderedGroups
    .map((groupId) => ({
      id: groupId,
      label: ADMIN_NAVIGATION_GROUP_LABEL[groupId],
      items: items.filter((item) => item.group === groupId),
    }))
    .filter((group) => group.items.length > 0)
}

export function canAccessAdminPath(role: AdminRole, pathname: string) {
  return getAdminNavigationItems(role).some((item) => {
    if (item.path === '/admin') {
      return pathname === '/admin'
    }

    return pathname.startsWith(item.path)
  })
}

export function getAdminPageLabel(pathname: string, role: AdminRole) {
  const item = getAdminNavigationItems(role).find((navItem) => {
    if (navItem.path === '/admin') {
      return pathname === '/admin'
    }

    return pathname.startsWith(navItem.path)
  })

  return item?.label ?? 'Area Administrativa'
}
