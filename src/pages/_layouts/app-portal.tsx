import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useMemo, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { AppPortalAside } from '@/pages/app-portal/app-portal-aside'
import { AppPortalHeader } from '@/pages/app-portal/app-portal-header'
import {
  APP_PORTAL_MOCK_USERS,
  type AppPortalRole,
  type AppPortalUser,
  canAccessAppPortalPath,
  getAppPortalPageLabel,
} from '@/pages/app-portal/app-portal-navigation'

function getRoleFromBasePath(pathname: string): AppPortalRole | null {
  if (pathname.startsWith('/admin')) {
    return 'admin'
  }

  if (pathname.startsWith('/cooperative')) {
    return 'cooperative'
  }

  if (pathname.startsWith('/driver')) {
    return 'driver'
  }

  return null
}

function getBasePathByRole(role: AppPortalRole) {
  if (role === 'admin') {
    return '/admin'
  }

  if (role === 'cooperative') {
    return '/cooperative'
  }

  return '/driver'
}

function resolveAppPortalSession(pathname: string): AppPortalUser | null {
  if (!import.meta.env.DEV) {
    return null
  }

  const role = getRoleFromBasePath(pathname)
  if (!role) {
    return null
  }

  return APP_PORTAL_MOCK_USERS[role]
}

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

export function AppPortalLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const user = useMemo(
    () => resolveAppPortalSession(location.pathname),
    [location.pathname],
  )

  if (!user) {
    return <Navigate to="/sign-in" replace />
  }

  const basePath = getBasePathByRole(user.role)

  if (!canAccessAppPortalPath(user.role, location.pathname, basePath)) {
    return <Navigate to={basePath} replace />
  }

  const pageTitle = getAppPortalPageLabel(
    location.pathname,
    user.role,
    basePath,
  )
  const breadcrumb = `Portal > ${pageTitle}`

  const handleSignOut = () => {
    navigate('/sign-in')
  }

  const outletContext: AppPortalOutletContext = {
    role: user.role,
    user,
    basePath,
  }

  return (
    <div className="bg-muted/40 flex min-h-screen antialiased">
      <aside className="border-border hidden w-64 border-r lg:sticky lg:top-0 lg:block lg:h-screen lg:self-start">
        <AppPortalAside
          role={user.role}
          basePath={basePath}
          userName={user.name}
          userEmail={user.email}
          onSignOut={handleSignOut}
        />
      </aside>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
          <VisuallyHidden>
            <SheetTitle>Menu administrativo</SheetTitle>
            <SheetDescription>
              Navegacao principal da area administrativa.
            </SheetDescription>
          </VisuallyHidden>

          <AppPortalAside
            role={user.role}
            basePath={basePath}
            userName={user.name}
            userEmail={user.email}
            onNavigate={() => setMobileMenuOpen(false)}
            onSignOut={handleSignOut}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppPortalHeader
          role={user.role}
          userName={user.name}
          title={pageTitle}
          breadcrumb={breadcrumb}
          basePath={basePath}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
