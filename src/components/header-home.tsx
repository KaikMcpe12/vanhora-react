import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Clock, Info, Menu, User } from 'lucide-react'
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navLinks = [
  { to: '/schedules', icon: Clock, label: 'Horários' },
  { to: '/about', icon: Info, label: 'Sobre' },
  { to: '/auth', icon: User, label: 'Autor' },
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

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg">
                <span className="sr-only">Abrir menu</span>
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="border-border bg-background/95 w-72 border-l p-0 backdrop-blur-xl"
            >
              {/* sr-only */}
              <VisuallyHidden>
                <SheetTitle>Menu de navegação</SheetTitle>
                <SheetDescription>
                  Links principais do site VanHora
                </SheetDescription>
              </VisuallyHidden>

              <div className="border-border flex items-center justify-between border-b px-6 py-5">
                <Link to="/" className="flex items-center gap-2">
                  <img src={Logo} alt="VanHora" className="h-8 w-8" />
                  <SheetTitle className="font-bold text-foreground">VanHora</SheetTitle>
                </Link>
              </div>

              <nav className="flex flex-col gap-1 px-4 py-6">
                {navLinks.map(({ to, icon: Icon, label }) => (
                  <SheetClose asChild key={to}>
                    <Link
                      to={to}
                      className="group text-foreground/70 hover:bg-accent hover:text-foreground flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200"
                    >
                      <span className="bg-accent/50 group-hover:bg-accent flex h-8 w-8 items-center justify-center rounded-md transition-colors">
                        <Icon className="h-4 w-4" />
                      </span>
                      {label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <div className="border-border absolute right-0 bottom-0 left-0 border-t px-4 py-5">
                <SheetClose asChild>
                  <Button asChild className="w-full rounded-lg">
                    <Link to="/sign-in">Entrar</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
