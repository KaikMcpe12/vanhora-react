import { MapPin, Pencil, Plus, RotateCcw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminStatusBadge,
  AdminTable,
  StatusFilterChips,
  type AdminTableColumn,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useAdminCities,
  useCreateCity,
  useToggleCityStatus,
  useUpdateCity,
} from '@/lib/api/mock-cities-api'
import type { AdminCity } from '@/lib/data/mock-admin-cities'

const UF_OPTIONS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

interface CityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  city?: AdminCity | null
}

function CityFormDialog({ open, onOpenChange, city }: CityFormDialogProps) {
  const isEdit = !!city
  const [name, setName] = useState(city?.name ?? '')
  const [state, setState] = useState(city?.state ?? 'CE')

  const createCity = useCreateCity()
  const updateCity = useUpdateCity()

  function handleOpen(value: boolean) {
    if (value) {
      setName(city?.name ?? '')
      setState(city?.state ?? 'CE')
    }
    onOpenChange(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (isEdit && city) {
        await updateCity.mutateAsync({ id: city.id, payload: { name: name.trim(), state } })
        toast.success(`Cidade "${name}" atualizada`)
      } else {
        await createCity.mutateAsync({ name: name.trim(), state })
        toast.success(`Cidade "${name}" criada`)
      }
      handleOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    }
  }

  const isPending = createCity.isPending || updateCity.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">
            {isEdit ? 'Editar cidade' : 'Nova cidade'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px]">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sobral"
              required
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Estado</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AdminCitiesPage() {
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(['active', 'inactive'])
  const [currentPage, setCurrentPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editCity, setEditCity] = useState<AdminCity | null>(null)
  const [deactivateCity, setDeactivateCity] = useState<AdminCity | null>(null)
  const [reactivateCity, setReactivateCity] = useState<AdminCity | null>(null)

  const activeStatus =
    statusFilters.length === 2 ? '' : (statusFilters[0] as 'active' | 'inactive' | '')

  const { data, isLoading } = useAdminCities({
    search,
    status: activeStatus,
    page: currentPage,
    pageSize: 20,
  })

  const toggleStatus = useToggleCityStatus()

  const kpiStats = useMemo(() => {
    const all = data?.data ?? []
    return {
      total: data?.total ?? 0,
      withRoutes: all.filter((c) => c.routeCount > 0).length,
      inactive: all.filter((c) => c.status === 'inactive').length,
    }
  }, [data])

  const hasFilters = Boolean(search.trim()) || statusFilters.length !== 2

  const columns: AdminTableColumn<AdminCity>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (c) => <span className="font-medium text-foreground">{c.name}</span>,
    },
    {
      key: 'state',
      label: 'Estado',
      width: '80px',
      render: (c) => <span className="font-mono text-[12px] text-muted-foreground">{c.state}</span>,
    },
    {
      key: 'routeCount',
      label: 'Rotas',
      width: '100px',
      align: 'right',
      render: (c) => <span className="text-[13px]">{c.routeCount}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (c) => (
        <AdminStatusBadge
          variant={c.status === 'active' ? 'success' : 'neutral'}
          label={c.status === 'active' ? 'Ativa' : 'Inativa'}
        />
      ),
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
              label: 'Editar',
              icon: Pencil,
              onClick: () => {
                setEditCity(c)
                setFormOpen(true)
              },
            },
            { divider: true, label: '', onClick: () => {} },
            c.status === 'active'
              ? {
                  label: 'Desativar',
                  icon: X,
                  onClick: () => setDeactivateCity(c),
                  variant: 'danger' as const,
                }
              : {
                  label: 'Reativar',
                  icon: RotateCcw,
                  onClick: () => setReactivateCity(c),
                },
          ]}
        />
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKPICard label="Total de cidades" value={kpiStats.total} helper="cadastradas na plataforma" />
        <AdminKPICard label="Com rotas ativas" value={kpiStats.withRoutes} helper="atualmente atendidas" />
        <AdminKPICard label="Inativas" value={kpiStats.inactive} helper="sem operação" />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1) }}
        searchPlaceholder="Buscar cidade por nome"
        filters={
          <StatusFilterChips
            options={[
              { value: 'active', label: 'Ativa' },
              { value: 'inactive', label: 'Inativa' },
            ]}
            value={statusFilters}
            onChange={(v) => { setStatusFilters(v); setCurrentPage(1) }}
          />
        }
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => { setEditCity(null); setFormOpen(true) }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova cidade
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
            icon={MapPin}
            title={hasFilters ? 'Nenhuma cidade corresponde aos filtros' : 'Nenhuma cidade cadastrada'}
            description={
              hasFilters
                ? 'Ajuste os filtros para ver as cidades.'
                : 'Comece cadastrando as cidades atendidas pela plataforma.'
            }
            action={
              hasFilters
                ? { label: 'Limpar filtros', onClick: () => { setSearch(''); setStatusFilters(['active', 'inactive']) }, icon: X }
                : { label: 'Nova cidade', onClick: () => { setEditCity(null); setFormOpen(true) }, icon: Plus }
            }
          />
        }
      />

      <CityFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditCity(null)
        }}
        city={editCity}
      />

      <AdminConfirmDialog
        open={!!deactivateCity}
        onOpenChange={(open) => { if (!open) setDeactivateCity(null) }}
        title="Desativar cidade"
        description={
          deactivateCity?.routeCount
            ? `A cidade "${deactivateCity.name}" é usada em ${deactivateCity.routeCount} rota(s). Desativá-la não afeta rotas existentes, mas ela não aparecerá em novas rotas.`
            : `A cidade "${deactivateCity?.name}" será desativada e não aparecerá em novas rotas.`
        }
        confirmLabel="Desativar"
        variant="danger"
        requireTypedConfirmation={{
          expectedText: deactivateCity?.name ?? '',
          label: 'Digite o nome da cidade para confirmar',
        }}
        onConfirm={async () => {
          if (!deactivateCity) return
          await toggleStatus.mutateAsync({ id: deactivateCity.id, newStatus: 'inactive' })
          toast.success(`Cidade "${deactivateCity.name}" desativada`)
          setDeactivateCity(null)
        }}
      />

      <AdminConfirmDialog
        open={!!reactivateCity}
        onOpenChange={(open) => { if (!open) setReactivateCity(null) }}
        title="Reativar cidade"
        description={`A cidade "${reactivateCity?.name}" voltará a aparecer como opção em novas rotas.`}
        confirmLabel="Reativar"
        variant="default"
        onConfirm={async () => {
          if (!reactivateCity) return
          await toggleStatus.mutateAsync({ id: reactivateCity.id, newStatus: 'active' })
          toast.success(`Cidade "${reactivateCity.name}" reativada`)
          setReactivateCity(null)
        }}
      />
    </section>
  )
}
