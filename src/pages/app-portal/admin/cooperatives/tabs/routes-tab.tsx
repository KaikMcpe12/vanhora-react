import { ArrowRight, CircleCheck, Plus, Route as RouteIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AdminEmptyState, AdminStat, AdminStatusBadge } from '@/components/admin'
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
  const createHref = `/admin/routes/nova?cooperative=${encodeURIComponent(cooperative.name)}`

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
              'group flex cursor-pointer flex-col gap-3 rounded-xl border border-l-4 border-border bg-card p-4 transition-colors',
              'hover:border-primary/40 hover:bg-accent/20 focus-visible:border-primary/40 focus-visible:bg-accent/20 focus-visible:outline-none',
              statusBorder[r.status],
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-foreground">
                  {r.name}
                </p>
                <p className="text-[12px] text-muted-foreground">{r.code}</p>
              </div>
              <AdminStatusBadge {...routeStatusBadge(r.status)} />
            </div>

            <div className="flex items-center gap-2 text-[13px] text-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">{r.origin}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <span className="truncate">{r.destination}</span>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2.5">
              <span className="text-[13px] font-medium text-foreground">
                {r.price ? `R$ ${r.price.toFixed(2)}` : '—'}
              </span>
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground group-hover:text-primary">
                Ver detalhes
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </article>
        ))}

        {/* Cadastrar nova rota */}
        <button
          onClick={() => navigate(createHref)}
          className="flex min-h-[132px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="text-[13px] font-medium">Cadastrar nova rota</span>
        </button>
      </div>
    </div>
  )
}
