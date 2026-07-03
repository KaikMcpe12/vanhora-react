import { Clock, Heart, Info, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Logo from '@/assets/logo.svg'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'

const navLinks = [
  { to: '/schedules', icon: Clock, label: 'Horários' },
  { to: '/schedules/favorites', icon: Heart, label: 'Favoritos' },
  { to: '/about', icon: Info, label: 'Sobre' },
  { to: '/author', icon: User, label: 'Autor' },
]

export function HeaderHome() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b transition-all duration-500',
        scrolled
          ? 'border-border/40 bg-background/15 dark:bg-background-dark/15 shadow-sm backdrop-blur-2xl'
          : 'border-border/60 bg-background/50 dark:bg-background-dark/50 backdrop-blur-xl',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="flex items-center gap-3 transition-transform duration-200 hover:scale-105"
        >
          <img src={Logo} alt="VanHora Logo" className="h-10 w-10" />
          <span className="text-foreground hidden text-xl font-bold tracking-tight sm:inline">
            VanHora
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <NavigationMenuLink key={to} asChild>
                  <Link
                    to={to}
                    className="group text-foreground/70 hover:bg-accent hover:text-foreground flex flex-row items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                  >
                    <Icon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                    {label}
                  </Link>
                </NavigationMenuLink>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="border-border flex items-center gap-3 border-l pl-6">
            <Button asChild size="sm" variant="outline" className="rounded-lg">
              <Link to="/sign-in">Entrar</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* mobile — só tema (nav está no bottom nav) */}
        <div className="flex items-center md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
