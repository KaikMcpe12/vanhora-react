import { Clock, Info, User } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

import Logo from '@/assets/logo.svg'

export function Home() {
  return (
    <div className="bg-background-light text-text-main-light dark:bg-background-dark dark:text-text-main-dark relative flex min-h-screen flex-col overflow-hidden antialiased transition-colors duration-300">
      <header className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3 font-semibold">
          <img src={Logo} alt="VanHora Logo" className="h-16 w-16" />
          <span className="text-foreground text-xl font-bold">VanHora</span>
        </div>
        <div className="flex items-center gap-12">
          <Link to="/schedules" className="flex gap-2 items-center hover:text-primary text-sm font-medium transition-colors">
            <Clock className="h-4 w-4" />
            <span>Horários</span>
          </Link>
          
          <Link to="/about" className="flex gap-2 items-center hover:text-primary text-sm font-medium transition-colors">
            <Info className="h-4 w-4" />
            <span>Sobre</span>
          </Link>
          
          <Link to="/auth" className="flex gap-2 items-center hover:text-primary text-sm font-medium transition-colors">
            <User className="h-4 w-4" />
            <span>Autor</span>
          </Link>
        </div>
      </header>

      <div>
        <Outlet />
      </div>
      
      <footer className='bg-foreground w-full h-20 flex items-center justify-between px-8'>
        <span className='text-muted text-sm'>© 2026 VanHora. Todos os direitos reservados.</span>
        <Link to='/sign-in' className='text-muted hover:text-primary-foreground hover:underline text-sm font-medium transition-colors'>
          <span>Área Administrativa</span>
        </Link>
      </footer>
    </div>
  )
}
