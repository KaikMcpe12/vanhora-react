import { useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCog } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User } from '@/lib/data/mock-users'
import type { CreateUserInput } from '@/lib/schemas/user-schema'

import { UserForm } from './user-form'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  loggedInRole: 'admin' | 'cooperative' | 'driver'
  loggedInCooperativeId?: string
}

export function EditUserModal({
  isOpen,
  onClose,
  user,
  loggedInRole,
  loggedInCooperativeId,
}: EditUserModalProps) {
  const queryClient = useQueryClient()

  // Check if trying to change another admin's password
  const isOtherAdmin = loggedInRole === 'admin' && user?.role === 'admin'

  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      // For now, simulate updating the user in mock data
      // In a real app, this would call the backend API
      toast.success(`Usuário "${data.name}" atualizado com sucesso`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar usuário: ${error.message}`)
    },
  })

  if (!user) return null

  const handleSubmit = (data: CreateUserInput) => {
    updateUser(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-blue-600" />
            <DialogTitle>Editar usuário</DialogTitle>
          </div>
        </DialogHeader>

        <UserForm
          mode="edit"
          defaultValues={{
            name: user.name,
            email: user.email,
            role: user.role,
            cooperativeId: user.cooperativeId || undefined,
          }}
          loggedInRole={loggedInRole}
          loggedInCooperativeId={loggedInCooperativeId}
          disallowPasswordChange={isOtherAdmin}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
