import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Globe,
  Info,
  Phone,
  Route as RouteIcon,
  TrendingUp,
} from 'lucide-react'

import { StatusChip } from '@/components/status-chip'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'

import { getCooperativeRoutes, getCooperativeStats } from '../cooperative-data'
import { routeStatusBadge } from '../cooperative-shared'

function CardHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-foreground text-[13px] font-semibold">{title}</p>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="text-foreground truncate text-[13px]">{value || '—'}</p>
      </div>
    </div>
  )
}

export function GeneralTab({ cooperative }: { cooperative: AdminCooperative }) {
  const routes = getCooperativeRoutes(cooperative.id)
  const stats = getCooperativeStats(cooperative)
  const activeSince = new Date(cooperative.createdAt).getFullYear()

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Informações */}
      <div className="border-border bg-card space-y-4 rounded-xl border p-5 lg:col-span-2">
        <CardHeader icon={Info} title="Informações" />
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoRow icon={Phone} label="Telefone" value={cooperative.phone} />
          <InfoRow icon={Globe} label="Site" value={cooperative.site ?? '—'} />
          <InfoRow
            icon={Calendar}
            label="Ativa desde"
            value={String(activeSince)}
          />
          <InfoRow
            icon={RouteIcon}
            label="Rotas cadastradas"
            value={`${routes.length}`}
          />
        </div>
        {cooperative.description && (
          <p className="border-border text-muted-foreground border-t pt-3 text-[13px] leading-relaxed">
            {cooperative.description}
          </p>
        )}
      </div>

      {/* Taxa de pontualidade — highlight (recent_history.on_time_rate) */}
      <div className="border-primary/20 bg-primary/5 flex flex-col justify-between rounded-xl border p-5">
        <div className="text-primary flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <p className="text-[13px] font-semibold">Taxa de pontualidade</p>
        </div>
        <p className="text-primary mt-3 text-[40px] leading-none font-semibold">
          {stats.onTimeRate}%
        </p>
        <p className="text-muted-foreground mt-2 text-[12px]">
          {stats.pendingDelays} atraso(s) pendente(s) no período.
        </p>
      </div>

      {/* Principais rotas */}
      <div className="border-border bg-card space-y-3 rounded-xl border p-5 lg:col-span-3">
        <CardHeader icon={RouteIcon} title="Principais rotas" />
        {routes.length === 0 ? (
          <p className="text-muted-foreground text-[13px]">
            Nenhuma rota cadastrada para esta cooperativa.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {routes.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-foreground truncate text-[13px] font-medium">
                    {r.name}{' '}
                    <span className="text-muted-foreground">({r.code})</span>
                  </p>
                  <p className="text-muted-foreground truncate text-[12px]">
                    {r.origin} → {r.destination}
                  </p>
                </div>
                <StatusChip {...routeStatusBadge(r.status)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
