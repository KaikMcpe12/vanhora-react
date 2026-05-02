export type OperationalStatus = 'in_operation' | 'delayed' | 'cancelled' | 'suspended'
export type ScheduleRecordStatus = 'active' | 'cancelled' | 'suspended'
export type ExceptionType = 'cancelled' | 'suspended' | 'rescheduled'
export type DayOfWeek = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

export interface RouteStop {
  city: string
  time: string
}

export interface ScheduleException {
  date: string
  type: ExceptionType
  // required when type='rescheduled' (maps to schedules_exceptions.new_departure_time)
  newDepartureTime?: string
  reason?: string
}

export interface ScheduleTemporary {
  id: string
  routeId: string
  departureTime: string
  date: string
  reason?: string
  status: 'active' | 'cancelled'
}

export interface AdminSchedule {
  id: string
  departureTime: string
  // schedules.day_of_week — single field per record; each departure_time × day = one row in DB
  dayOfWeek: DayOfWeek
  // aggregated day_of_week values across all schedule records with the same departure_time
  activeDays: DayOfWeek[]
  cooperativeName: string
  origin: string
  destination: string
  routeCode: string
  recordStatus: ScheduleRecordStatus
  operationalStatus: OperationalStatus
  notes?: string
  nextException?: ScheduleException
  rating?: { average: number; total: number; lastAt?: string }
}

export interface AdminRoute {
  id: string
  code: string
  cooperativeName: string
  origin: string
  destination: string
  // routes.active_days
  activeDays: DayOfWeek[]
  basePrice: number
  openExceptionsCount: number
  nextExceptionDate?: string
  // routes_stop — belongs to route, not to individual schedules
  stops: RouteStop[]
  schedules: AdminSchedule[]
  // schedules_temporary — extra services not in the recurring schedule
  temporarySchedules?: ScheduleTemporary[]
}
