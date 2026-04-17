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

export type AppPortalRole = 'admin' | 'cooperative' | 'driver'
export type AppPortalGroupId = 'main' | 'transport'

export interface AppPortalUser {
  name: string
  email: string
  role: AppPortalRole
}

export interface AppPortalNavigationItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  group: AppPortalGroupId
  roles: AppPortalRole[]
}

export interface AppPortalNavigationGroup {
  id: AppPortalGroupId
  label: string
  items: AppPortalNavigationItem[]
}

export const APP_PORTAL_ROLE_LABEL: Record<AppPortalRole, string> = {
  admin: 'Administrador',
  cooperative: 'Cooperativa',
  driver: 'Motorista',
}

export const APP_PORTAL_GROUP_LABEL: Record<AppPortalGroupId, string> = {
  main: 'Menu Principal',
  transport: 'Dados de Transporte',
}

export const APP_PORTAL_NAVIGATION_ITEMS: AppPortalNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '',
    icon: BarChart3,
    group: 'main',
    roles: ['admin', 'cooperative', 'driver'],
  },
  {
    id: 'cities',
    label: 'Cidades',
    path: 'cities',
    icon: MapPinned,
    group: 'main',
    roles: ['admin'],
  },
  {
    id: 'cooperatives',
    label: 'Cooperativas',
    path: 'cooperatives',
    icon: Building2,
    group: 'main',
    roles: ['admin'],
  },
  {
    id: 'users',
    label: 'Usuarios',
    path: 'users',
    icon: Users,
    group: 'main',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'my-cooperative',
    label: 'Minha Cooperativa',
    path: 'my-cooperative',
    icon: Building2,
    group: 'main',
    roles: ['cooperative'],
  },
  {
    id: 'me',
    label: 'Meu Perfil',
    path: 'me',
    icon: UserRound,
    group: 'main',
    roles: ['driver'],
  },
  {
    id: 'routes',
    label: 'Rotas',
    path: 'routes',
    icon: Route,
    group: 'transport',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'my-routes',
    label: 'Minhas Rotas',
    path: 'my-routes',
    icon: Route,
    group: 'transport',
    roles: ['driver'],
  },
  {
    id: 'schedules',
    label: 'Horarios',
    path: 'schedules',
    icon: Clock3,
    group: 'transport',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'my-schedules',
    label: 'Meus Horarios',
    path: 'my-schedules',
    icon: Clock3,
    group: 'transport',
    roles: ['driver'],
  },
  {
    id: 'delays',
    label: 'Atrasos',
    path: 'delays',
    icon: AlertTriangle,
    group: 'transport',
    roles: ['admin', 'cooperative'],
  },
  {
    id: 'report-delay',
    label: 'Reportar Atraso',
    path: 'report-delay',
    icon: AlertTriangle,
    group: 'transport',
    roles: ['driver'],
  },
]

export const APP_PORTAL_MOCK_USERS: Record<AppPortalRole, AppPortalUser> = {
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

export function getNavigationPath(basePath: string, itemPath: string) {
  if (!itemPath) {
    return basePath
  }

  return `${basePath}/${itemPath}`
}

export function getAppPortalNavigationItems(role: AppPortalRole) {
  return APP_PORTAL_NAVIGATION_ITEMS.filter((item) => item.roles.includes(role))
}

export function getAppPortalNavigationGroups(
  role: AppPortalRole,
): AppPortalNavigationGroup[] {
  const items = getAppPortalNavigationItems(role)
  const orderedGroups: AppPortalGroupId[] = ['main', 'transport']

  return orderedGroups
    .map((groupId) => ({
      id: groupId,
      label: APP_PORTAL_GROUP_LABEL[groupId],
      items: items.filter((item) => item.group === groupId),
    }))
    .filter((group) => group.items.length > 0)
}

export function canAccessAppPortalPath(
  role: AppPortalRole,
  pathname: string,
  basePath: string,
) {
  return getAppPortalNavigationItems(role).some((item) => {
    const path = getNavigationPath(basePath, item.path)
    if (path === basePath) {
      return pathname === basePath
    }

    return pathname.startsWith(path)
  })
}

export function getAppPortalPageLabel(
  pathname: string,
  role: AppPortalRole,
  basePath: string,
) {
  const item = getAppPortalNavigationItems(role).find((navItem) => {
    const path = getNavigationPath(basePath, navItem.path)
    if (path === basePath) {
      return pathname === basePath
    }

    return pathname.startsWith(path)
  })

  return item?.label ?? 'Area Administrativa'
}
