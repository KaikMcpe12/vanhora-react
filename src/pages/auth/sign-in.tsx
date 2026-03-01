import { Lock, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'

export function SignIn() {
  return (
    <div className="bg-card w-full max-w-md rounded-xl p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-card-foreground mb-2 text-3xl font-bold">
          Bem vindo
        </h1>
        <p className="text-muted-foreground">
          Entre com suas credenciais para acessar
        </p>
      </div>

      <form className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="font-semibold">
            Email
          </Label>
          <InputGroup>
            <InputGroupInput
              id="email"
              type="email"
              placeholder="name@company.com"
            />
            <InputGroupAddon>
              <Mail className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="space-y-3">
          <Label htmlFor="senha" className="font-semibold">
            Senha
          </Label>
          <InputGroup>
            <InputGroupInput
              id="password"
              type="password"
              placeholder="••••••••"
            />
            <InputGroupAddon>
              <Lock className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="text-right">
          <Link
            to="#"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            esqueceu sua senha?
          </Link>
        </div>

        <Button type="submit" className="w-full p-6 font-semibold text-white">
          Entrar
        </Button>
      </form>
    </div>
  )
}
