import {
  ExternalLink,
  PauseCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  StatusFilterChips,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useAdminCooperatives,
  useToggleCooperativeStatus,
} from '@/lib/api/mock-cooperatives-api'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { cn } from '@/lib/utils'

import { CooperativeDetailPanel } from './cooperative-detail-panel'
import { CooperativeFormDrawer } from './cooperative-form-drawer'
import { getInitials } from './cooperative-shared'

export function AdminCooperativesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>([
    'active',
    'suspended',
    'inactive',
  ])
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

  const coopId = searchParams.get('coop')
  const activeTab = searchParams.get('tab') ?? 'geral'
  const selected = (coopId ? all.find((c) => c.id === coopId) : null) ?? all[0]

  const filtered = all.filter((c) => {
    if (search.trim() && !c.name.toLowerCase().includes(search.toLowerCase()))
      return false
    if (statusFilters.length < 3 && !statusFilters.includes(c.status))
      return false
    return true
  })

  const selectCoop = (id: string, tab = 'geral') =>
    setSearchParams({ coop: id, tab })

  const changeTab = (tab: string) => {
    if (selected) setSearchParams({ coop: selected.id, tab })
  }

  const clearSelection = () => setSearchParams({})

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
      <aside
        className={cn(
          'flex-col gap-3',
          coopId ? 'hidden lg:flex' : 'flex',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[15px] font-semibold text-foreground">
            Cooperativas
          </h2>
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            Nova
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cooperativa..."
            className="pl-9 text-sm"
          />
        </div>

        <StatusFilterChips
          minOne
          options={[
            { value: 'active', label: 'Ativa' },
            { value: 'suspended', label: 'Suspensa' },
            { value: 'inactive', label: 'Inativa' },
          ]}
          value={statusFilters}
          onChange={setStatusFilters}
        />

        <div className="flex flex-col gap-1.5">
          {filtered.length === 0 ? (
            <p className="px-1 py-6 text-center text-[13px] text-muted-foreground">
              Nenhuma cooperativa encontrada.
            </p>
          ) : (
            filtered.map((c) => {
              const isActive = selected?.id === c.id
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectCoop(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      selectCoop(c.id)
                    }
                  }}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg border border-l-2 px-3 py-2.5 transition-colors',
                    isActive
                      ? 'border-border border-l-primary bg-accent/40'
                      : 'border-transparent border-l-transparent hover:bg-accent/30',
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: c.brandColor }}
                  >
                    {getInitials(c.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.routeCount} rotas • {c.driverCount} motoristas
                    </p>
                  </div>
                  <AdminActionMenu
                    items={[
                      {
                        label: 'Ver perfil público',
                        icon: ExternalLink,
                        onClick: () => navigate(`/cooperatives/${c.id}`),
                      },
                      {
                        label: 'Editar',
                        icon: Pencil,
                        onClick: () => openEdit(c),
                      },
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
                              label: 'Desativar',
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
        ) : (
          <AdminEmptyState
            icon={Users}
            title="Nenhuma cooperativa cadastrada"
            description="Cadastre a primeira cooperativa da plataforma."
            action={{ label: 'Nova cooperativa', onClick: openCreate, icon: Plus }}
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
      />

      <AdminConfirmDialog
        open={!!suspendCoop}
        onOpenChange={(open) => {
          if (!open) setSuspendCoop(null)
        }}
        title="Suspender cooperativa"
        description={`A cooperativa "${suspendCoop?.name}" será suspensa temporariamente. Suas ${suspendCoop?.routeCount} rotas ficarão indisponíveis até a reativação.`}
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
        title="Desativar cooperativa"
        description={`Esta ação vai desativar a cooperativa "${deactivateCoop?.name}". Confirme para prosseguir.`}
        confirmLabel="Desativar"
        variant="danger"
        consequencesTitle="O que será afetado"
        consequences={[
          `${deactivateCoop?.routeCount ?? 0} rota(s) ativa(s) ficarão indisponíveis`,
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
          toast.success(`Cooperativa "${deactivateCoop.name}" desativada`)
          setDeactivateCoop(null)
        }}
      />
    </div>
  )
}
