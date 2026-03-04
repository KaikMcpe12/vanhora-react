import { Clock, Info, Menu, User, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import Logo from '@/assets/logo.svg'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'

export function HeaderHome() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-border bg-background dark:bg-background-dark sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex items-center justify-between px-4 py-4 sm:px-8 lg:px-12">
        {/* Coluna Esquerda - Logo */}
        <Link to="/" className="flex items-center gap-3 font-semibold transition-transform hover:scale-105">
          <img src={Logo} alt="VanHora Logo" className="h-12 w-12" />
          <span className="text-foreground hidden text-xl font-bold sm:inline">
            VanHora
          </span>
        </Link>

        {/* Coluna Direita - Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {/* Navigation Links */}
          <nav className="flex items-center gap-6 border-r border-border pr-8">
            <Link
              to="/schedules"
              className="text-foreground hover:text-muted-foreground flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>Horários</span>
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-muted-foreground flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Info className="h-4 w-4" />
              <span>Sobre</span>
            </Link>
            <Link
              to="/auth"
              className="text-foreground hover:text-muted-foreground flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Autor</span>
            </Link>
          </nav>

          {/* CTA Actions */}
          <div className="flex items-center gap-4">
            <Button asChild size="sm" variant="outline">
              <Link to="/sign-in" className="flex items-center gap-2">
                <span>Entrar</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Menu - Coluna Direita Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex"
          >
            {isOpen ? (
              <X className="text-foreground h-6 w-6" />
            ) : (
              <Menu className="text-foreground h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <nav className="border-border bg-background/95 border-t backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-8 lg:px-12">
            <Link
              to="/schedules"
              className="text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Clock className="h-4 w-4" />
              <span>Horários</span>
            </Link>
            <Link
              to="/about"
              className="text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <Info className="h-4 w-4" />
              <span>Sobre</span>
            </Link>
            <Link
              to="/auth"
              className="text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <User className="h-4 w-4" />
              <span>Autor</span>
            </Link>
            <Button asChild className="w-full">
              <Link
                to="/sign-in"
                className="flex items-center justify-center gap-2"
              >
                <span>Entrar</span>
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  )
}
