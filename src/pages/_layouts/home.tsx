// import { Clock, Info, User } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

// import Logo from '@/assets/logo.svg'
import { HeaderHome } from '@/components/header-home'

export function Home() {
  return (
    <div className="text-text-main-light dark:text-text-main-dark relative flex min-h-screen flex-col antialiased shadow-xl transition-colors duration-300">
      <HeaderHome />

      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>

      <footer className="bg-muted border-t border-border flex h-20 w-full items-center justify-between px-8">
        <span className="text-muted-foreground text-sm">
          © 2026 VanHora. Todos os direitos reservados.
        </span>
        <Link
          to="/sign-in"
          className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors hover:underline"
        >
          <span>Área Administrativa</span>
        </Link>
      </footer>
    </div>
  )
}
