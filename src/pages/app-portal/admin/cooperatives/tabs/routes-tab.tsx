import { ArrowRight, CircleCheck, Plus, Route as RouteIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AdminEmptyState, AdminStat } from '@/components/admin'
import { StatusChip } from '@/components/status-chip'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { cn } from '@/lib/utils'

import { getCooperativeRoutes } from '../cooperative-data'
import { routeStatusBadge } from '../cooperative-shared'

const statusBorder: Record<'active' | 'suspended' | 'inactive', string> = {
  active: 'border-l-emerald-500',
  suspended: 'border-l-amber-500',
  inactive: 'border-l-slate-400',
}

export function RoutesTab({ cooperative }: { cooperative: AdminCooperative }) {
  const navigate = useNavigate()
  const routes = getCooperativeRoutes(cooperative.id)
  const activeCount = routes.filter((r) => r.status === 'active').length
  const routesHref = `/admin/routes?cooperative=${encodeURIComponent(cooperative.name)}`
  // Criar rota já com a cooperativa atual pré-selecionada (redirecionamento inteligente).
  const createHref = `/admin/routes/new?cooperative=${encodeURIComponent(cooperative.name)}`

  if (routes.length === 0) {
    return (
      <AdminEmptyState
        icon={Plus}
        title="Nenhuma rota cadastrada"
        description={`${cooperative.name} ainda não possui rotas. Cadastre a primeira para começar.`}
        action={{
          label: 'Cadastrar rota',
          onClick: () => navigate(createHref),
          icon: Plus,
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-lg">
        <AdminStat label="Rotas" value={routes.length} icon={RouteIcon} />
        <AdminStat
          label="Ativas"
          value={activeCount}
          icon={CircleCheck}
          tone="success"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {routes.map((r) => (
          <article
            key={r.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(routesHref)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(routesHref)
              }
            }}
            className={cn(
              'group border-border bg-card flex cursor-pointer flex-col gap-3 rounded-xl border border-l-4 p-4 transition-colors',
              'hover:border-primary/40 hover:bg-accent/20 focus-visible:border-primary/40 focus-visible:bg-accent/20 focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              statusBorder[r.status],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-foreground truncate text-[14px] font-medium">
                  {r.name}
                </p>
                <p className="text-muted-foreground text-[12px]">{r.code}</p>
              </div>
              <StatusChip {...routeStatusBadge(r.status)} />
            </div>

            <div className="text-foreground flex items-center gap-2 text-[13px]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">{r.origin}</span>
              <ArrowRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <span className="truncate">{r.destination}</span>
            </div>

            <div className="border-border flex items-center justify-between border-t pt-2.5">
              <span className="text-foreground text-[13px] font-medium">
                {r.price ? `R$ ${r.price.toFixed(2)}` : '—'}
              </span>
              <span className="text-muted-foreground group-hover:text-primary inline-flex items-center gap-1 text-[12px] font-medium">
                Ver detalhes
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </article>
        ))}

        {/* Cadastrar nova rota */}
        <button
          onClick={() => navigate(createHref)}
          className="border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed transition-colors"
        >
          <Plus className="h-6 w-6" />
          <span className="text-[13px] font-medium">Cadastrar nova rota</span>
        </button>
      </div>
    </div>
  )
}
