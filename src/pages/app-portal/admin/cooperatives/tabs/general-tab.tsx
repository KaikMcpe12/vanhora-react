import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Globe,
  Info,
  Phone,
  Route as RouteIcon,
  TrendingUp,
} from 'lucide-react'

import { AdminStatusBadge } from '@/components/admin'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'

import { getCooperativeRoutes, getCooperativeStats } from '../cooperative-data'
import { routeStatusBadge } from '../cooperative-shared'

function CardHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
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
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-[13px] text-foreground">{value || '—'}</p>
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
      <div className="space-y-4 rounded-xl border border-border bg-card p-5 lg:col-span-2">
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
          <p className="border-t border-border pt-3 text-[13px] leading-relaxed text-muted-foreground">
            {cooperative.description}
          </p>
        )}
      </div>

      {/* Taxa de pontualidade — highlight (recent_history.on_time_rate) */}
      <div className="flex flex-col justify-between rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-center gap-2 text-primary">
          <TrendingUp className="h-4 w-4" />
          <p className="text-[13px] font-semibold">Taxa de pontualidade</p>
        </div>
        <p className="mt-3 text-[40px] font-semibold leading-none text-primary">
          {stats.onTimeRate}%
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground">
          {stats.pendingDelays} atraso(s) pendente(s) no período.
        </p>
      </div>

      {/* Principais rotas */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-5 lg:col-span-3">
        <CardHeader icon={RouteIcon} title="Principais rotas" />
        {routes.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            Nenhuma rota cadastrada para esta cooperativa.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {routes.slice(0, 4).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {r.name}{' '}
                    <span className="text-muted-foreground">({r.code})</span>
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {r.origin} → {r.destination}
                  </p>
                </div>
                <AdminStatusBadge {...routeStatusBadge(r.status)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
