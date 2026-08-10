import { AlertTriangle, Clock, PauseCircle, PlayCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

import { AdminKPICard, AdminSectionTitle } from '@/components/admin'
import { DelaysByRouteBarChart } from '@/components/charts/delays-by-route-bar-chart'
import { OnTimeAreaChart } from '@/components/charts/on-time-area-chart'
import { SeverityDonutChart } from '@/components/charts/severity-donut-chart'
import { LiveUpdatedAt } from '@/components/cooperative/live-updated-at'
import { OperationsBoard } from '@/components/cooperative/operations-board'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCoopOperationalPanel } from '@/lib/api/mock-cooperative-portal-api'
import { COOP_NOW } from '@/lib/data/mock-cooperative-operations'
import { cn } from '@/lib/utils'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

interface OutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

const NOW_MIN = COOP_NOW.getHours() * 60 + COOP_NOW.getMinutes()
const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function CooperativeDashboardPage() {
  const { user } = useOutletContext<OutletContext>()
  const { data, isLoading, dataUpdatedAt } = useCoopOperationalPanel()
  const [showAllNext, setShowAllNext] = useState(false)

  const kpis = data?.kpis
  const operations = data?.operations ?? []
  const nextDepartures = data?.nextDepartures ?? []
  const onTimeHistory = data?.onTimeHistory ?? []
  const delaysByRoute = data?.delaysByRoute ?? []
  const severityDistribution = data?.severityDistribution ?? []

  const firstName = user.name.split(' ')[0]

  const kpiCards = [
    {
      label: 'Em operação',
      value: kpis?.emOperacao ?? 0,
      icon: PlayCircle,
      severity: 'default' as const,
    },
    {
      label: 'Atrasadas',
      value: kpis?.atrasadas ?? 0,
      icon: AlertTriangle,
      severity:
        (kpis?.atrasadas ?? 0) > 0
          ? ('critical' as const)
          : ('default' as const),
    },
    {
      label: 'Suspensas',
      value: kpis?.suspensas ?? 0,
      icon: PauseCircle,
      severity:
        (kpis?.suspensas ?? 0) > 0
          ? ('attention' as const)
          : ('default' as const),
    },
    {
      label: 'Atrasos pendentes',
      value: kpis?.pendentes ?? 0,
      icon: Clock,
      severity:
        (kpis?.pendentes ?? 0) > 0
          ? ('attention' as const)
          : ('default' as const),
    },
  ]

  const visibleNext = showAllNext ? nextDepartures : nextDepartures.slice(0, 4)

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-foreground text-xl font-semibold">
            Bem-vindo, {firstName} 👋
          </h2>
          <p className="text-muted-foreground text-sm">
            Painel operacional — o que está rodando agora
          </p>
        </div>
        {dataUpdatedAt ? <LiveUpdatedAt updatedAt={dataUpdatedAt} /> : null}
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.05 }}
          >
            <AdminKPICard
              label={k.label}
              value={k.value}
              icon={k.icon}
              severity={k.severity}
            />
          </motion.div>
        ))}
      </section>

      <section className="space-y-4">
        <AdminSectionTitle
          title="Agora"
          description="Operações em andamento neste momento"
        />
        {isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <OperationsBoard
            operations={operations}
            nextDeparture={nextDepartures[0]}
          />
        )}
      </section>

      {nextDepartures.length > 0 && (
        <section className="space-y-4">
          <AdminSectionTitle
            title="Próximas saídas"
            description="Partidas ainda programadas para hoje"
          />
          <ul className="space-y-2">
            {visibleNext.map((op) => {
              const mins = toMin(op.departureTime) - NOW_MIN
              const soon = mins <= 30
              return (
                <li
                  key={op.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    soon && 'border-l-4 border-l-emerald-500',
                  )}
                >
                  <span className="text-foreground text-sm font-semibold tabular-nums">
                    {op.departureTime}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-sm font-medium">
                      {op.routeCode} → {op.destination}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {op.origin}
                    </p>
                  </div>
                  {soon && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      em {mins} min
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          {nextDepartures.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllNext((v) => !v)}
            >
              {showAllNext
                ? 'Ver menos'
                : `Ver todas (${nextDepartures.length})`}
            </Button>
          )}
        </section>
      )}

      <section className="space-y-4">
        <AdminSectionTitle
          title="Desempenho"
          description="Tendências dos últimos 30 dias"
        />
        <div className="bg-card rounded-xl border p-4">
          <p className="text-foreground mb-3 text-sm font-medium">
            Pontualidade — % de viagens no prazo (30 dias)
          </p>
          <OnTimeAreaChart data={onTimeHistory} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-card rounded-xl border p-4">
            <p className="text-foreground mb-3 text-sm font-medium">
              Atrasos por rota
            </p>
            <DelaysByRouteBarChart data={delaysByRoute} />
          </div>
          <div className="bg-card rounded-xl border p-4">
            <p className="text-foreground mb-3 text-sm font-medium">
              Distribuição de severidade
            </p>
            <SeverityDonutChart data={severityDistribution} />
          </div>
        </div>
      </section>
    </div>
  )
}
