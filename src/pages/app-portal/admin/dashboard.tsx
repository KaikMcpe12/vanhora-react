import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CircleAlert,
  Clock3,
  Map,
  Star,
  TrendingUp,
} from 'lucide-react'
import { type ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const adminKpis = [
  {
    id: 'active-cooperatives',
    label: 'Cooperativas Ativas',
    value: '48',
    trend: '+3.2%',
    helper: 'com operacao ativa',
    icon: Building2,
    iconClassName:
      'bg-sky-100 text-sky-700 ring-sky-500/10 dark:bg-sky-500/15 dark:text-sky-300',
  },
  {
    id: 'registered-routes',
    label: 'Rotas Cadastradas',
    value: '892',
    trend: '+18',
    helper: 'novas nos ultimos 30 dias',
    icon: Map,
    iconClassName:
      'bg-indigo-100 text-indigo-700 ring-indigo-500/10 dark:bg-indigo-500/15 dark:text-indigo-300',
  },
  {
    id: 'today-schedules',
    label: 'Horarios de Hoje',
    value: '3.405',
    trend: '+5%',
    helper: 'considerando todas as cooperativas',
    icon: CalendarClock,
    iconClassName:
      'bg-emerald-100 text-emerald-700 ring-emerald-500/10 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    id: 'delays-24h',
    label: 'Atrasos (24h)',
    value: '14',
    trend: '+5',
    helper: 'vs periodo anterior',
    icon: Clock3,
    iconClassName:
      'bg-orange-100 text-orange-700 ring-orange-500/10 dark:bg-orange-500/15 dark:text-orange-300',
  },
  {
    id: 'average-rating',
    label: 'Avaliacao Media Geral',
    value: '4.6',
    trend: '+0.2',
    helper: 'com base nas avaliacoes recentes',
    icon: Star,
    iconClassName:
      'bg-violet-100 text-violet-700 ring-violet-500/10 dark:bg-violet-500/15 dark:text-violet-300',
  },
  {
    id: 'critical-delays',
    label: 'Atrasos Criticos (24h)',
    value: '6',
    trend: 'Alta',
    helper: 'severidade alta',
    icon: AlertTriangle,
    iconClassName:
      'bg-red-100 text-red-700 ring-red-500/10 dark:bg-red-500/15 dark:text-red-300',
  },
] as const

const delayRows = [
  {
    route: 'R-402 (Centro - Norte)',
    cooperative: 'Metro Transporters',
    delay: '32 min',
    reason: 'Fluxo intenso no centro',
    severity: 'Alta',
    severityTone: 'high',
    action: 'Abrir',
  },
  {
    route: 'L-12 (Vila Nova - Shopping)',
    cooperative: 'Cooperativa Vale',
    delay: '8 min',
    reason: 'Parada prolongada',
    severity: 'Media',
    severityTone: 'medium',
    action: 'Abrir',
  },
  {
    route: 'X-09 (Express Aeroporto)',
    cooperative: 'Swift Bus Co.',
    delay: '5 min',
    reason: 'Embarque acima do previsto',
    severity: 'Baixa',
    severityTone: 'low',
    action: 'Abrir',
  },
  {
    route: 'R-101 (Distrito Industrial)',
    cooperative: 'Metro Transporters',
    delay: '22 min',
    reason: 'Manutencao emergencial',
    severity: 'Alta',
    severityTone: 'high',
    action: 'Abrir',
  },
] as const

const departureRows = [
  {
    route: 'R-402 (Centro - Norte)',
    cooperative: 'Metro Transporters',
    departure: '14:30',
    destination: 'Terminal Central',
    status: 'No Horario',
    statusTone: 'on-time',
    action: 'Detalhes',
  },
  {
    route: 'L-12 (Vila Nova - Shopping)',
    cooperative: 'Cooperativa Vale',
    departure: '14:45',
    destination: 'Ponto Final Sul',
    status: 'Atrasado 5m',
    statusTone: 'delayed',
    action: 'Detalhes',
  },
  {
    route: 'X-09 (Express Aeroporto)',
    cooperative: 'Swift Bus Co.',
    departure: '15:00',
    destination: 'Aeroporto Int.',
    status: 'No Horario',
    statusTone: 'on-time',
    action: 'Detalhes',
  },
  {
    route: 'R-101 (Distrito Industrial)',
    cooperative: 'Metro Transporters',
    departure: '15:15',
    destination: 'Plataforma 4',
    status: 'Atrasado 10m',
    statusTone: 'delayed',
    action: 'Detalhes',
  },
] as const

function SeverityBadge({
  tone,
  label,
}: {
  tone: 'high' | 'medium' | 'low'
  label: string
}) {
  if (tone === 'high') {
    return (
      <Badge className="border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-200">
        {label}
      </Badge>
    )
  }

  if (tone === 'medium') {
    return (
      <Badge className="border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200">
        {label}
      </Badge>
    )
  }

  return (
    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
      {label}
    </Badge>
  )
}

function StatusBadge({
  tone,
  label,
}: {
  tone: 'on-time' | 'delayed'
  label: string
}) {
  if (tone === 'delayed') {
    return (
      <Badge className="border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/20 dark:text-red-200">
        {label}
      </Badge>
    )
  }

  return (
    <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-200">
      {label}
    </Badge>
  )
}

function DataSection({
  title,
  actionLabel,
  children,
}: {
  title: string
  actionLabel: string
  children: ReactNode
}) {
  return (
    <section className="bg-card overflow-hidden rounded-xl border shadow-xs">
      <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
        <h2 className="text-foreground text-base font-semibold">{title}</h2>
        <Button variant="link" className="text-primary h-auto px-0 text-sm">
          {actionLabel}
        </Button>
      </header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  )
}

export function AdminDashboardPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">
          Dashboard Admin
        </h1>
        <p className="text-muted-foreground text-sm">
          Visao consolidada de operacao, qualidade e incidentes da rede.
        </p>
      </header>

      <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-300" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Atencao: 6 atrasos criticos nas ultimas 24h
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Priorize investigacao nas rotas com severidade alta.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-card border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-200 dark:hover:bg-amber-500/20"
          >
            Ver atrasos
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminKpis.map((kpi) => {
          const Icon = kpi.icon

          return (
            <article
              key={kpi.id}
              className="bg-card rounded-xl border p-4 shadow-xs sm:p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm font-medium">
                    {kpi.label}
                  </p>
                  <p className="text-foreground text-3xl leading-none font-semibold">
                    {kpi.value}
                  </p>
                </div>
                <div
                  className={`ring-border/50 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${kpi.iconClassName}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {kpi.trend}
                </span>
                <span className="text-muted-foreground">{kpi.helper}</span>
              </div>
            </article>
          )
        })}
      </section>

      <DataSection
        title="Ultimos Atrasos Reportados"
        actionLabel="Ver incidentes"
      >
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Rota</th>
              <th className="px-4 py-3 text-left font-medium">Cooperativa</th>
              <th className="px-4 py-3 text-left font-medium">Atraso</th>
              <th className="px-4 py-3 text-left font-medium">Motivo</th>
              <th className="px-4 py-3 text-left font-medium">Severidade</th>
              <th className="px-4 py-3 text-right font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {delayRows.map((row) => (
              <tr key={`${row.route}-${row.delay}`} className="border-t">
                <td className="text-foreground px-4 py-3 font-medium">
                  {row.route}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {row.cooperative}
                </td>
                <td className="text-foreground px-4 py-3 font-semibold">
                  {row.delay}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {row.reason}
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge tone={row.severityTone} label={row.severity} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="link"
                    className="text-primary h-auto px-0 text-sm"
                  >
                    {row.action}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataSection>

      <DataSection title="Proximas Partidas" actionLabel="Ver todos">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Rota</th>
              <th className="px-4 py-3 text-left font-medium">Cooperativa</th>
              <th className="px-4 py-3 text-left font-medium">Partida</th>
              <th className="px-4 py-3 text-left font-medium">Destino</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {departureRows.map((row) => (
              <tr key={`${row.route}-${row.departure}`} className="border-t">
                <td className="text-foreground px-4 py-3 font-medium">
                  {row.route}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {row.cooperative}
                </td>
                <td className="text-foreground px-4 py-3 font-semibold">
                  {row.departure}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {row.destination}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={row.statusTone} label={row.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="link"
                    className="text-primary h-auto px-0 text-sm"
                  >
                    {row.action}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataSection>
    </section>
  )
}
