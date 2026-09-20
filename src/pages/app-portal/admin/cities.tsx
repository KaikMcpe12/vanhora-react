import { zodResolver } from '@hookform/resolvers/zod'
import {
  MapPin,
  MapPinOff,
  Pencil,
  Plus,
  RotateCcw,
  Route,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
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
  CityConflictError,
  CityInUseError,
  useAdminCities,
  useCityStats,
  useCreateCity,
  useDeleteCity,
  useToggleCityStatus,
  useUpdateCity,
} from '@/lib/api/mock-cities-api'
import type { AdminCity } from '@/lib/data/mock-admin-cities'
import {
  cityFormSchema,
  type CityFormValues,
  UF_OPTIONS,
} from '@/lib/schemas/city-schema'
import { ROUTE_STATUS_META } from '@/lib/status/status-meta'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

interface CityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  city?: AdminCity | null
}

function CityFormDialog({ open, onOpenChange, city }: CityFormDialogProps) {
  const isEdit = !!city

  const createCity = useCreateCity()
  const updateCity = useUpdateCity()

  const {
    control,
    handleSubmit,
    register,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CityFormValues>({
    // Refaz o schema por render para pegar o snapshot atual do mock e o id
    // a ignorar na checagem de duplicata (edição da própria cidade).
    resolver: zodResolver(cityFormSchema(city?.id)),
    mode: 'onBlur',
    defaultValues: {
      name: city?.name ?? '',
      state: (city?.state ?? 'CE') as CityFormValues['state'],
    },
  })

  useFormDialogState(open, city, (c) =>
    reset({
      name: c?.name ?? '',
      state: (c?.state ?? 'CE') as CityFormValues['state'],
    }),
  )

  const submit = handleSubmit(async (values) => {
    try {
      if (isEdit && city) {
        await updateCity.mutateAsync({
          id: city.id,
          payload: { name: values.name.trim(), state: values.state },
        })
        toast.success(`Cidade "${values.name}" atualizada`)
      } else {
        await createCity.mutateAsync({
          name: values.name.trim(),
          state: values.state,
        })
        toast.success(`Cidade "${values.name}" criada`)
      }
      onOpenChange(false)
    } catch (err) {
      // Fallback: schema pega quase todos os duplicates, mas se o mock mudar
      // entre validação e submit, replica o erro do back inline.
      if (err instanceof CityConflictError) {
        setError('name', { type: 'server', message: err.message })
      } else {
        toast.error(
          err instanceof Error ? err.message : 'Ocorreu um erro inesperado',
        )
      }
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">
            {isEdit ? 'Editar cidade' : 'Nova cidade'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="city-name" className="text-[13px]">
              Nome
            </Label>
            <Input
              id="city-name"
              {...register('name')}
              placeholder="Ex: Sobral"
              aria-invalid={!!errors.name}
              className="text-sm"
            />
            {errors.name && (
              <p className="text-destructive text-[12px]">
                {errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Estado</Label>
            <Controller
              control={control}
              name="state"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="text-sm"
                    aria-invalid={!!errors.state}
                  >
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
              )}
            />
            {errors.state && (
              <p className="text-destructive text-[12px]">
                {errors.state.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
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

type SortKey = 'name' | 'routeCount'
type SortDirection = 'asc' | 'desc'

export function AdminCitiesPage() {
  const navigate = useNavigate()
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const [searchParams, setSearchParams] = useSearchParams()

  const { filters, setFilter, reset, page, setPage } = useTableFilters({
    defaults: CITY_FILTER_DEFAULTS,
  })
  const { search, status: statusFilters } = filters

  // Debounce 300ms na busca — segura o input digitando sem hammer no endpoint.
  const [searchInput, setSearchInput] = useState(search)
  useEffect(() => {
    setSearchInput(search)
  }, [search])
  useEffect(() => {
    if (searchInput === search) return
    const t = setTimeout(() => setFilter('search', searchInput), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const [formOpen, setFormOpen] = useState(false)
  const [editCity, setEditCity] = useState<AdminCity | null>(null)
  const [deactivateCity, setDeactivateCity] = useState<AdminCity | null>(null)
  const [reactivateCity, setReactivateCity] = useState<AdminCity | null>(null)
  const [deleteCity, setDeleteCity] = useState<AdminCity | null>(null)
  const [sortState, setSortState] = useState<
    { key: SortKey; direction: SortDirection } | undefined
  >(undefined)

  const activeStatus =
    statusFilters.length === 2
      ? ''
      : (statusFilters[0] as 'active' | 'inactive' | '')

  const { data, isLoading } = useAdminCities({
    search,
    status: activeStatus,
    page: page + 1,
    pageSize: PAGE_SIZE,
  })

  const { data: stats } = useCityStats()

  const toggleStatus = useToggleCityStatus()
  const deleteCityMutation = useDeleteCity()

  const kpiStats = {
    total: stats?.total ?? 0,
    withRoutes: stats?.withRoutes ?? 0,
    inactive: stats?.inactive ?? 0,
  }

  const hasFilters = Boolean(search.trim()) || statusFilters.length !== 2

  const sortedCities = useMemo(() => {
    const rows = data?.data ?? []
    if (!sortState) return rows
    const { key, direction } = sortState
    return [...rows].sort((a, b) => {
      let ax: string | number = ''
      let bx: string | number = ''
      if (key === 'name') {
        ax = a.name.toLowerCase()
        bx = b.name.toLowerCase()
      } else if (key === 'routeCount') {
        ax = a.routeCount
        bx = b.routeCount
      }
      if (ax === bx) return 0
      const cmp = ax < bx ? -1 : 1
      return direction === 'asc' ? cmp : -cmp
    })
  }, [data?.data, sortState])

  const handleSort = (key: string) => {
    if (key !== 'name' && key !== 'routeCount') return
    setSortState((s) => {
      if (!s || s.key !== key) return { key, direction: 'asc' }
      if (s.direction === 'asc') return { key, direction: 'desc' }
      return undefined
    })
  }

  // Deep-link ?highlight=<uuid>: pulse na linha alvo + limpa param.
  // Silencia se o id não existir no dataset atual.
  const highlightParam = searchParams.get('highlight')
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!highlightParam) return
    const exists = (data?.data ?? []).some((c) => c.id === highlightParam)
    setSearchParams(
      (p) => {
        p.delete('highlight')
        return p
      },
      { replace: true },
    )
    if (!exists) return
    setHighlightId(highlightParam)
    highlightTimer.current = setTimeout(() => setHighlightId(null), 1600)
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightParam, data?.data])

  useEffect(() => {
    if (!highlightId) return
    const el = document.getElementById(`city-${highlightId}`)
    if (!el) return
    const raf = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => cancelAnimationFrame(raf)
  }, [highlightId])

  const columns: AdminTableColumn<AdminCity>[] = [
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
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
      sortable: true,
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
              {
                label: 'Excluir',
                icon: Trash2,
                onClick: () => setDeleteCity(c),
                variant: 'danger' as const,
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const deleteBlocked = deleteCity ? deleteCity.routeCount > 0 : false

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
        searchValue={searchInput}
        onSearchChange={setSearchInput}
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
        data={sortedCities}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        sortState={sortState}
        onSort={handleSort}
        getRowAttrs={(c) => ({
          id: `city-${c.id}`,
          'data-highlight': String(highlightId === c.id),
        })}
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

      {/* Desativar — mantém como toggle de status (reversível). */}
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
        tone="warning"
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

      {/* Excluir — irreversível. Bloqueia quando há vínculo com rotas (422
          CITY_IN_USE); sem vínculo, exige typed confirmation. */}
      {deleteCity && deleteBlocked ? (
        <BlockedDeleteDialog
          city={deleteCity}
          onClose={() => setDeleteCity(null)}
          onGoToRoutes={() => {
            navigate(
              `${basePath}/routes?search=${encodeURIComponent(deleteCity.name)}`,
            )
            setDeleteCity(null)
          }}
        />
      ) : (
        <AdminConfirmDialog
          open={!!deleteCity}
          onOpenChange={(open) => {
            if (!open) setDeleteCity(null)
          }}
          title="Excluir cidade"
          description={`Esta ação exclui permanentemente a cidade "${deleteCity?.name}". Não é possível desfazer.`}
          confirmLabel="Excluir cidade"
          variant="danger"
          tone="danger"
          icon={Trash2}
          consequences={[
            'A cidade some das opções de novas rotas e cadastros.',
            'Registros históricos que referenciam o nome permanecem, mas sem link.',
            'Para restabelecer, será preciso recriar a cidade.',
          ]}
          requireTypedConfirmation={{
            expectedText: deleteCity?.name ?? '',
            label: 'Digite o nome da cidade para confirmar',
          }}
          onConfirm={async () => {
            if (!deleteCity) return
            try {
              await deleteCityMutation.mutateAsync(deleteCity.id)
              toast.success(`Cidade "${deleteCity.name}" excluída`)
              setDeleteCity(null)
            } catch (err) {
              if (err instanceof CityInUseError) {
                // Race — vinculada entre abrir dialog e confirmar. Fecha e
                // abre o modo bloqueado.
                toast.error(err.message)
              } else {
                toast.error(
                  err instanceof Error ? err.message : 'Erro ao excluir',
                )
              }
            }
          }}
        />
      )}
    </section>
  )
}

interface BlockedDeleteDialogProps {
  city: AdminCity
  onClose: () => void
  onGoToRoutes: () => void
}

/**
 * AdminConfirmDialog em "modo bloqueado" — cidade não pode ser excluída
 * porque tem vínculo com rotas (CITY_IN_USE / 422). Sem typed confirmation;
 * apenas explica e oferece atalho para as rotas afetadas.
 */
function BlockedDeleteDialog({
  city,
  onClose,
  onGoToRoutes,
}: BlockedDeleteDialogProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-medium">
            Não é possível excluir "{city.name}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-[13px]">
          <p className="text-foreground">
            Esta cidade está vinculada a{' '}
            <strong>
              {city.routeCount} rota{city.routeCount > 1 ? 's' : ''}
            </strong>
            . Remova as rotas antes de excluir a cidade.
          </p>
          <div className="border-border bg-muted/40 rounded-lg border border-l-4 border-l-amber-500 p-3">
            <p className="text-foreground text-[12px] font-semibold">
              Alternativa
            </p>
            <p className="text-muted-foreground mt-0.5 text-[12px]">
              Se a cidade não deve mais aparecer em novas rotas, use{' '}
              <strong>Desativar</strong> em vez de excluir.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="default" onClick={onGoToRoutes}>
            Ver rotas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
