import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { getBasePathByRole, useSession } from '@/lib/auth/session'

// ─── Schema ──────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type SignInInput = z.infer<typeof signInSchema>

// ─── Component ───────────────────────────────────────────────────────────────

export function SignIn() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(data: SignInInput) {
    setAuthError(null)
    try {
      const user = await signIn(data.email, data.password)
      navigate(from ?? getBasePathByRole(user.role), { replace: true })
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.',
      )
    }
  }

  return (
    <div className="bg-card w-full max-w-md rounded-xl border border-border p-8">
      <div className="mb-8 text-center">
        <h1 className="text-card-foreground mb-2 text-3xl font-bold">
          Bem-vindo
        </h1>
        <p className="text-muted-foreground">
          Entre com suas credenciais para acessar
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Erro de autenticação */}
        {authError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {authError}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold">
            E-mail
          </Label>
          <InputGroup>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="nome@empresa.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <InputGroupAddon>
              <Mail className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-semibold">
              Senha
            </Label>
            <Link
              to="#"
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              tabIndex={-1}
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <InputGroup>
            <InputGroupInput
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <InputGroupAddon>
              <Lock className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full p-6 font-semibold text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando…
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </div>
  )
}
