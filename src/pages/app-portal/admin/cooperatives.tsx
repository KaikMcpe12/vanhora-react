import { ExternalLink, Pencil, Plus, RotateCcw, Route, Star, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminSectionTitle,
  AdminStatusBadge,
  AdminTable,
  StatusFilterChips,
  type AdminTableColumn,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  useAdminCooperatives,
  useCreateCooperative,
  useToggleCooperativeStatus,
  useUpdateCooperative,
  type CreateCooperativePayload,
} from '@/lib/api/mock-cooperatives-api'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function cooperativeStatusBadge(status: AdminCooperative['status']) {
  if (status === 'active') return { variant: 'success' as const, label: 'Ativa' }
  if (status === 'suspended') return { variant: 'attention' as const, label: 'Suspensa' }
  return { variant: 'neutral' as const, label: 'Inativa' }
}

interface CooperativeFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cooperative?: AdminCooperative | null
}

function CooperativeFormDrawer({
  open,
  onOpenChange,
  cooperative,
}: CooperativeFormDrawerProps) {
  const isEdit = !!cooperative
  const [form, setForm] = useState<CreateCooperativePayload>({
    name: cooperative?.name ?? '',
    phone: cooperative?.phone ?? '',
    site: cooperative?.site ?? '',
    logoUrl: cooperative?.logoUrl ?? '',
    brandColor: cooperative?.brandColor ?? '#1A5FA8',
    description: cooperative?.description ?? '',
  })

  const createCoop = useCreateCooperative()
  const updateCoop = useUpdateCooperative()

  function handleOpen(value: boolean) {
    if (value && cooperative) {
      setForm({
        name: cooperative.name,
        phone: cooperative.phone,
        site: cooperative.site ?? '',
        logoUrl: cooperative.logoUrl ?? '',
        brandColor: cooperative.brandColor,
        description: cooperative.description ?? '',
      })
    }
    onOpenChange(value)
  }

  function setField<K extends keyof CreateCooperativePayload>(
    key: K,
    value: CreateCooperativePayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return

    try {
      if (isEdit && cooperative) {
        await updateCoop.mutateAsync({ id: cooperative.id, payload: form })
        toast.success(`Cooperativa "${form.name}" atualizada`)
      } else {
        await createCoop.mutateAsync(form)
        toast.success(`Cooperativa "${form.name}" criada`)
      }
      handleOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    }
  }

  const isPending = createCoop.isPending || updateCoop.isPending

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-[15px] font-medium">
            {isEdit ? 'Editar cooperativa' : 'Nova cooperativa'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 overflow-y-auto py-4">
          <div className="space-y-4">
            <AdminSectionTitle title="Identificação" />
            <div className="space-y-1.5">
              <Label className="text-[13px]">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ex: Cooperativa Nordeste"
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Cor da marca</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.brandColor}
                  onChange={(e) => setField('brandColor', e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-md border border-border p-0.5"
                />
                <Input
                  value={form.brandColor}
                  onChange={(e) => setField('brandColor', e.target.value)}
                  placeholder="#1A5FA8"
                  className="font-mono text-sm"
                  maxLength={7}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Descrição (opcional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Breve descrição da cooperativa..."
                className="resize-none text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <AdminSectionTitle title="Contato" />
            <div className="space-y-1.5">
              <Label className="text-[13px]">Telefone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="(85) 3234-5678"
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Site (opcional)</Label>
              <Input
                value={form.site}
                onChange={(e) => setField('site', e.target.value)}
                placeholder="https://..."
                type="url"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">URL do logotipo (opcional)</Label>
              <Input
                value={form.logoUrl}
                onChange={(e) => setField('logoUrl', e.target.value)}
                placeholder="https://..."
                className="text-sm"
              />
            </div>
          </div>
        </form>

        <SheetFooter className="border-t border-border pt-4">
          <Button
            variant="ghost"
            onClick={() => handleOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={isPending || !form.name.trim() || !form.phone.trim()}
          >
            {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function AdminCooperativesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(['active', 'suspended', 'inactive'])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editCoop, setEditCoop] = useState<AdminCooperative | null>(null)
  const [deactivateCoop, setDeactivateCoop] = useState<AdminCooperative | null>(null)
  const [suspendCoop, setSuspendCoop] = useState<AdminCooperative | null>(null)

  const activeStatus = statusFilters.length === 3 ? '' : statusFilters[0]

  const { data, isLoading } = useAdminCooperatives({
    search,
    status: activeStatus,
  })

  const toggleStatus = useToggleCooperativeStatus()

  const kpiStats = useMemo(() => {
    const all = data?.data ?? []
    const active = all.filter((c) => c.status === 'active')
    const totalRoutes = active.reduce((sum, c) => sum + c.routeCount, 0)
    return {
      activeCount: active.length,
      totalRoutes,
      avgRating: data?.avgRating ?? 0,
    }
  }, [data])

  const hasFilters = Boolean(search.trim()) || statusFilters.length !== 3

  const columns: AdminTableColumn<AdminCooperative>[] = [
    {
      key: 'name',
      label: 'Cooperativa',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: c.brandColor }}
          >
            {getInitials(c.name)}
          </span>
          <span className="font-medium text-foreground">{c.name}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contato',
      render: (c) => <span className="text-[13px] text-muted-foreground">{c.phone}</span>,
    },
    {
      key: 'routes',
      label: 'Rotas',
      width: '80px',
      align: 'right',
      render: (c) => <span className="text-[13px]">{c.routeCount}</span>,
    },
    {
      key: 'drivers',
      label: 'Motoristas',
      width: '100px',
      align: 'right',
      render: (c) => <span className="text-[13px]">{c.driverCount}</span>,
    },
    {
      key: 'rating',
      label: 'Avaliação',
      width: '130px',
      render: (c) =>
        c.reviewCount > 0 ? (
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-[13px]">{c.rating.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground">({c.reviewCount})</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-[12px]">—</span>
        ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (c) => <AdminStatusBadge {...cooperativeStatusBadge(c.status)} />,
    },
    {
      key: 'actions',
      label: '',
      width: '48px',
      align: 'right',
      render: (c) => (
        <AdminActionMenu
          items={[
            {
              label: 'Ver perfil público',
              icon: ExternalLink,
              onClick: () => navigate(`/cooperatives/${c.id}`),
            },
            {
              label: 'Ver rotas',
              icon: Route,
              onClick: () => navigate('/admin/routes'),
            },
            {
              label: 'Ver motoristas',
              icon: Users,
              onClick: () => navigate('/admin/users'),
            },
            {
              label: 'Editar',
              icon: Pencil,
              onClick: () => {
                setEditCoop(c)
                setDrawerOpen(true)
              },
            },
            { divider: true, label: '', onClick: () => {} },
            c.status === 'active'
              ? {
                  label: 'Suspender',
                  icon: X,
                  onClick: () => setSuspendCoop(c),
                  variant: 'danger' as const,
                }
              : {
                  label: 'Reativar',
                  icon: RotateCcw,
                  onClick: async () => {
                    await toggleStatus.mutateAsync({ id: c.id, newStatus: 'active' })
                    toast.success(`Cooperativa "${c.name}" reativada`)
                  },
                },
            ...(c.status !== 'inactive'
              ? []
              : []),
            ...(c.status === 'active'
              ? [
                  {
                    label: 'Desativar definitivamente',
                    icon: X,
                    onClick: () => setDeactivateCoop(c),
                    variant: 'danger' as const,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKPICard
          label="Cooperativas ativas"
          value={kpiStats.activeCount}
          helper="em operação regular"
        />
        <AdminKPICard
          label="Total de rotas"
          value={kpiStats.totalRoutes}
          helper="das cooperativas ativas"
        />
        <AdminKPICard
          label="Avaliação média"
          value={kpiStats.avgRating > 0 ? kpiStats.avgRating.toFixed(1) : '—'}
          helper="das cooperativas ativas"
        />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => setSearch(v)}
        searchPlaceholder="Buscar cooperativa por nome"
        filters={
          <StatusFilterChips
            options={[
              { value: 'active', label: 'Ativa' },
              { value: 'suspended', label: 'Suspensa' },
              { value: 'inactive', label: 'Inativa' },
            ]}
            value={statusFilters}
            onChange={setStatusFilters}
          />
        }
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setEditCoop(null); setDrawerOpen(true) }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova cooperativa
          </Button>
        }
      />

      <AdminTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyState={
          <AdminEmptyState
            icon={Users}
            title={hasFilters ? 'Nenhuma cooperativa corresponde aos filtros' : 'Nenhuma cooperativa cadastrada'}
            description={
              hasFilters
                ? 'Ajuste os filtros para ver as cooperativas.'
                : 'Cadastre a primeira cooperativa da plataforma.'
            }
            action={
              hasFilters
                ? { label: 'Limpar filtros', onClick: () => { setSearch(''); setStatusFilters(['active', 'suspended', 'inactive']) }, icon: X }
                : { label: 'Nova cooperativa', onClick: () => { setEditCoop(null); setDrawerOpen(true) }, icon: Plus }
            }
          />
        }
      />

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
        onOpenChange={(open) => { if (!open) setSuspendCoop(null) }}
        title="Suspender cooperativa"
        description={`A cooperativa "${suspendCoop?.name}" será suspensa temporariamente. Suas ${suspendCoop?.routeCount} rotas ficarão indisponíveis até a reativação.`}
        confirmLabel="Suspender"
        variant="danger"
        onConfirm={async () => {
          if (!suspendCoop) return
          await toggleStatus.mutateAsync({ id: suspendCoop.id, newStatus: 'suspended' })
          toast.success(`Cooperativa "${suspendCoop.name}" suspensa`)
          setSuspendCoop(null)
        }}
      />

      <AdminConfirmDialog
        open={!!deactivateCoop}
        onOpenChange={(open) => { if (!open) setDeactivateCoop(null) }}
        title="Desativar cooperativa"
        description={`Esta ação vai desativar a cooperativa "${deactivateCoop?.name}" e todas as suas ${deactivateCoop?.routeCount} rotas ativas. Passageiros não conseguirão mais ver horários dessa cooperativa. Motoristas associados perderão acesso.`}
        confirmLabel="Desativar"
        variant="danger"
        requireTypedConfirmation={{
          expectedText: deactivateCoop?.name ?? '',
          label: 'Digite o nome da cooperativa para confirmar',
        }}
        onConfirm={async () => {
          if (!deactivateCoop) return
          await toggleStatus.mutateAsync({ id: deactivateCoop.id, newStatus: 'inactive' })
          toast.success(`Cooperativa "${deactivateCoop.name}" desativada`)
          setDeactivateCoop(null)
        }}
      />
    </section>
  )
}
