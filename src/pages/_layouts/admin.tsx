import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useMemo, useState } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { AdminAside } from '@/components/admin/admin-aside'
import { AdminHeader } from '@/components/admin/admin-header'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { env } from '@/env'
import {
  ADMIN_MOCK_USERS,
  type AdminRole,
  type AdminUser,
  canAccessAdminPath,
  getAdminPageLabel,
  isAdminRole,
} from '@/lib/config/admin-navigation'

const ADMIN_ROLE_STORAGE_KEY = 'vanhora-admin-role'
const ADMIN_MOCK_AUTH_ENABLED =
  env.VITE_ADMIN_MOCK_AUTH === 'true' ||
  (env.VITE_ADMIN_MOCK_AUTH === undefined && import.meta.env.DEV)

function resolveMockAdminUser(searchParams: URLSearchParams): AdminUser | null {
  const roleFromSearch = searchParams.get('role')
  if (isAdminRole(roleFromSearch)) {
    localStorage.setItem(ADMIN_ROLE_STORAGE_KEY, roleFromSearch)
    return ADMIN_MOCK_USERS[roleFromSearch]
  }

  const roleFromStorage = localStorage.getItem(ADMIN_ROLE_STORAGE_KEY)
  if (isAdminRole(roleFromStorage)) {
    return ADMIN_MOCK_USERS[roleFromStorage]
  }

  return ADMIN_MOCK_USERS.admin
}

function resolveAdminSession(searchParams: URLSearchParams): AdminUser | null {
  if (ADMIN_MOCK_AUTH_ENABLED) {
    return resolveMockAdminUser(searchParams)
  }

  return null
}

interface AdminOutletContext {
  role: AdminRole
  user: AdminUser
}

export function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const user = useMemo(() => resolveAdminSession(searchParams), [searchParams])

  if (!user) {
    return <Navigate to="/sign-in" replace />
  }

  if (!canAccessAdminPath(user.role, location.pathname)) {
    return <Navigate to="/admin" replace />
  }

  const pageTitle = getAdminPageLabel(location.pathname, user.role)
  const breadcrumb = `Admin > ${pageTitle}`

  const handleSignOut = () => {
    localStorage.removeItem(ADMIN_ROLE_STORAGE_KEY)
    navigate('/sign-in')
  }

  const outletContext: AdminOutletContext = {
    role: user.role,
    user,
  }

  return (
    <div className="bg-muted/40 flex min-h-screen antialiased">
      <aside className="border-border hidden w-64 border-r lg:block">
        <AdminAside
          role={user.role}
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
          <AdminAside
            role={user.role}
            userName={user.name}
            userEmail={user.email}
            onNavigate={() => setMobileMenuOpen(false)}
            onSignOut={handleSignOut}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          role={user.role}
          userName={user.name}
          title={pageTitle}
          breadcrumb={breadcrumb}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
