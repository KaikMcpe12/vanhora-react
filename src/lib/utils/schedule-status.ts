import type { ScheduleBadge } from '@/lib/types/schedule'

export type ScheduleVisualStatus = 'urgent' | 'active' | 'delayed' | 'cancelled'

export const COOPERATIVE_COLORS: Record<string, string> = {
  'São Benedito': '#185FA5',
  Nordeste: '#0F6E56',
  Guanabara: '#993C1D',
  'Real Expresso': '#0D5C8A',
  Sertão: '#7B5B2C',
  Fretcar: '#155E4F',
  Progresso: '#534AB7',
  'União Cascavel': '#1B6B45',
  'Expresso Jaguaribe': '#8B1D6B',
  'Via Cariri': '#6B3524',
}

const COLOR_PALETTE = Object.values(COOPERATIVE_COLORS)

export function getCooperativeColor(name: string): string {
  if (COOPERATIVE_COLORS[name]) return COOPERATIVE_COLORS[name]
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0)
  return COLOR_PALETTE[hash % COLOR_PALETTE.length]
}

/** Retorna quantos minutos faltam até a partida (negativo se já passou) */
export function getMinutesUntilDeparture(departureTime: string): number {
  const [hours, minutes] = departureTime.split(':').map(Number)
  const now = new Date()
  const departure = new Date(now)
  departure.setHours(hours, minutes, 0, 0)
  return Math.round((departure.getTime() - now.getTime()) / 60000)
}

export function getVisualStatus(
  departureTime: string,
  badge: ScheduleBadge,
  delayMinutes?: number,
): ScheduleVisualStatus {
  if (badge === 'cancelled') return 'cancelled'
  if (delayMinutes && delayMinutes > 0) return 'delayed'
  const mins = getMinutesUntilDeparture(departureTime)
  if (mins >= 0 && mins <= 15) return 'urgent'
  return 'active'
}
