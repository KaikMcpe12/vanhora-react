import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  CalendarX,
  Clock,
  MapPin,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { mockUsersApi } from '@/lib/api/mock-users-api'
import type { User } from '@/lib/data/mock-users'
import { UserAvatar } from './user-avatar'
import { cn } from '@/lib/utils'

interface DriverSchedulesModalProps {
  isOpen: boolean
  onClose: () => void
  driver: User
}

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; label: string; borderColor: string }
> = {
  active: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    label: 'Ativo',
  },
  suspended: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    borderColor: 'border-amber-200',
    label: 'Suspenso',
  },
  cancelled: {
    bg: 'bg-rose-100',
    text: 'text-rose-700',
    borderColor: 'border-rose-200',
    label: 'Cancelado',
  },
}

export function DriverSchedulesModal({
  isOpen,
  onClose,
  driver,
}: DriverSchedulesModalProps) {
  // Early return if driver is null or doesn't have an id
  if (!driver || !driver.id || driver.role !== 'driver') {
    return null
  }

  const isValidDriver = true

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ['driver-schedules', driver.id],
    queryFn: () => mockUsersApi.getDriverSchedules(driver.id),
    enabled: isOpen,
  })

  // Guard: if no driver ID or driver is not actually a driver role, return null
  if (!isValidDriver) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 border-b bg-white p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <UserAvatar name={driver.name} role={driver.role} size="lg" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {driver.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {schedulesData?.cooperativeName || 'Carregando...'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {schedulesData?.total || 0} horário(s) agendado(s)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* KPI Bar */}
        {schedulesData && (
          <div className="border-b px-6 py-3 flex gap-6 bg-slate-50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-semibold text-foreground">
                  {schedulesData.total} horários
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Rotas</p>
                <p className="text-sm font-semibold text-foreground">
                  {schedulesData.schedulesByRoute.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-sm font-semibold text-emerald-700">
                  {schedulesData.schedulesByRoute.reduce(
                    (sum: number, r: typeof schedulesData.schedulesByRoute[number]) =>
                      sum + r.schedules.filter((s) => s.status === 'active').length,
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : schedulesData && schedulesData.schedulesByRoute.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarX className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-foreground font-semibold">Nenhum horário encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Este motorista não possui horários agendados
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {schedulesData && schedulesData.schedulesByRoute.map((route: typeof schedulesData.schedulesByRoute[number]) => (
                <div key={route.routeId} className="space-y-3">
                  {/* Route Card Header */}
                  <div className="rounded-lg border bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {route.routeName}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {route.origin} → {route.destination}
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {route.schedules.length} horário(s)
                      </Badge>
                    </div>
                  </div>

                  {/* Schedules List */}
                  <div className="space-y-2 pl-3">
                    {route.schedules.map((schedule: typeof route.schedules[number]) => {
                      const statusInfo =
                        STATUS_BADGE[schedule.status] || STATUS_BADGE.active

                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between gap-3 rounded-lg border bg-white p-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {schedule.dayOfWeek}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <p className="text-sm font-semibold text-foreground">
                              {schedule.departureTime}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'shrink-0 border',
                              statusInfo.bg,
                              statusInfo.text,
                              statusInfo.borderColor,
                            )}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t bg-white p-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
