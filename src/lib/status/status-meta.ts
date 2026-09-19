import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  type LucideIcon,
  MinusCircle,
  PauseCircle,
  PlayCircle,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'

import type { StatusTone } from '@/components/status-chip'
import type { OperationalStatus } from '@/lib/types/admin-schedule'

/** As 3 props do StatusChip sem o `className` — fonte única de status → chip. */
export interface StatusChipInput {
  tone: StatusTone
  icon: LucideIcon
  label: string
}

// Rota / cidade / cooperativa — entidades com status "feminino" (Ativa/Suspensa/Inativa).
export type RouteStatus = 'active' | 'inactive' | 'suspended'
export const ROUTE_STATUS_META: Record<RouteStatus, StatusChipInput> = {
  active: { tone: 'success', icon: CheckCircle2, label: 'Ativa' },
  inactive: { tone: 'neutral', icon: MinusCircle, label: 'Inativa' },
  suspended: { tone: 'warning', icon: PauseCircle, label: 'Suspensa' },
}

// Usuário / motorista — status "masculino" (Ativo/Inativo).
export type UserStatus = 'active' | 'inactive'
export const USER_STATUS_META: Record<UserStatus, StatusChipInput> = {
  active: { tone: 'success', icon: CheckCircle2, label: 'Ativo' },
  inactive: { tone: 'neutral', icon: MinusCircle, label: 'Inativo' },
}

// Operação do horário (AdminSchedule.operationalStatus).
export type ScheduleStatus = OperationalStatus
export const SCHEDULE_STATUS_META: Record<ScheduleStatus, StatusChipInput> = {
  in_operation: { tone: 'success', icon: PlayCircle, label: 'Em operação' },
  delayed: { tone: 'warning', icon: AlertCircle, label: 'Atrasado' },
  cancelled: { tone: 'danger', icon: XCircle, label: 'Cancelado' },
  suspended: { tone: 'neutral', icon: PauseCircle, label: 'Suspenso' },
}

// Resolução de atraso.
export type DelayStatus = 'pending' | 'resolved'
export const DELAY_STATUS_META: Record<DelayStatus, StatusChipInput> = {
  pending: { tone: 'warning', icon: Clock, label: 'Pendente' },
  resolved: { tone: 'success', icon: CheckCircle2, label: 'Resolvido' },
}

// Viagem do motorista / partida — 'delayed' pode ganhar os minutos via label no call-site.
export type DriverScheduleStatus =
  | 'scheduled'
  | 'on_time'
  | 'delayed'
  | 'completed'
  | 'cancelled'
export const DRIVER_SCHEDULE_STATUS_META: Record<
  DriverScheduleStatus,
  StatusChipInput
> = {
  scheduled: { tone: 'info', icon: CalendarClock, label: 'Programado' },
  on_time: { tone: 'success', icon: CheckCircle2, label: 'No horário' },
  delayed: { tone: 'warning', icon: AlertCircle, label: 'Atrasado' },
  completed: { tone: 'success', icon: CheckCircle2, label: 'Concluído' },
  cancelled: { tone: 'danger', icon: XCircle, label: 'Cancelado' },
}

// Papel do usuário (renderizado como chip na listagem de usuários).
export type UserRole = 'admin' | 'cooperative' | 'driver'
export const USER_ROLE_META: Record<UserRole, StatusChipInput> = {
  admin: { tone: 'info', icon: ShieldCheck, label: 'Administrador' },
  cooperative: { tone: 'success', icon: Building2, label: 'Cooperativa' },
  driver: { tone: 'warning', icon: User, label: 'Motorista' },
}
