import { AlertTriangle, CalendarCheck2, Route, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'

import {
  AdminEmptyState,
  AdminKPICard,
  AdminSectionTitle,
} from '@/components/admin'
import { CurrentTripCard } from '@/components/driver/current-trip-card'
import { ReportDelayDialog } from '@/components/driver/report-delay-dialog'
import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useDriverProfile,
  useDriverSchedulesToday,
} from '@/lib/api/mock-driver-portal-api'
import {
  type DriverScheduleEntry,
  MOCK_DRIVER_NOW,
  MOCK_DRIVER_STATS,
} from '@/lib/data/mock-driver-portal'
import { getCurrentTrip } from '@/lib/driver/current-trip'
import {
  DRIVER_SCHEDULE_STATUS_META,
  USER_STATUS_META,
} from '@/lib/status/status-meta'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

interface OutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

function getScheduleBadge(entry: DriverScheduleEntry) {
  const meta = DRIVER_SCHEDULE_STATUS_META[entry.status]
  if (entry.status === 'delayed' && entry.delayMinutes)
    return { ...meta, label: `Atrasado ${entry.delayMinutes}m` }
  return meta
}

function todayLabel(): string {
  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function TripRow({ entry }: { entry: DriverScheduleEntry }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border p-3">
      <span className="text-foreground text-sm font-semibold tabular-nums">
        {entry.departureTime}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-medium">
          {entry.routeCode} → {entry.destination}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {entry.routeName}
        </p>
      </div>
      <StatusChip {...getScheduleBadge(entry)} />
    </li>
  )
}

export function DriverDashboardPage() {
  const navigate = useNavigate()
  const { user } = useOutletContext<OutletContext>()
  const [reportOpen, setReportOpen] = useState(false)
  const [showAllCompleted, setShowAllCompleted] = useState(false)

  const { data: profile } = useDriverProfile()
  const { data: schedules = [], isLoading } = useDriverSchedulesToday()

  const currentTrip = getCurrentTrip(schedules, MOCK_DRIVER_NOW)
  const currentId = currentTrip?.entry.id

  const completed = schedules.filter((s) => s.status === 'completed')
  const upcoming = schedules
    .filter(
      (s) =>
        s.id !== currentId &&
        s.status !== 'completed' &&
        s.status !== 'cancelled',
    )
    .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
  const nextTrip = upcoming[0]

  const firstName = (profile?.name ?? user.name).split(' ')[0]
  const goDetails = () => navigate('/driver/my-schedules')

  return (
    <div className="space-y-8">
      {/* saudação + status */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">
            Bem-vindo, {firstName} 👋
          </h2>
          <p className="text-muted-foreground text-sm">{todayLabel()}</p>
        </div>
        <StatusChip {...USER_STATUS_META[profile?.status ?? 'active']} />
      </section>

      {/* KPIs rápidos */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminKPICard
          label="Viagens hoje"
          value={schedules.length}
          icon={Route}
        />
        <AdminKPICard
          label="Pontualidade"
          value={`${MOCK_DRIVER_STATS.onTimeRate}%`}
          trend={{
            value: `${MOCK_DRIVER_STATS.onTimeDelta >= 0 ? '+' : ''}${MOCK_DRIVER_STATS.onTimeDelta} pts`,
            direction: MOCK_DRIVER_STATS.onTimeDelta >= 0 ? 'up' : 'down',
            contextLabel: 'vs semana passada',
          }}
          icon={TrendingUp}
        />
        <AdminKPICard
          label="Atrasos reportados"
          value={MOCK_DRIVER_STATS.delaysReported}
          helper="últimos 30 dias"
          icon={AlertTriangle}
        />
      </section>

      {/* PRIMÁRIO — viagem atual / próxima / vazio */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : currentTrip ? (
        <CurrentTripCard
          trip={currentTrip}
          onReportDelay={() => setReportOpen(true)}
          onViewDetails={goDetails}
        />
      ) : nextTrip ? (
        <section className="bg-card rounded-xl border border-l-4 border-l-slate-300 p-5">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Próxima saída
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <p className="text-foreground text-xl font-bold">
                às {nextTrip.departureTime}
              </p>
              <p className="text-muted-foreground text-sm">
                {nextTrip.routeCode} → {nextTrip.destination}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 rounded-full"
              onClick={goDetails}
            >
              Ver detalhes
            </Button>
          </div>
        </section>
      ) : (
        <AdminEmptyState
          icon={CalendarCheck2}
          title={
            schedules.length
              ? 'Todas as viagens de hoje foram concluídas'
              : 'Nenhuma viagem programada para hoje'
          }
          description={
            schedules.length
              ? 'Bom trabalho! Volte amanhã para as próximas viagens.'
              : 'Seu dia está livre ou os horários ainda não foram atribuídos.'
          }
        />
      )}

      {/* base — próximas + completadas */}
      {!isLoading && schedules.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <AdminSectionTitle title="Próximas viagens" />
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.map((e) => (
                  <TripRow key={e.id} entry={e} />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma viagem pendente.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <AdminSectionTitle
              title={`Completadas hoje (${completed.length})`}
            />
            {completed.length ? (
              <>
                <ul className="space-y-2">
                  {(showAllCompleted ? completed : completed.slice(0, 3)).map(
                    (e) => (
                      <TripRow key={e.id} entry={e} />
                    ),
                  )}
                </ul>
                {completed.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllCompleted((v) => !v)}
                  >
                    {showAllCompleted
                      ? 'Ver menos'
                      : `Ver todas (${completed.length})`}
                  </Button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma viagem concluída ainda.
              </p>
            )}
          </section>
        </div>
      )}

      <ReportDelayDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        entry={currentTrip?.entry ?? null}
      />
    </div>
  )
}
