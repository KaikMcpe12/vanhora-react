import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function cooperativeStatusBadge(status: AdminCooperative['status']) {
  if (status === 'active') return { variant: 'success' as const, label: 'Ativa' }
  if (status === 'suspended')
    return { variant: 'attention' as const, label: 'Suspensa' }
  return { variant: 'neutral' as const, label: 'Inativa' }
}

const routeStatusMap = {
  active: { variant: 'success' as const, label: 'Ativa' },
  suspended: { variant: 'attention' as const, label: 'Suspensa' },
  inactive: { variant: 'neutral' as const, label: 'Inativa' },
}

export function routeStatusBadge(status: 'active' | 'suspended' | 'inactive') {
  return routeStatusMap[status]
}
