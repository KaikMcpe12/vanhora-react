import { CalendarX, Copy, MoreHorizontal, PauseCircle, Pencil, PlayCircle, Plus, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AdminSchedule } from '@/lib/types/admin-schedule'

interface ScheduleActionsMenuProps {
  schedule: AdminSchedule
  onEdit: () => void
  onDuplicate: () => void
  onRegisterDelay: () => void
  onSuspend: () => void
  onCancel: () => void
  onReactivate: () => void
  onAddException: () => void
}

export function ScheduleActionsMenu({
  schedule,
  onEdit,
  onDuplicate,
  onRegisterDelay,
  onSuspend,
  onCancel,
  onReactivate,
  onAddException,
}: ScheduleActionsMenuProps) {
  const { recordStatus, operationalStatus } = schedule
  const isActive = recordStatus === 'active'
  const isInactive = !isActive

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full p-0"
          aria-label="Ações do horário"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="gap-2" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </DropdownMenuItem>

        {isActive && operationalStatus === 'in_operation' && (
          <DropdownMenuItem className="gap-2 text-amber-700" onClick={onRegisterDelay}>
            <CalendarX className="h-3.5 w-3.5 text-current" />
            Registrar atraso
          </DropdownMenuItem>
        )}

        {isActive && operationalStatus === 'delayed' && (
          <DropdownMenuItem className="gap-2 text-red-600" onClick={onCancel}>
            <XCircle className="h-3.5 w-3.5 text-current" />
            Cancelar
          </DropdownMenuItem>
        )}

        {isActive && (
          <DropdownMenuItem className="gap-2 text-slate-600" onClick={onSuspend}>
            <PauseCircle className="h-3.5 w-3.5 text-current" />
            Suspender
          </DropdownMenuItem>
        )}

        {isInactive && (
          <DropdownMenuItem className="gap-2 text-emerald-700" onClick={onReactivate}>
            <PlayCircle className="h-3.5 w-3.5 text-current" />
            Reativar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2" onClick={onAddException}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar exceção
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" />
          Duplicar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
