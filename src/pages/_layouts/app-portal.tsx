import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useState } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
} from 'react-router-dom'

import { ThemeToggle } from '@/components/theme/theme-toggle'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  getBasePathByRole,
  getRoleFromPath,
  useSession,
} from '@/lib/auth/session'
import { AppPortalAside } from '@/pages/app-portal/app-portal-aside'
import { AppPortalHeader } from '@/pages/app-portal/app-portal-header'
import {
  type AppPortalRole,
  type AppPortalUser,
  canAccessAppPortalPath,
} from '@/pages/app-portal/app-portal-navigation'
import type { RouteHandle } from '@/routes'

// ─── Outlet context (exportado para as páginas filhas) ────────────────────────

export interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function PortalSkeleton() {
  return (
    <div className="flex min-h-screen antialiased">
      <aside className="border-border hidden w-60 animate-pulse border-r bg-card lg:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-card border-border sticky top-0 z-40 h-16 border-b" />
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8">
          <div className="space-y-4">
            <div className="bg-muted h-8 w-48 animate-pulse rounded" />
            <div className="bg-muted h-4 w-96 animate-pulse rounded" />
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function AppPortalLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { status, user, signOut } = useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const matches = useMatches()

  // Aguarda hidratação do localStorage antes de redirecionar
  if (status === 'loading') {
    return <PortalSkeleton />
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to="/sign-in"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // status === 'authenticated'
  const roleFromUrl = getRoleFromPath(location.pathname)
  const basePath = getBasePathByRole(user!.role)

  // Redireciona se o usuário tentar acessar o portal de outro papel
  if (roleFromUrl !== user!.role) {
    return <Navigate to={basePath} replace />
  }

  if (!canAccessAppPortalPath(user!.role, location.pathname, basePath)) {
    return <Navigate to={basePath} replace />
  }

  const crumbMatches = matches.filter((m) => {
    const handle = m.handle as RouteHandle | undefined
    return typeof handle?.crumb !== 'undefined'
  })
  const breadcrumb = crumbMatches.map((m, i) => {
    const handle = m.handle as RouteHandle
    const label =
      typeof handle.crumb === 'function'
        ? handle.crumb(m.params as Record<string, string>)
        : (handle.crumb ?? '')
    const isLast = i === crumbMatches.length - 1
    return { label, href: isLast ? undefined : m.pathname }
  })

  const handleSignOut = () => {
    signOut()
    navigate('/sign-in', { replace: true })
  }

  const outletContext: AppPortalOutletContext = {
    role: user!.role,
    user: user!,
    basePath,
  }

  return (
    <div className="flex min-h-screen antialiased">
      <aside className="border-border hidden w-60 border-r lg:sticky lg:top-0 lg:block lg:h-screen lg:self-start">
        <AppPortalAside
          role={user!.role}
          basePath={basePath}
          userName={user!.name}
          userEmail={user!.email}
          onSignOut={handleSignOut}
        />
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-60 p-0 sm:max-w-60">
          <VisuallyHidden>
            <SheetTitle>Menu administrativo</SheetTitle>
            <SheetDescription>
              Navegação principal da área administrativa.
            </SheetDescription>
          </VisuallyHidden>

          <AppPortalAside
            role={user!.role}
            basePath={basePath}
            userName={user!.name}
            userEmail={user!.email}
            onNavigate={() => setMobileMenuOpen(false)}
            onSignOut={handleSignOut}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppPortalHeader
          breadcrumb={breadcrumb}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          actions={<ThemeToggle />}
        />
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
