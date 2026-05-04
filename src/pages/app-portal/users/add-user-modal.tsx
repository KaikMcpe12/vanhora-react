import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mockUsersApi } from '@/lib/api/mock-users-api'
import { type CreateUserInput } from '@/lib/schemas/user-schema'

import { UserForm } from './user-form'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  loggedInRole: 'admin' | 'cooperative' | 'driver'
  loggedInCooperativeId?: string
}

export function AddUserModal({
  isOpen,
  onClose,
  loggedInRole,
  loggedInCooperativeId,
}: AddUserModalProps) {
  const queryClient = useQueryClient()

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: (data: CreateUserInput) => mockUsersApi.createUser(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(`Usuário "${user.name}" criado com sucesso`)
      onClose()
    },
    onError: (error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`)
    },
  })

  const handleSubmit = (data: CreateUserInput) => {
    createUser(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            <DialogTitle>Adicionar usuário</DialogTitle>
          </div>
        </DialogHeader>

        <UserForm
          mode="create"
          loggedInRole={loggedInRole}
          loggedInCooperativeId={loggedInCooperativeId}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
