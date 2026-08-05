import { Building2, Clock, Heart, Home, Info, LogIn, Menu, Moon, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useTheme } from '@/components/theme/theme-provider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    label: 'Início',
    Icon: Home,
    href: '/',
    isActive: (p: string) => p === '/',
  },
  {
    label: 'Horários',
    Icon: Clock,
    href: '/schedules',
    isActive: (p: string) => p.startsWith('/schedules') && p !== '/schedules/favorites',
  },
  {
    label: 'Favoritos',
    Icon: Heart,
    href: '/schedules/favorites',
    isActive: (p: string) => p === '/schedules/favorites',
  },
]

const MENU_LINKS = [
  { href: '/cooperatives', Icon: Building2, label: 'Cooperativas' },
  { href: '/about', Icon: Info, label: 'Sobre' },
  { href: '/author', Icon: User, label: 'Autor' },
]

export function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const [menuOpen, setMenuOpen] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  const isDark = theme === 'dark'
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark')

  useEffect(() => {
    const onIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') setInputFocused(true)
    }
    const onOut = () => setInputFocused(false)
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[99] md:hidden',
          'animate-bottom-nav-appear transition-transform duration-200',
          'border-t border-border/60 bg-card',
          inputFocused && 'translate-y-full',
        )}
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ label, Icon, href, isActive }) => {
            const active = isActive(location.pathname)
            return (
              <button
                key={href}
                type="button"
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(href)}
                className="flex min-w-[60px] cursor-pointer flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-transform duration-100 active:scale-95"
              >
                <Icon
                  size={22}
                  strokeWidth={1.75}
                  className={cn(
                    'transition-colors',
                    active
                      ? 'fill-current text-primary'
                      : 'fill-none text-muted-foreground',
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </button>
            )
          })}

          <button
            type="button"
            aria-label="Menu de navegação"
            onClick={() => setMenuOpen(true)}
            className="flex min-w-[60px] cursor-pointer flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-transform duration-100 active:scale-95"
          >
            <Menu size={22} strokeWidth={1.75} className="fill-none text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">Menu</span>
          </button>
        </div>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[70vh] rounded-t-2xl gap-0 pb-[max(20px,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle>Mais</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col px-2">
            {MENU_LINKS.map(({ href, Icon, label }) => (
              <button
                key={href}
                type="button"
                onClick={() => {
                  navigate(href)
                  setMenuOpen(false)
                }}
                className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-vh-surface-warm"
              >
                <Icon size={20} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
                {label}
              </button>
            ))}

            <div className="my-2 border-t border-border/50" />

            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-vh-surface-warm"
            >
              <span className="flex items-center gap-4">
                <Moon size={20} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
                Tema escuro
              </span>
              <span
                className={cn(
                  'flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                  isDark ? 'bg-primary' : 'bg-muted',
                )}
              >
                <span
                  className={cn(
                    'h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                    isDark ? 'translate-x-[18px]' : 'translate-x-0.5',
                  )}
                />
              </span>
            </button>

            <div className="my-2 border-t border-border/50" />

            <button
              type="button"
              onClick={() => {
                navigate('/sign-in')
                setMenuOpen(false)
              }}
              className="flex w-full cursor-pointer items-center gap-4 rounded-lg px-4 py-3.5 text-[15px] text-foreground transition-colors hover:bg-vh-surface-warm"
            >
              <LogIn size={20} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
              Entrar
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
