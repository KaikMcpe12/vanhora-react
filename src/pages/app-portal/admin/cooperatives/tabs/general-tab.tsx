import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  Globe,
  MapPin,
  Phone,
  Route as RouteIcon,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { AdminKPICard } from '@/components/admin'
import { StatusChip } from '@/components/status-chip'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { cn } from '@/lib/utils'

import type { AdminCooperativeDetail } from '../cooperative-data'
import { useCooperativeDetail } from '../cooperative-queries'
import {
  formatShortDate,
  getInitials,
  routeStatusBadge,
  WEEKDAYS,
} from '../cooperative-shared'

// ── helpers ──────────────────────────────────────────────────────────────────

/** cor da pontualidade — o KPI de qualidade ganha peso pela cor (nunca só cor) */
function onTimeTone(percent: number): string {
  if (percent >= 90) return 'text-emerald-600 dark:text-emerald-400'
  if (percent >= 80) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function Panel({
  icon: Icon,
  title,
  brandColor,
  children,
  className,
}: {
  icon: LucideIcon
  title: string
  brandColor?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-border bg-card space-y-4 rounded-xl border p-5',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={
            brandColor
              ? { backgroundColor: `${brandColor}1A`, color: brandColor }
              : undefined
          }
        >
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-foreground text-[13px] font-semibold">{title}</p>
      </div>
      {children}
    </div>
  )
}

// ── identidade (brand_color como acento real) ────────────────────────────────

