import { Link, Outlet } from 'react-router-dom'

import Logo from '@/assets/logo.svg'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function AuthLayout() {
  return (
    <div className="bg-background-light text-text-main-light dark:bg-background-dark dark:text-text-main-dark relative flex min-h-screen flex-col overflow-hidden antialiased transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-5%] h-96 w-96 rounded-full bg-purple-300 opacity-30 blur-3xl dark:opacity-10" />
      <div className="absolute top-[-10%] right-[-5%] h-96 w-96 rounded-full bg-yellow-200 opacity-30 blur-3xl dark:opacity-10" />
      <div className="absolute -bottom-32 left-20 h-96 w-96 rounded-full bg-pink-300 opacity-30 blur-3xl dark:opacity-10" />

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
        © 2026 VanHora.
      </footer>

      <div className="fixed right-4 top-4 z-50 md:top-1/2 md:-translate-y-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg backdrop-blur">
        <ThemeToggle />
      </div>
    </div>
  )
}
