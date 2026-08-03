import { Building2, CalendarDays, Mail, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { User } from '@/lib/data/mock-users'
import { MOCK_COOPERATIVES } from '@/lib/data/mock-users'
import { cn } from '@/lib/utils'

import { UserAvatar } from './user-avatar'

interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onEdit?: (user: User) => void
  onDeactivate?: (user: User) => void
  /** Motoristas: abre o painel de horários do usuário. */
  onViewSchedules?: (user: User) => void
}

const ROLE_LABEL: Record<'admin' | 'cooperative' | 'driver', string> = {
  admin: 'Administrador',
  cooperative: 'Cooperativa',
  driver: 'Motorista',
}

const ROLE_BADGE_CLASS: Record<'admin' | 'cooperative' | 'driver', string> = {
  admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  cooperative: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  driver: 'bg-sky-100 text-sky-700 border-sky-200',
}

/**
 * Painel lateral "Sobre o usuário". Abre ao clicar na linha da tabela.
 * Motoristas ganham um atalho "Ver Horários".
 */
export function ViewUserModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onDeactivate,
  onViewSchedules,
}: ViewUserModalProps) {
  if (!user) return null

  const cooperative = MOCK_COOPERATIVES.find((c) => c.id === user.cooperativeId)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        {/* Header */}
        <SheetHeader className="border-b p-6">
          <div className="flex items-start gap-4">
            <UserAvatar name={user.name} role={user.role} size="lg" />
            <div>
              <SheetTitle className="text-lg">{user.name}</SheetTitle>
              <Badge
                variant="outline"
                className={cn('mt-1 border', ROLE_BADGE_CLASS[user.role])}
              >
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-2">
          {/* Informações de Contato */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Informações de Contato
            </h3>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Vínculo Institucional */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Vínculo Institucional
            </h3>
            <div className="space-y-2">
              {cooperative && (
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Cooperativa</p>
                    <p className="text-sm font-medium text-foreground">
                      {cooperative.name}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">
                    {ROLE_LABEL[user.role]}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Atividade */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Status & Atividade
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'border',
                    user.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200',
                  )}
                >
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Criado em</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Motorista: atalho para horários */}
          {user.role === 'driver' && onViewSchedules && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                onViewSchedules(user)
                onClose()
              }}
            >
              <CalendarDays className="h-4 w-4" />
              Ver Horários
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t p-6">
          {onDeactivate && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                user.status === 'active'
                  ? 'text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50'
                  : 'text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50',
              )}
              onClick={() => {
                onDeactivate(user)
                onClose()
              }}
            >
              {user.status === 'active' ? 'Desativar' : 'Reativar'}
            </Button>
          )}
          <div className="flex-1" />
          {onEdit && (
            <Button
              size="sm"
              onClick={() => {
                onEdit(user)
                onClose()
              }}
            >
              Editar
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
