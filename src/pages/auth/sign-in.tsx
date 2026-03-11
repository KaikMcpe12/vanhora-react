import { Lock, Mail } from 'lucide-react'
import { FaGithub, FaGoogle } from 'react-icons/fa'
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

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex w-full items-center justify-center gap-2 font-medium"
          onClick={() => {}}
        >
          <FaGoogle />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex w-full items-center justify-center gap-2 font-medium"
          onClick={() => {}}
        >
          <FaGithub />
          GitHub
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="border-border w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card text-muted-foreground px-3 font-medium tracking-wider">
            ou continue com email
          </span>
        </div>
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
          <Label htmlFor="password" className="font-semibold">
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
            Esqueceu sua senha?
          </Link>
        </div>
        <Button type="submit" className="w-full p-6 font-semibold text-white">
          Entrar
        </Button>
      </form>
    </div>
  )
}
