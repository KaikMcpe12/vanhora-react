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
  onRegisterDelay: () => void
  onSuspend: () => void
  onCancel: () => void
  onReactivate: () => void
  onAddException: () => void
}

export function ScheduleActionsMenu({
  schedule,
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
          aria-label="Acoes do horario"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem className="gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </DropdownMenuItem>

        {isActive && operationalStatus === 'in_operation' && (
          <DropdownMenuItem className="gap-2 text-amber-700" onClick={onRegisterDelay}>
            <CalendarX className="h-3.5 w-3.5" />
            Registrar atraso
          </DropdownMenuItem>
        )}

        {isActive && operationalStatus === 'delayed' && (
          <DropdownMenuItem className="gap-2 text-red-600" onClick={onCancel}>
            <XCircle className="h-3.5 w-3.5" />
            Cancelar
          </DropdownMenuItem>
        )}

        {isActive && (
          <DropdownMenuItem className="gap-2 text-slate-600" onClick={onSuspend}>
            <PauseCircle className="h-3.5 w-3.5" />
            Suspender
          </DropdownMenuItem>
        )}

        {isInactive && (
          <DropdownMenuItem className="gap-2 text-emerald-700" onClick={onReactivate}>
            <PlayCircle className="h-3.5 w-3.5" />
            Reativar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="gap-2" onClick={onAddException}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar excecao
        </DropdownMenuItem>

        <DropdownMenuItem className="gap-2 text-slate-500">
          <Copy className="h-3.5 w-3.5" />
          Duplicar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
