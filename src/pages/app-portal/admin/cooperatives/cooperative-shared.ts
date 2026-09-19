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

/** Rótulos curtos (S T Q…) e por extenso para o padrão semanal da aba Geral. */
export const WEEKDAYS: Array<{ key: string; short: string; long: string }> = [
  { key: 'monday', short: 'Seg', long: 'segunda' },
  { key: 'tuesday', short: 'Ter', long: 'terça' },
  { key: 'wednesday', short: 'Qua', long: 'quarta' },
  { key: 'thursday', short: 'Qui', long: 'quinta' },
  { key: 'friday', short: 'Sex', long: 'sexta' },
  { key: 'saturday', short: 'Sáb', long: 'sábado' },
  { key: 'sunday', short: 'Dom', long: 'domingo' },
]

const dateFmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

/** "28 de jun." → "28 jun." — datas curtas para tabelas e blocos discretos. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(date.getTime())) return '—'
  return dateFmt.format(date).replace('.', '')
}
