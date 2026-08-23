import {
  Building2,
  ExternalLink,
  MousePointerClick,
  PauseCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState, useQueryStates } from 'nuqs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useAdminCooperatives,
  useToggleCooperativeStatus,
} from '@/lib/api/mock-cooperatives-api'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { cn } from '@/lib/utils'

import { getCooperativeHealth } from './cooperative-data'
import { CooperativeDetailPanel } from './cooperative-detail-panel'
import { CooperativeFormDrawer } from './cooperative-form-drawer'
import { getInitials } from './cooperative-shared'

function onTimePill(percent: number): string {
  if (percent >= 90)
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
  if (percent >= 80)
    return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
  return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300'
}

const STATUS_LABEL: Record<AdminCooperative['status'], string> = {
  active: 'Ativa',
  suspended: 'Suspensa',
  inactive: 'Inativa',
}

export function AdminCooperativesPage() {
  const navigate = useNavigate()

  // Navegação persistida na URL — ?cooperative=<uuid>&tab=<tab>; refresh preserva.
  const [{ cooperative: coopId, tab: activeTab }, setNav] = useQueryStates({
    cooperative: parseAsString.withDefault(''),
    tab: parseAsString.withDefault('geral'),
  })
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''))
  // Mesmas chaves dos useTableFilters das abas — limpas ao trocar de coop/aba.
  const [, setTabParams] = useQueryStates({
    search: parseAsString,
    page: parseAsInteger,
  })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCoop, setEditCoop] = useState<AdminCooperative | null>(null)
  const [suspendCoop, setSuspendCoop] = useState<AdminCooperative | null>(null)
  const [deactivateCoop, setDeactivateCoop] = useState<AdminCooperative | null>(
    null,
  )

  const toggleStatus = useToggleCooperativeStatus()

  const { data } = useAdminCooperatives({
    search: '',
    status: '',
    page: 1,
    pageSize: 999,
  })
  const all = data?.data ?? []

  const selected = coopId ? (all.find((c) => c.id === coopId) ?? null) : null

  const filtered = all.filter(
    (c) => !q.trim() || c.name.toLowerCase().includes(q.toLowerCase()),
  )

  const resetTabParams = () => setTabParams({ search: null, page: null })
  const selectCoop = (id: string) => {
    setNav({ cooperative: id, tab: 'geral' })
    resetTabParams()
  }
  const changeTab = (tab: string) => {
    setNav({ tab })
    resetTabParams()
  }
  const clearSelection = () => {
    setNav({ cooperative: null, tab: null })
    resetTabParams()
  }

  const openCreate = () => {
    setEditCoop(null)
    setDrawerOpen(true)
  }
  const openEdit = (coop: AdminCooperative) => {
    setEditCoop(coop)
    setDrawerOpen(true)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Master — list */}
      <aside className={cn('flex-col gap-3', coopId ? 'hidden lg:flex' : 'flex')}>
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-foreground text-[15px] font-semibold">
            Cooperativas
          </h2>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Nova
          </Button>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value || null)}
            placeholder="Buscar cooperativa..."
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-1 py-6 text-center text-[13px]">
              Nenhuma cooperativa encontrada.
            </p>
          ) : (
            filtered.map((c) => {
              const isActive = selected?.id === c.id
              const health = getCooperativeHealth(c)
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={c.name}
                  onClick={() => selectCoop(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      selectCoop(c.id)
                    }
                  }}
                  className={cn(
                    'focus-visible:ring-ring/50 flex cursor-pointer items-center gap-2.5 rounded-lg border border-l-2 px-3 py-2.5 transition-colors focus-visible:ring-2 focus-visible:outline-none',
                    isActive
                      ? 'border-border border-l-primary bg-accent/40'
                      : 'hover:bg-accent/30 border-transparent border-l-transparent',
                    c.status === 'inactive' && 'opacity-60',
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: c.brandColor }}
                  >
                    {getInitials(c.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-[13px] font-medium">
                      {c.name}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {health.routeCount} rotas · {health.driverCount} motoristas
                    </p>
                  </div>
                  {c.status === 'active' ? (
                    <span
                      title={`${health.onTimeRate}% de pontualidade`}
                      className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                        onTimePill(health.onTimeRate),
                      )}
                    >
                      {health.onTimeRate}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground bg-muted shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                      {STATUS_LABEL[c.status]}
                    </span>
                  )}
                  <AdminActionMenu
                    items={[
                      {
                        label: 'Ver perfil público',
                        icon: ExternalLink,
                        onClick: () => navigate(`/cooperatives/${c.id}`),
                      },
                      { label: 'Editar', icon: Pencil, onClick: () => openEdit(c) },
                      { divider: true, label: '', onClick: () => {} },
                      ...(c.status === 'active'
                        ? [
                            {
                              label: 'Suspender',
                              icon: PauseCircle,
                              onClick: () => setSuspendCoop(c),
                              variant: 'danger' as const,
                            },
                          ]
                        : [
                            {
                              label: 'Reativar',
                              icon: RotateCcw,
                              onClick: async () => {
                                await toggleStatus.mutateAsync({
                                  id: c.id,
                                  newStatus: 'active',
                                })
                                toast.success(`Cooperativa "${c.name}" reativada`)
                              },
                            },
                          ]),
                      ...(c.status !== 'inactive'
                        ? [
                            {
                              label: 'Excluir',
                              icon: X,
                              onClick: () => setDeactivateCoop(c),
                              variant: 'danger' as const,
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
              )
            })
          )}
        </div>
      </aside>

      {/* Detail */}
      <section className={cn(coopId ? 'block' : 'hidden lg:block')}>
        {selected ? (
          <CooperativeDetailPanel
            cooperative={selected}
            activeTab={activeTab}
            onTabChange={changeTab}
            onEdit={() => openEdit(selected)}
            onBack={clearSelection}
          />
        ) : all.length === 0 ? (
          <AdminEmptyState
            icon={Building2}
            title="Nenhuma cooperativa cadastrada"
            description="Cadastre a primeira cooperativa da plataforma para começar."
            action={{ label: 'Nova cooperativa', onClick: openCreate, icon: Plus }}
          />
        ) : (
          <AdminEmptyState
            icon={MousePointerClick}
            title="Selecione uma cooperativa"
            description="Escolha uma cooperativa na lista ao lado para ver o painel completo — identidade, operação, rotas, motoristas e atrasos."
          />
        )}
      </section>

      <CooperativeFormDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) setEditCoop(null)
        }}
        cooperative={editCoop}
        onCreated={(coop) => selectCoop(coop.id)}
      />

      <AdminConfirmDialog
        open={!!suspendCoop}
        onOpenChange={(open) => {
          if (!open) setSuspendCoop(null)
        }}
        title="Suspender cooperativa"
        description={`A cooperativa "${suspendCoop?.name}" será suspensa temporariamente. Suas ${
          suspendCoop ? getCooperativeHealth(suspendCoop).activeRouteCount : 0
        } rota(s) ativa(s) ficarão indisponíveis até a reativação.`}
        confirmLabel="Suspender"
        variant="danger"
        tone="warning"
        onConfirm={async () => {
          if (!suspendCoop) return
          await toggleStatus.mutateAsync({
            id: suspendCoop.id,
            newStatus: 'suspended',
          })
          toast.success(`Cooperativa "${suspendCoop.name}" suspensa`)
          setSuspendCoop(null)
        }}
      />

      <AdminConfirmDialog
        open={!!deactivateCoop}
        onOpenChange={(open) => {
          if (!open) setDeactivateCoop(null)
        }}
        title="Excluir cooperativa"
        description={`Esta ação vai excluir (soft-delete) a cooperativa "${deactivateCoop?.name}". Confirme digitando o nome.`}
        confirmLabel="Excluir"
        variant="danger"
        consequencesTitle="O que será afetado"
        consequences={[
          `${
            deactivateCoop ? getCooperativeHealth(deactivateCoop).activeRouteCount : 0
          } rota(s) ativa(s) ficarão indisponíveis`,
          'Passageiros não verão mais os horários dessa cooperativa',
          'Motoristas associados perderão o acesso',
        ]}
        requireTypedConfirmation={{
          expectedText: deactivateCoop?.name ?? '',
          label: 'Digite o nome da cooperativa para confirmar',
        }}
        onConfirm={async () => {
          if (!deactivateCoop) return
          await toggleStatus.mutateAsync({
            id: deactivateCoop.id,
            newStatus: 'inactive',
          })
          toast.success(`Cooperativa "${deactivateCoop.name}" excluída`)
          if (coopId === deactivateCoop.id) clearSelection()
          setDeactivateCoop(null)
        }}
      />
    </div>
  )
}
