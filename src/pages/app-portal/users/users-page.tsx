import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  AdminActionMenu,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminFilterBar,
  AdminKPICard,
  AdminStatusBadge,
  AdminTable,
  type AdminTableColumn,
  StatusFilterChips,
} from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { mockUsersApi } from '@/lib/api/mock-users-api'
import type { User } from '@/lib/data/mock-users'
import { MOCK_COOPERATIVES } from '@/lib/data/mock-users'
import { queryKeys } from '@/lib/query-keys'
import {
  type AppPortalRole,
  type AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

import { AddUserModal } from './add-user-modal'
import { DriverSchedulesModal } from './driver-schedules-modal'
import { EditUserModal } from './edit-user-modal'
import { UserAvatar } from './user-avatar'
import { ViewUserModal } from './view-user-modal'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

type UserStatus = 'active' | 'inactive'
type UserRole = 'admin' | 'cooperative' | 'driver'

const ALL_STATUSES: UserStatus[] = ['active', 'inactive']
const PAGE_SIZE = 10

function roleToBadge(role: UserRole) {
  if (role === 'admin') return { variant: 'info' as const, label: 'Administrador' }
  if (role === 'cooperative') return { variant: 'success' as const, label: 'Cooperativa' }
  return { variant: 'attention' as const, label: 'Motorista' }
}

export function UsersPage() {
  const { role, user: loggedInUser } = useOutletContext<AppPortalOutletContext>()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<string[]>(ALL_STATUSES)
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedCooperative, setSelectedCooperative] = useState<string>(
    () => searchParams.get('cooperative') ?? '',
  )
  const [currentPage, setCurrentPage] = useState(1)

  const setCooperativeFilter = (value: string) => {
    setSelectedCooperative(value)
    setCurrentPage(1)
    if (!value) {
      searchParams.delete('cooperative')
      setSearchParams(searchParams)
    }
  }
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null)
  const [selectedUserForSchedules, setSelectedUserForSchedules] = useState<User | null>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false)

  const loggedInUserId = loggedInUser.email.replace('@', '_').split('.')[0]
  const loggedInCooperativeId = role === 'cooperative' ? 'coop-metro' : undefined

  const activeStatusFilter = statusFilters.length === ALL_STATUSES.length
    ? undefined
    : (statusFilters[0] as UserStatus | undefined)

  const activeRoleFilter = roleFilter === 'all' ? undefined : roleFilter as UserRole

  const { data: usersData, isLoading } = useQuery({
    queryKey: queryKeys.users.list({
      search,
      statusFilters,
      roleFilter,
      selectedCooperative,
      currentPage,
      role,
      loggedInUserId,
    }),
    queryFn: () =>
      mockUsersApi.listUsers(
        {
          search: search || undefined,
          status: activeStatusFilter,
          role: activeRoleFilter,
          cooperativeId: selectedCooperative || undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        },
        loggedInUserId,
        role as 'admin' | 'cooperative',
        loggedInCooperativeId,
      ),
  })

  const { mutate: toggleStatus, mutateAsync: toggleStatusAsync } = useMutation({
    mutationFn: (payload: { userId: string; newStatus: UserStatus }) =>
      mockUsersApi.toggleUserStatus(payload),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
      if (user) {
        const action = user.status === 'active' ? 'reativado' : 'desativado'
        toast.success(`Usuário "${user.name}" ${action} com sucesso`)
      }
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`)
    },
  })

  const { data: userStats } = useQuery({
    queryKey: queryKeys.users.stats(role, loggedInCooperativeId),
    queryFn: () =>
      mockUsersApi.getUserStats(
        role as 'admin' | 'cooperative',
        loggedInCooperativeId,
      ),
  })

  const kpiStats = {
    total: userStats?.total ?? 0,
    drivers: userStats?.activeDrivers ?? 0,
    inactive: userStats?.inactive ?? 0,
  }

  const totalPages = usersData ? Math.ceil(usersData.total / PAGE_SIZE) : 1

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilters.length !== ALL_STATUSES.length ||
    roleFilter !== 'all' ||
    Boolean(selectedCooperative)

  const clearFilters = () => {
    setSearch('')
    setStatusFilters(ALL_STATUSES)
    setRoleFilter('all')
    setCooperativeFilter('')
    setCurrentPage(1)
  }

  const columns: AdminTableColumn<User>[] = [
    {
      key: 'user',
      label: 'Usuário',
      render: (u) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={u.name} role={u.role} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-foreground leading-tight truncate">
              {u.name}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Perfil',
      width: '140px',
      render: (u) => <AdminStatusBadge {...roleToBadge(u.role)} />,
    },
    {
      key: 'cooperative',
      label: 'Cooperativa',
      hideOnMobile: true,
      render: (u) => {
        const coop = MOCK_COOPERATIVES.find((c) => c.id === u.cooperativeId)
        return coop ? (
          <span className="text-[13px]">{coop.name}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (u) => (
        <AdminStatusBadge
          variant={u.status === 'active' ? 'success' : 'neutral'}
          label={u.status === 'active' ? 'Ativo' : 'Inativo'}
        />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '48px',
      render: (u) => (
        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <AdminActionMenu
          items={[
            {
              label: 'Ver detalhes',
              icon: Eye,
              onClick: () => setSelectedUserForView(u),
            },
            {
              label: 'Editar',
              icon: Pencil,
              onClick: () => setSelectedUserForEdit(u),
            },
            ...(u.role === 'driver'
              ? [
                  {
                    label: 'Ver horários',
                    icon: Calendar,
                    onClick: () => setSelectedUserForSchedules(u),
                  },
                ]
              : []),
            { divider: true, label: '', onClick: () => {} },
            {
              label: u.status === 'active' ? 'Desativar' : 'Reativar',
              icon: u.status === 'active' ? UserX : UserCheck,
              onClick: () => {
                if (u.status === 'active') {
                  setUserToDeactivate(u)
                  setConfirmDeactivateOpen(true)
                } else {
                  toggleStatus({ userId: u.id, newStatus: 'active' })
                }
              },
              variant: u.status === 'active' ? ('danger' as const) : ('default' as const),
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
        <AdminKPICard label="Total de usuários" value={kpiStats.total} helper="em toda a plataforma" icon={Users} />
        <AdminKPICard label="Motoristas" value={kpiStats.drivers} helper="ativos no sistema" icon={Car} />
        <AdminKPICard label="Inativos" value={kpiStats.inactive} helper="sem atividade" icon={UserX} />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setCurrentPage(1)
        }}
        searchPlaceholder="Buscar usuário por nome ou email"
        filters={
          <div className="flex items-center gap-2">
            <StatusFilterChips
              minOne
              options={[
                { value: 'active', label: 'Ativo' },
                { value: 'inactive', label: 'Inativo' },
              ]}
              value={statusFilters}
              onChange={(v) => {
                setStatusFilters(v)
                setCurrentPage(1)
              }}
            />
            <Select
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="cooperative">Cooperativa</SelectItem>
                <SelectItem value="driver">Motorista</SelectItem>
              </SelectContent>
            </Select>
            {role === 'admin' && (
              <Select
                value={selectedCooperative || 'all'}
                onValueChange={(v) => setCooperativeFilter(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Cooperativa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cooperativas</SelectItem>
                  {MOCK_COOPERATIVES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setIsAddUserModalOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        }
      />

      <AdminTable
        columns={columns}
        data={usersData?.data ?? []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        onRowClick={(u) => setSelectedUserForView(u)}
        emptyState={
          <AdminEmptyState
            icon={Users}
            title={hasActiveFilters ? 'Nenhum usuário corresponde aos filtros' : 'Nenhum usuário cadastrado'}
            description={hasActiveFilters ? 'Ajuste os filtros.' : 'Adicione o primeiro usuário da plataforma.'}
            action={
              hasActiveFilters
                ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
                : undefined
            }
          />
        }
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 rounded-full p-0"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <AdminConfirmDialog
        open={confirmDeactivateOpen}
        onOpenChange={(open) => {
          setConfirmDeactivateOpen(open)
          if (!open) setUserToDeactivate(null)
        }}
        title="Desativar usuário"
        description={`${userToDeactivate?.name} não conseguirá mais acessar a plataforma até ser reativado.`}
        confirmLabel="Desativar"
        variant="danger"
        requireTypedConfirmation={
          userToDeactivate
            ? {
                expectedText: userToDeactivate.name,
                label: 'Digite o nome do usuário para confirmar',
              }
            : undefined
        }
        onConfirm={async () => {
          if (!userToDeactivate) return
          await toggleStatusAsync({ userId: userToDeactivate.id, newStatus: 'inactive' })
          toast.success(`Usuário "${userToDeactivate.name}" desativado com sucesso`)
        }}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        loggedInRole={role}
        loggedInCooperativeId={loggedInCooperativeId}
      />

      <ViewUserModal
        isOpen={!!selectedUserForView}
        onClose={() => setSelectedUserForView(null)}
        user={selectedUserForView}
        onEdit={(user) => {
          setSelectedUserForView(null)
          setSelectedUserForEdit(user)
        }}
        onDeactivate={(user) => {
          setSelectedUserForView(null)
          setUserToDeactivate(user)
          setConfirmDeactivateOpen(true)
        }}
        onViewSchedules={(user) => {
          setSelectedUserForView(null)
          setSelectedUserForSchedules(user)
        }}
      />

      <EditUserModal
        isOpen={!!selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        user={selectedUserForEdit}
        loggedInRole={role}
        loggedInCooperativeId={loggedInCooperativeId}
      />

      <DriverSchedulesModal
        isOpen={
          !!selectedUserForSchedules && selectedUserForSchedules.role === 'driver'
        }
        onClose={() => setSelectedUserForSchedules(null)}
        driver={selectedUserForSchedules}
      />
    </section>
  )
}
