import {
  MapPin,
  MapPinOff,
  Pencil,
  Plus,
  RotateCcw,
  Route,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminPagination,
  AdminTable,
  type AdminTableColumn,
  StatusFilterChips,
} from '@/components/admin'
import { StatusChip } from '@/components/status-chip'
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
import { useFormDialogState } from '@/hooks/use-form-dialog-state'
import { useTableFilters } from '@/hooks/use-table-filters'
import {
  useAdminCities,
  useCityStats,
  useCreateCity,
  useToggleCityStatus,
  useUpdateCity,
} from '@/lib/api/mock-cities-api'
import type { AdminCity } from '@/lib/data/mock-admin-cities'
import { ROUTE_STATUS_META } from '@/lib/status/status-meta'

const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
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

  // Sincroniza os campos quando o dialog abre (inclui aberturas programáticas).
  useFormDialogState(open, city, (c) => {
    setName(c?.name ?? '')
    setState(c?.state ?? 'CE')
  })

  function handleOpen(value: boolean) {
    onOpenChange(value)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (isEdit && city) {
        await updateCity.mutateAsync({
          id: city.id,
          payload: { name: name.trim(), state },
        })
        toast.success(`Cidade "${name}" atualizada`)
      } else {
        await createCity.mutateAsync({ name: name.trim(), state })
        toast.success(`Cidade "${name}" criada`)
      }
      handleOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado',
      )
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
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
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

const CITY_FILTER_DEFAULTS = {
  search: '',
  status: ['active', 'inactive'] as string[],
}

const PAGE_SIZE = 20

export function AdminCitiesPage() {
  const { filters, setFilter, reset, page, setPage } = useTableFilters({
    defaults: CITY_FILTER_DEFAULTS,
  })
  const { search, status: statusFilters } = filters

  const [formOpen, setFormOpen] = useState(false)
  const [editCity, setEditCity] = useState<AdminCity | null>(null)
  const [deactivateCity, setDeactivateCity] = useState<AdminCity | null>(null)
  const [reactivateCity, setReactivateCity] = useState<AdminCity | null>(null)

  const activeStatus =
    statusFilters.length === 2
      ? ''
      : (statusFilters[0] as 'active' | 'inactive' | '')

  const { data, isLoading } = useAdminCities({
    search,
    status: activeStatus,
    // hook é 0-indexed; a API de cidades é 1-indexed
    page: page + 1,
    pageSize: PAGE_SIZE,
  })

  const { data: stats } = useCityStats()

  const toggleStatus = useToggleCityStatus()

  const kpiStats = {
    total: stats?.total ?? 0,
    withRoutes: stats?.withRoutes ?? 0,
    inactive: stats?.inactive ?? 0,
  }

  const hasFilters = Boolean(search.trim()) || statusFilters.length !== 2

  const columns: AdminTableColumn<AdminCity>[] = [
    {
      key: 'name',
      label: 'Nome',
      render: (c) => (
        <span className="text-foreground font-medium">{c.name}</span>
      ),
    },
    {
      key: 'state',
      label: 'Estado',
      width: '80px',
      render: (c) => (
        <span className="text-muted-foreground font-mono text-[12px]">
          {c.state}
        </span>
      ),
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
      render: (c) => <StatusChip {...ROUTE_STATUS_META[c.status]} />,
    },
    {
      key: 'actions',
      label: '',
      width: '48px',
      align: 'right',
      render: (c) => (
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
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
        </div>
      ),
    },
  ]

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminKPICard
          label="Total de cidades"
          value={kpiStats.total}
          helper="cadastradas na plataforma"
          icon={MapPin}
        />
        <AdminKPICard
          label="Com rotas ativas"
          value={kpiStats.withRoutes}
          helper="atualmente atendidas"
          icon={Route}
        />
        <AdminKPICard
          label="Inativas"
          value={kpiStats.inactive}
          helper="sem operação"
          icon={MapPinOff}
        />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => setFilter('search', v)}
        searchPlaceholder="Buscar cidade por nome"
        filters={
          <StatusFilterChips
            minOne
            options={[
              { value: 'active', label: 'Ativa' },
              { value: 'inactive', label: 'Inativa' },
            ]}
            value={statusFilters}
            onChange={(v) => setFilter('status', v)}
          />
        }
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditCity(null)
              setFormOpen(true)
            }}
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
        onRowClick={(c) => {
          setEditCity(c)
          setFormOpen(true)
        }}
        emptyState={
          <AdminEmptyState
            icon={MapPin}
            title={
              hasFilters
                ? 'Nenhuma cidade corresponde aos filtros'
                : 'Nenhuma cidade cadastrada'
            }
            description={
              hasFilters
                ? 'Ajuste os filtros para ver as cidades.'
                : 'Comece cadastrando as cidades atendidas pela plataforma.'
            }
            action={
              hasFilters
                ? {
                    label: 'Limpar filtros',
                    onClick: reset,
                    icon: X,
                  }
                : {
                    label: 'Nova cidade',
                    onClick: () => {
                      setEditCity(null)
                      setFormOpen(true)
                    },
                    icon: Plus,
                  }
            }
          />
        }
      />

      <AdminPagination
        page={page}
        perPage={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
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
        onOpenChange={(open) => {
          if (!open) setDeactivateCity(null)
        }}
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
          await toggleStatus.mutateAsync({
            id: deactivateCity.id,
            newStatus: 'inactive',
          })
          toast.success(`Cidade "${deactivateCity.name}" desativada`)
          setDeactivateCity(null)
        }}
      />

      <AdminConfirmDialog
        open={!!reactivateCity}
        onOpenChange={(open) => {
          if (!open) setReactivateCity(null)
        }}
        title="Reativar cidade"
        description={`A cidade "${reactivateCity?.name}" voltará a aparecer como opção em novas rotas.`}
        confirmLabel="Reativar"
        variant="default"
        onConfirm={async () => {
          if (!reactivateCity) return
          await toggleStatus.mutateAsync({
            id: reactivateCity.id,
            newStatus: 'active',
          })
          toast.success(`Cidade "${reactivateCity.name}" reativada`)
          setReactivateCity(null)
        }}
      />
    </section>
  )
}