function IdentityHero({ detail }: { detail: AdminCooperativeDetail }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-l-4"
      style={{
        borderLeftColor: detail.brandColor,
        background: `linear-gradient(100deg, ${detail.brandColor}14, transparent 60%)`,
      }}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ backgroundColor: detail.brandColor }}
        >
          {detail.logoUrl ? (
            <img
              src={detail.logoUrl}
              alt=""
              className="h-full w-full rounded-xl object-cover"
            />
          ) : (
            getInitials(detail.name)
          )}
        </span>

        <div className="min-w-0 flex-1 space-y-3">
          {detail.description ? (
            <p className="text-foreground text-[13px] leading-relaxed">
              {detail.description}
            </p>
          ) : (
            <p className="text-muted-foreground text-[13px] italic">
              Sem descrição cadastrada.
            </p>
          )}
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {detail.phone}
            </span>
            {detail.site && (
              <a
                href={
                  detail.site.startsWith('http')
                    ? detail.site
                    : `https://${detail.site}`
                }
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary inline-flex items-center gap-1.5 underline-offset-2 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {detail.site.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Ativa desde {detail.activeSinceYear}
            </span>
            {detail.reviewCount > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-foreground font-medium">
                  {detail.rating.toFixed(1)}
                </span>
                · {detail.reviewCount.toLocaleString('pt-BR')} avaliações
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── padrão semanal (schedules_per_weekday) ───────────────────────────────────

function WeeklyPattern({ detail }: { detail: AdminCooperativeDetail }) {
  const reduce = useReducedMotion()
  const stats = detail.operatingStats
  const values = WEEKDAYS.map((d) => stats.schedulesPerWeekday[d.key] ?? 0)
  const max = Math.max(1, ...values)
  const total = values.reduce((s, v) => s + v, 0)
  const busiest = WEEKDAYS.find((d) => d.key === stats.busiestDay)

  if (total === 0) {
    return (
      <Panel icon={CalendarClock} title="Padrão semanal" brandColor={detail.brandColor}>
        <p className="text-muted-foreground text-[13px]">
          Sem horários ativos para desenhar o padrão semanal.
        </p>
      </Panel>
    )
  }

  return (
    <Panel icon={CalendarClock} title="Padrão semanal" brandColor={detail.brandColor}>
      <div className="space-y-2">
        {WEEKDAYS.map((day, i) => {
          const value = stats.schedulesPerWeekday[day.key] ?? 0
          const isBusiest = day.key === stats.busiestDay
          return (
            <div key={day.key} className="flex items-center gap-3">
              <span
                className={cn(
                  'w-8 shrink-0 text-[11px] font-medium',
                  isBusiest ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {day.short}
              </span>
              <div className="bg-muted h-4 flex-1 overflow-hidden rounded-full">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: detail.brandColor,
                    opacity: isBusiest ? 1 : 0.35,
                  }}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${(value / max) * 100}%` }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : 0.05 * i }}
                />
              </div>
              <span
                className={cn(
                  'w-6 shrink-0 text-right text-[12px] tabular-nums',
                  isBusiest
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground',
                )}
              >
                {value}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-muted-foreground border-border border-t pt-3 text-[12px]">
        <span className="text-foreground font-medium">{total}</span> saídas por
        semana
        {busiest && (
          <>
            {' · '}
            <span className="text-foreground font-medium">{busiest.long}</span> é
            o dia de pico
          </>
        )}
      </p>
    </Panel>
  )
}

// ── performance (on_time_rate + distribuição de severidade) ──────────────────

function PerformanceCard({ detail }: { detail: AdminCooperativeDetail }) {
  const { delays, onTimeRate } = detail.recentHistory
  const percent = Math.round(onTimeRate * 100)
  const dist = delays.severityDistribution
  const totalDelays = dist.low + dist.medium + dist.high
  const segments = [
    { key: 'low', label: 'Leves', count: dist.low, className: 'bg-emerald-500' },
    { key: 'medium', label: 'Médios', count: dist.medium, className: 'bg-amber-500' },
    { key: 'high', label: 'Graves', count: dist.high, className: 'bg-red-500' },
  ]

  return (
    <Panel icon={TrendingUp} title="Como está performando" brandColor={detail.brandColor}>
      <div>
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          Pontualidade (últimos 30 dias)
        </p>
        <p className={cn('mt-1 text-[40px] leading-none font-semibold', onTimeTone(percent))}>
          {percent}%
        </p>
        <p className="text-muted-foreground mt-1.5 text-[12px]">
          de saídas no horário
        </p>
      </div>

      <div className="border-border space-y-2.5 border-t pt-3">
        {totalDelays === 0 ? (
          <div className="flex items-center gap-2 text-[13px] text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            Nenhum atraso nos últimos 30 dias
          </div>
        ) : (
          <>
            <p className="text-foreground text-[13px]">
              {totalDelays} atrasos · média de {delays.averageDelayMinutes} min
            </p>
            <div className="bg-muted flex h-2 overflow-hidden rounded-full">
              {segments.map(
                (s) =>
                  s.count > 0 && (
                    <div
                      key={s.key}
                      className={s.className}
                      style={{ width: `${(s.count / totalDelays) * 100}%` }}
                    />
                  ),
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
              {segments.map((s) => (
                <span
                  key={s.key}
                  className="text-muted-foreground inline-flex items-center gap-1.5"
                >
                  <span className={cn('h-2 w-2 rounded-full', s.className)} />
                  {s.count} {s.label.toLowerCase()}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </Panel>
  )
}

// ── onde ela opera (cities_served + top_destination) ─────────────────────────

function CitiesCard({ detail }: { detail: AdminCooperativeDetail }) {
  const { citiesServed, operatingStats } = detail
  const top = operatingStats.topDestination

  return (
    <Panel icon={MapPin} title="Onde ela opera" brandColor={detail.brandColor}>
      {top.cityName && (
        <div
          className="flex items-center justify-between gap-3 rounded-lg border border-l-4 px-4 py-3"
          style={{
            borderLeftColor: detail.brandColor,
            background: `${detail.brandColor}0D`,
          }}
        >
          <div>
            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              Destino mais popular
            </p>
            <p className="text-foreground text-[15px] font-semibold">
              {top.cityName}
            </p>
          </div>
          <span className="text-foreground text-[13px] font-medium">
            {top.scheduleCount} saídas
          </span>
        </div>
      )}

      {citiesServed.length === 0 ? (
        <p className="text-muted-foreground text-[13px]">
          Nenhuma cidade atendida ainda.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {citiesServed.map((city) => (
            <span
              key={city.id}
              className="border-border text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px]"
            >
              <MapPin className="text-muted-foreground h-3 w-3" />
              {city.name}
              <span className="text-muted-foreground">{city.state}</span>
            </span>
          ))}
        </div>
      )}
    </Panel>
  )
}

// ── cancelamentos recentes (discreto, mas visível) ───────────────────────────

function CancellationsCard({ detail }: { detail: AdminCooperativeDetail }) {
  const { cancellations } = detail.recentHistory

  return (
    <Panel icon={XCircle} title="Cancelamentos recentes" brandColor={detail.brandColor}>
      {cancellations.recent.length === 0 ? (
        <div className="flex items-center gap-2 text-[13px] text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4" />
          Nenhum nos últimos 30 dias
        </div>
      ) : (
        <div className="space-y-3">
          {cancellations.recent.map((c, i) => (
            <div key={i} className="flex gap-2.5">
              <span className="bg-border mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              <div className="min-w-0">
                <p className="text-foreground text-[12px] font-medium">
                  {formatShortDate(c.date)} · {c.route}
                </p>
                <p className="text-muted-foreground text-[11px]">{c.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

// ── principais rotas (top 5) ─────────────────────────────────────────────────

function TopRoutesCard({
  detail,
  onViewRoutes,
}: {
  detail: AdminCooperativeDetail
  onViewRoutes?: () => void
}) {
  if (detail.topRoutes.length === 0) return null
  return (
    <Panel icon={RouteIcon} title="Principais rotas" brandColor={detail.brandColor}>
      <div className="grid gap-2 sm:grid-cols-2">
        {detail.topRoutes.map((r) => (
          <div
            key={r.id}
            className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-foreground truncate text-[13px] font-medium">
                {r.name}
                {r.code && (
                  <span className="text-muted-foreground"> ({r.code})</span>
                )}
              </p>
              <p className="text-muted-foreground truncate text-[12px]">
                {r.origin} → {r.destination}
              </p>
            </div>
            <StatusChip {...routeStatusBadge(r.status)} />
          </div>
        ))}
      </div>
      {onViewRoutes && (
        <button
          type="button"
          onClick={onViewRoutes}
          className="text-primary inline-flex items-center gap-1 text-[13px] font-medium hover:underline"
        >
          Ver todas as rotas
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      )}
    </Panel>
  )
}

// ── skeleton ─────────────────────────────────────────────────────────────────

function GeneralTabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

// ── aba ──────────────────────────────────────────────────────────────────────

export function GeneralTab({
  cooperative,
  onViewRoutes,
}: {
  cooperative: AdminCooperative
  onViewRoutes?: () => void
}) {
  const reduce = useReducedMotion()
  const { data: detail, isLoading } = useCooperativeDetail(cooperative)

  if (isLoading || !detail) return <GeneralTabSkeleton />

  const kpis = [
    {
      label: 'Rotas ativas',
      value: detail.activeRouteCount,
      helper: `de ${detail.routeCount} no total`,
      icon: RouteIcon,
    },
    {
      label: 'Motoristas',
      value: detail.driverCount,
      helper: `${detail.activeDriverCount} ativos`,
      icon: Users,
    },
    {
      label: 'Horários hoje',
      value: detail.schedulesTodayCount,
      helper: 'partidas estimadas',
      icon: Clock,
    },
    {
      label: 'Avaliação',
      value: detail.reviewCount > 0 ? detail.rating.toFixed(1) : '—',
      helper:
        detail.reviewCount > 0
          ? `${detail.reviewCount.toLocaleString('pt-BR')} avaliações`
          : 'sem avaliações',
      icon: Star,
    },
  ]

  // entrada escalonada por seção (§1 do plano) — nunca em hover
  const section = (index: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.25, delay: index * 0.06 },
        }

  return (
    <div className="space-y-4">
      <motion.div {...section(0)}>
        <IdentityHero detail={detail} />
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} {...section(1 + i)}>
            <AdminKPICard
              label={kpi.label}
              value={kpi.value}
              helper={kpi.helper}
              icon={kpi.icon}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...section(5)}>
          <WeeklyPattern detail={detail} />
        </motion.div>
        <motion.div {...section(6)}>
          <PerformanceCard detail={detail} />
        </motion.div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div className="lg:col-span-2" {...section(7)}>
          <CitiesCard detail={detail} />
        </motion.div>
        <motion.div {...section(8)}>
          <CancellationsCard detail={detail} />
        </motion.div>
      </div>

      <motion.div {...section(9)}>
        <TopRoutesCard detail={detail} onViewRoutes={onViewRoutes} />
      </motion.div>
    </div>
  )
}
