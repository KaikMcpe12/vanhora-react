import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import {
  ROUTE_STATUS_META,
  type StatusChipInput,
} from '@/lib/status/status-meta'

export function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function cooperativeStatusBadge(
  status: AdminCooperative['status'],
): StatusChipInput {
  return ROUTE_STATUS_META[status]
}

export function routeStatusBadge(
  status: 'active' | 'suspended' | 'inactive',
): StatusChipInput {
  return ROUTE_STATUS_META[status]
}
