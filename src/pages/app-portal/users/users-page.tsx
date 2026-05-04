import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Toggle } from '@/components/ui/toggle'
import { mockUsersApi } from '@/lib/api/mock-users-api'
import type { User } from '@/lib/data/mock-users'
import { MOCK_COOPERATIVES } from '@/lib/data/mock-users'
import { cn } from '@/lib/utils'
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

const STATUS_META: Record<
  UserStatus,
  {
    label: string
    badge: string
    toggle: string
    tone: string
  }
> = {
  active: {
    label: 'Ativo',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    toggle:
      'data-[state=on]:border-emerald-200 data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-700',
    tone: 'text-emerald-600',
  },
  inactive: {
    label: 'Inativo',
    badge: 'border-slate-200 bg-slate-50 text-slate-600',
    toggle:
      'data-[state=on]:border-slate-200 data-[state=on]:bg-slate-50 data-[state=on]:text-slate-600',
    tone: 'text-slate-500',
  },
}

const ROLE_META: Record<
  'admin' | 'cooperative' | 'driver',
  {
    label: string
    cardBg: string
    cardBorder: string
    badgeBg: string
    badgeText: string
  }
> = {
  admin: {
    label: 'ADMIN',
    cardBg: 'bg-indigo-50',
    cardBorder: 'border-t-[3px] border-t-indigo-500',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-700',
  },
  cooperative: {
    label: 'COOPERATIVA',
    cardBg: 'bg-emerald-50',
    cardBorder: 'border-t-[3px] border-t-emerald-500',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  driver: {
    label: 'MOTORISTA',
    cardBg: 'bg-sky-50',
    cardBorder: 'border-t-[3px] border-t-sky-500',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-700',
  },
}

const ALL_STATUSES: UserStatus[] = ['active', 'inactive']

const KPI_CONFIG: Array<{
  label: string
  description: string
  icon: typeof Users
  tone: string
  iconBg: string
  cardBg: string
  cardBorder: string
  numberColor: string
  labelColor: string
  key: 'total' | 'drivers' | 'inactive'
}> = [
  {
    label: 'Total de usuários',
    description: 'em toda plataforma',
    icon: Users,
    tone: 'text-slate-700',
    iconBg: 'bg-slate-100',
    cardBg: 'bg-slate-50',
    cardBorder: 'border-l-4 border-l-slate-400 border-t border-r border-b border-slate-100',
    numberColor: 'text-slate-700',
    labelColor: 'text-slate-800',
    key: 'total',
  },
  {
    label: 'Motoristas',
    description: 'ativos no sistema',
    icon: UserCheck,
    tone: 'text-sky-700',
    iconBg: 'bg-sky-100',
    cardBg: 'bg-sky-50',
    cardBorder: 'border-l-4 border-l-sky-400 border-t border-r border-b border-sky-100',
    numberColor: 'text-sky-700',
    labelColor: 'text-sky-800',
    key: 'drivers',
  },
  {
    label: 'Inativos',
    description: 'sem atividade',
    icon: UserX,
    tone: 'text-slate-500',
    iconBg: 'bg-slate-200',
    cardBg: 'bg-slate-50',
    cardBorder: 'border-l-4 border-l-slate-400 border-t border-r border-b border-slate-200',
    numberColor: 'text-slate-600',
    labelColor: 'text-slate-700',
    key: 'inactive',
  },
]

const PAGE_SIZE = 10

export function UsersPage() {
  const { role, user: loggedInUser } = useOutletContext<AppPortalOutletContext>()
  const queryClient = useQueryClient()

  const [pendingQuery, setPendingQuery] = useState('')
  const [committedQuery, setCommittedQuery] = useState('')
  const [statusFilters, setStatusFilters] = useState<UserStatus[]>(ALL_STATUSES)
  const [selectedCooperative, setSelectedCooperative] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null)
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null)
  const [selectedUserForSchedules, setSelectedUserForSchedules] = useState<User | null>(null)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)

  const hasPendingQuery = pendingQuery.trim().length > 0

  const loggedInUserId = loggedInUser.email.replace('@', '_').split('.')[0]
  const loggedInCooperativeId = role === 'cooperative' ? 'coop-metro' : undefined

  const { data: usersData, isLoading } = useQuery({
    queryKey: [
      'users',
      committedQuery,
      statusFilters,
      selectedCooperative,
      currentPage,
      role,
      loggedInUserId,
    ],
    queryFn: () =>
      mockUsersApi.listUsers(
        {
          search: committedQuery,
          status: statusFilters.length === ALL_STATUSES.length ? undefined : statusFilters[0],
          cooperativeId: selectedCooperative || undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        },
        loggedInUserId,
        role as 'admin' | 'cooperative',
        loggedInCooperativeId,
      ),
  })

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (userId: string) =>
      mockUsersApi.toggleUserStatus({
        userId,
        newStatus: usersData?.data.find((u) => u.id === userId)?.status === 'active'
          ? 'inactive'
          : 'active',
      }),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      if (user) {
        const action = user.status === 'active' ? 'reativado' : 'desativado'
        toast.success(`Usuário "${user.name}" ${action} com sucesso`)
      }
      setUserToDeactivate(null)
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`)
    },
  })

  const kpiStats = useMemo(() => {
    if (!usersData?.data) return { total: 0, drivers: 0, inactive: 0 }
    return {
      total: usersData.total,
      drivers: usersData.data.filter((u) => u.role === 'driver').length,
      inactive: usersData.data.filter((u) => u.status === 'inactive').length,
    }
  }, [usersData])

  const totalPages = usersData ? Math.ceil(usersData.total / PAGE_SIZE) : 1

  const isStatusFiltered = statusFilters.length !== ALL_STATUSES.length
  const hasActiveFilters = Boolean(committedQuery.trim()) || isStatusFiltered || Boolean(selectedCooperative)

  const handleSearch = () => {
    setCommittedQuery(pendingQuery)
    setCurrentPage(1)
  }

  const toggleStatus_filter = (status: UserStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    )
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setPendingQuery('')
    setCommittedQuery('')
    setStatusFilters(ALL_STATUSES)
    setSelectedCooperative('')
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setPendingQuery('')
    setCommittedQuery('')
    setCurrentPage(1)
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">
            Gerenciamento de usuários
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Gerencie usuários, motoristas e cooperativas da plataforma.
          </p>
        </div>
        <Button className="gap-2" size="sm" onClick={() => setIsAddUserModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Adicionar usuário
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {KPI_CONFIG.map((item) => {
          const Icon = item.icon
          const value = kpiStats[item.key]

          return (
            <article
              key={item.key}
              className={cn(
                'flex items-center gap-4 rounded-xl p-5',
                item.cardBg,
                item.cardBorder,
              )}
            >
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  item.iconBg,
                )}
              >
                <Icon className={cn('h-5 w-5', item.tone)} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-3xl font-extrabold leading-none', item.numberColor)}>
                  {value}
                </p>
                <p className={cn('mt-0.5 text-xs font-semibold', item.labelColor)}>
                  {item.label}
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  {item.description}
                </p>
              </div>
            </article>
          )
        })}
      </section>

      <section className="bg-card space-y-3 rounded-xl border p-4">
        <div className="flex gap-2">
          <InputGroup className="h-10 flex-1">
            <InputGroupAddon align="inline-start">
              <Search className="text-muted-foreground h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar usuário por nome ou email"
              value={pendingQuery}
              onChange={(event) => setPendingQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch()
              }}
            />
            {hasPendingQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Limpar busca"
                  onClick={clearSearch}
                >
                  <X className="h-3.5 w-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <Button
            size="sm"
            className="h-10 shrink-0 rounded-full gap-2"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            Buscar
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ALL_STATUSES.map((status) => (
            <Toggle
              key={status}
              pressed={statusFilters.includes(status)}
              onPressedChange={() => toggleStatus_filter(status)}
              variant="outline"
              size="sm"
              className={cn(
                'border-border h-8 gap-2 rounded-full px-3 text-xs font-semibold',
                STATUS_META[status].toggle,
              )}
            >
              {STATUS_META[status].label}
            </Toggle>
          ))}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground h-8 px-2"
              onClick={clearFilters}
            >
              Limpar
            </Button>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-slate-50 py-16 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
          <p className="text-foreground font-semibold">Carregando usuários...</p>
        </div>
      ) : usersData && usersData.data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-slate-50 py-16 text-center">
          <Users className="text-muted-foreground h-10 w-10" />
          <p className="text-foreground font-semibold">Nenhum usuário encontrado</p>
          <p className="text-muted-foreground text-sm">
            Tente ajustar os filtros ou limpar a busca.
          </p>
          <Button variant="outline" size="sm" className="mt-1 rounded-full" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {usersData?.data.map((userItem) => {
              const roleInfo = ROLE_META[userItem.role]

              return (
                <article
                  key={userItem.id}
                  className={cn(
                    'bg-card flex h-full flex-col gap-4 rounded-xl border p-4',
                    roleInfo.cardBorder,
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <UserAvatar name={userItem.name} role={userItem.role} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-foreground text-sm font-semibold truncate">
                            {userItem.name}
                          </h3>
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full shrink-0',
                              userItem.status === 'active'
                                ? 'bg-emerald-500'
                                : 'bg-slate-300',
                            )}
                          />
                        </div>
                        <p className="text-muted-foreground text-xs font-medium truncate">
                          {userItem.email}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'gap-1 border px-1.5 py-0.5 text-[10px] mt-1',
                            roleInfo.badgeBg,
                            roleInfo.badgeText,
                          )}
                        >
                          {roleInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {userItem.role !== 'admin' && userItem.cooperativeId && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge
                        variant="secondary"
                        className="gap-1"
                      >
                        {MOCK_COOPERATIVES.find(c => c.id === userItem.cooperativeId)?.name || 'Cooperativa'}
                      </Badge>
                    </div>
                  )}

                  <div className="mt-auto flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => setSelectedUserForView(userItem)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {userItem.role === 'driver' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setSelectedUserForSchedules(userItem)}
                        title="Ver horários agendados"
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        Horários
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full h-8 w-8 p-0"
                      onClick={() => setSelectedUserForEdit(userItem)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        'rounded-full h-8 w-8 p-0',
                        userItem.status === 'active'
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
                      )}
                      onClick={() => setUserToDeactivate(userItem)}
                      title={userItem.status === 'active' ? 'Desativar' : 'Reativar'}
                    >
                      {userItem.status === 'active' ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <UserCheck className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </article>
              )
            })}
          </section>

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
        </>
      )}

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={!!userToDeactivate} onOpenChange={(open: boolean) => !open && setUserToDeactivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              {userToDeactivate?.status === 'active'
                ? 'Desativar usuário?'
                : 'Reativar usuário?'}
            </DialogTitle>
            <DialogDescription>
              {userToDeactivate?.status === 'active'
                ? `${userToDeactivate?.name} não poderá mais acessar a plataforma. Esta ação pode ser revertida a qualquer momento.`
                : `${userToDeactivate?.name} terá acesso restaurado à plataforma.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToDeactivate(null)}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (userToDeactivate) {
                  toggleStatus(userToDeactivate.id)
                }
              }}
              className={cn(
                userToDeactivate?.status === 'active'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700',
              )}
            >
              {userToDeactivate?.status === 'active' ? 'Desativar' : 'Reativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modals */}
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
        isOpen={!!selectedUserForSchedules && selectedUserForSchedules.role === 'driver'}
        onClose={() => setSelectedUserForSchedules(null)}
        driver={selectedUserForSchedules!}
      />
    </section>
  )
}
