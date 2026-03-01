import { Link, Outlet } from 'react-router-dom'

import Logo from '@/assets/logo.svg'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-pink-100 via-muted to-blue-100 antialiased">
      <header className="text-foreground flex items-center justify-between px-12 py-8 text-lg">
        <div className="flex items-center gap-3 font-semibold">
          <img src={Logo} alt="VanHora Logo" className="h-16 w-16" />
          <span className="text-foreground text-xl font-bold">VanHora</span>
        </div>
        <Link
          to="/author"
          className="text-muted-foreground hover:text-foreground text-sm underline"
        >
          Centro de Ajuda
        </Link>
      </header>
      
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="text-muted-foreground pb-8 text-center text-sm">
        © 2024 VanHora.
      </footer>
    </div>
  )
}
