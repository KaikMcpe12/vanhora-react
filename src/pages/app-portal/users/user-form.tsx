import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { CooperativePicker } from '@/components/cooperative-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MOCK_COOPERATIVES } from '@/lib/data/mock-users'
import { type CreateUserInput,createUserSchema } from '@/lib/schemas/user-schema'
import { cn } from '@/lib/utils'

import { RoleSelector } from './role-selector'

interface UserFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<CreateUserInput>
  loggedInRole: 'admin' | 'cooperative' | 'driver'
  loggedInCooperativeId?: string
  onSubmit: (data: CreateUserInput) => void
  isSubmitting?: boolean
  onCancel: () => void
  disallowPasswordChange?: boolean
}

export function UserForm({
  mode,
  defaultValues,
  loggedInRole,
  loggedInCooperativeId,
  onSubmit,
  isSubmitting = false,
  onCancel,
  disallowPasswordChange = false,
}: UserFormProps) {
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      email: defaultValues?.email || '',
      password: '',
      role: defaultValues?.role || undefined,
      cooperativeId:
        defaultValues?.cooperativeId ||
        (loggedInRole === 'cooperative' ? loggedInCooperativeId : ''),
    },
  })

  const role = watch('role')
  const cooperativeId = watch('cooperativeId')
  const showCooperativeField = role === 'driver' || role === 'cooperative'
  const isCooperativeReadonly = loggedInRole === 'cooperative'

  const availableRoles: Array<'admin' | 'cooperative' | 'driver'> =
    loggedInRole === 'admin'
      ? ['admin', 'cooperative', 'driver']
      : ['cooperative', 'driver']

  const isDirtyIndicator = mode === 'edit' && isDirty

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Identificação Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Identificação</h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Nome</label>
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Nome completo"
              {...register('name')}
              disabled={isSubmitting}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Email</label>
          <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="email@example.com"
              {...register('email')}
              disabled={isSubmitting || mode === 'edit'}
              className={cn(
                'border-0 bg-transparent focus-visible:ring-0',
                mode === 'edit' && 'cursor-not-allowed opacity-60',
              )}
            />
          </div>
          {mode === 'edit' && (
            <p className="text-xs text-muted-foreground">Email não pode ser alterado</p>
          )}
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Vínculo Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Vínculo</h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Role</label>
          <RoleSelector
            value={role}
            onChange={(value) => setValue('role', value)}
            availableRoles={availableRoles}
            disabled={isSubmitting || mode === 'edit'}
          />
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role.message}</p>
          )}
        </div>

        {showCooperativeField && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Cooperativa
            </label>
            {isCooperativeReadonly ? (
              <CooperativePicker
                value={loggedInCooperativeId}
                onChange={() => {}}
                disabled={true}
                placeholder={MOCK_COOPERATIVES.find((c) => c.id === loggedInCooperativeId)?.name}
              />
            ) : (
              <CooperativePicker
                value={cooperativeId || ''}
                onChange={(value) => setValue('cooperativeId', value)}
                disabled={isSubmitting}
              />
            )}
            {errors.cooperativeId && (
              <p className="text-xs text-destructive">
                {errors.cooperativeId.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Acesso Section */}
      <div className={cn('space-y-4', disallowPasswordChange && 'opacity-60 pointer-events-none')}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Acesso</h3>
          {mode === 'edit' && !disallowPasswordChange && (
            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showChangePassword ? 'Cancelar' : 'Alterar senha'}
            </button>
          )}
        </div>

        {disallowPasswordChange ? (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-800">
              Não é possível alterar a senha de outro administrador
            </p>
          </div>
        ) : mode === 'create' || showChangePassword ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Senha {mode === 'edit' && <span className="text-muted-foreground">(nova)</span>}
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'edit' ? 'Nova senha' : 'Mínimo 8 caracteres'}
                {...register('password')}
                disabled={isSubmitting}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {mode === 'create' && (
              <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
            )}
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Nenhuma alteração na senha
          </p>
        )}
      </div>

      {/* Dirty indicator */}
      {isDirtyIndicator && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 border border-amber-200">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <p className="text-xs text-amber-800">Alterações não salvas</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : mode === 'create'
              ? 'Criar usuário'
              : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  )
}
