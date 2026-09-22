import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  Car,
  Eye,
  Pencil,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
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
import { CooperativePicker } from '@/components/pickers/cooperative-picker'
import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTableFilters } from '@/hooks/use-table-filters'
import { mockUsersApi } from '@/lib/api/mock-users-api'
import type { User } from '@/lib/data/mock-users'
import { MOCK_COOPERATIVES } from '@/lib/data/mock-users'
import { queryKeys } from '@/lib/query-keys'
import { USER_ROLE_META, USER_STATUS_META } from '@/lib/status/status-meta'
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

// URL key `cooperative` preservada (deep-link vindo de cooperative-detail-panel)
const USER_FILTER_DEFAULTS = {
  search: '',
  role: 'all',
  cooperative: '',
  status: ALL_STATUSES as string[],
}

export function UsersPage() {
  const { role, user: loggedInUser } =
    useOutletContext<AppPortalOutletContext>()
  const queryClient = useQueryClient()

  const { filters, setFilter, reset, page, setPage } = useTableFilters({
    defaults: USER_FILTER_DEFAULTS,
  })
  const {
    search,
    role: roleFilter,
    cooperative: selectedCooperative,
    status: statusFilters,
  } = filters

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(
    null,
  )
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(
    null,
  )
  const [selectedUserForSchedules, setSelectedUserForSchedules] =
    useState<User | null>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [confirmDeactivateOpen, setConfirmDeactivateOpen] = useState(false)

  const loggedInUserId = loggedInUser.email.replace('@', '_').split('.')[0]
  const loggedInCooperativeId =
    role === 'cooperative' ? '11111111-1111-4111-8111-111111111111' : undefined

  const activeStatusFilter =
    statusFilters.length === ALL_STATUSES.length
      ? undefined
      : (statusFilters[0] as UserStatus | undefined)

  const activeRoleFilter =
    roleFilter === 'all' ? undefined : (roleFilter as UserRole)

  const { data: usersData, isLoading } = useQuery({
    queryKey: queryKeys.users.list({
      search,
      statusFilters,
      roleFilter,
      selectedCooperative,
      currentPage: page,
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
          // hook é 0-indexed; a API de usuários é 1-indexed
          page: page + 1,
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
        toast.success(`Usuário "${user.name}" ${action}.`)
      }
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`, {
        duration: 5000,
      })
    },
  })

  const { data: userStats } = useQuery({
    queryKey: queryKeys.users.stats(role, loggedInCooperativeId ?? null),
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

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilters.length !== ALL_STATUSES.length ||
    roleFilter !== 'all' ||
    Boolean(selectedCooperative)

  const clearFilters = () => reset()

  const columns: AdminTableColumn<User>[] = [
    {
      key: 'user',
      label: 'Usuário',
      render: (u) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={u.name} role={u.role} size="sm" />
          <div className="min-w-0">
            <p className="text-foreground truncate text-[13px] leading-tight font-medium">
              {u.name}
            </p>
            <p className="text-muted-foreground truncate text-[11px]">
              {u.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Perfil',
      width: '140px',
      render: (u) => <StatusChip {...USER_ROLE_META[u.role]} />,
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
      render: (u) => <StatusChip {...USER_STATUS_META[u.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: '48px',
      render: (u) => (
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
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
                variant:
                  u.status === 'active'
                    ? ('danger' as const)
                    : ('default' as const),
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
          label="Total de usuários"
          value={kpiStats.total}
          helper="em toda a plataforma"
          icon={Users}
        />
        <AdminKPICard
          label="Motoristas"
          value={kpiStats.drivers}
          helper="ativos no sistema"
          icon={Car}
        />
        <AdminKPICard
          label="Inativos"
          value={kpiStats.inactive}
          helper="sem atividade"
          icon={UserX}
        />
      </div>

      <AdminFilterBar
        searchValue={search}
        onSearchChange={(v) => setFilter('search', v)}
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
              onChange={(v) => setFilter('status', v)}
            />
            <Select
              value={roleFilter}
              onValueChange={(v) => setFilter('role', v)}
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
              <CooperativePicker
                value={selectedCooperative}
                onChange={(v) => setFilter('cooperative', v)}
                triggerClassName="w-44"
              />
            )}
          </div>
        }
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setIsAddUserModalOpen(true)}
          >
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
            title={
              hasActiveFilters
                ? 'Nenhum usuário corresponde aos filtros'
                : 'Nenhum usuário cadastrado'
            }
            description={
              hasActiveFilters
                ? 'Ajuste os filtros.'
                : 'Adicione o primeiro usuário da plataforma.'
            }
            action={
              hasActiveFilters
                ? { label: 'Limpar filtros', onClick: clearFilters, icon: X }
                : {
                    label: 'Adicionar usuário',
                    onClick: () => setIsAddUserModalOpen(true),
                    icon: UserPlus,
                  }
            }
          />
        }
      />

      <AdminPagination
        page={page}
        perPage={PAGE_SIZE}
        total={usersData?.total ?? 0}
        onPageChange={setPage}
      />

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
          await toggleStatusAsync({
            userId: userToDeactivate.id,
            newStatus: 'inactive',
          })
          toast.success(`Usuário "${userToDeactivate.name}" desativado.`)
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
          !!selectedUserForSchedules &&
          selectedUserForSchedules.role === 'driver'
        }
        onClose={() => setSelectedUserForSchedules(null)}
        driver={selectedUserForSchedules}
      />
    </section>
  )
}
