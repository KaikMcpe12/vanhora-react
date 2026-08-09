import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'

import { RouteErrorElement } from './components/error-boundary'

// wrapper raiz que provê o adaptador de nuqs para todas as rotas
function NuqsRouteWrapper() {
  return (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  )
}

export interface RouteHandle {
  crumb?: string | ((params: Record<string, string>) => string)
}

/**
 * Redireciona URLs legadas em PT-BR para os equivalentes em inglês.
 * Remover após sunset (6 meses sem hits ou quando analytics confirmar desuso).
 * /routes/nova     → /routes/new
 * /routes/:id/editar → /routes/:id/edit
 */
function LegacyRedirect() {
  const { pathname, search } = useLocation()
  const newPath = pathname.replace('/nova', '/new').replace('/editar', '/edit')
  return <Navigate to={newPath + search} replace />
}
import { AppPortalLayout } from './pages/_layouts/app-portal'
import { AuthLayout } from './pages/_layouts/auth'
import { Home } from './pages/_layouts/home'
import { NotFound } from './pages/404'
import { AdminCitiesPage } from './pages/app-portal/admin/cities'
import { AdminComponentsPreviewPage } from './pages/app-portal/admin/components-preview'
import { AdminCooperativesPage } from './pages/app-portal/admin/cooperatives/cooperatives-page'
import { AdminDashboardPage } from './pages/app-portal/admin/dashboard'
import { AdminDelaysPage } from './pages/app-portal/admin/delays'
import { AdminRoutesPage } from './pages/app-portal/admin/routes'
import { AdminSchedulesPage } from './pages/app-portal/admin/schedules'
import { AdminUsersPage } from './pages/app-portal/admin/users'
import { CooperativeDashboardPage } from './pages/app-portal/cooperative/dashboard'
import { CooperativeDelaysPage } from './pages/app-portal/cooperative/delays'
import { CooperativeMyCooperativePage } from './pages/app-portal/cooperative/my-cooperative'
import { CooperativeRoutesPage } from './pages/app-portal/cooperative/routes'
import { CooperativeSchedulesPage } from './pages/app-portal/cooperative/schedules'
import { CooperativeUsersPage } from './pages/app-portal/cooperative/users'
import { DriverDashboardPage } from './pages/app-portal/driver/dashboard'
import { DriverProfilePage } from './pages/app-portal/driver/me'
import { DriverMyRoutesPage } from './pages/app-portal/driver/my-routes'
import { DriverMySchedulesPage } from './pages/app-portal/driver/my-schedules'
import { DriverReportDelayPage } from './pages/app-portal/driver/report-delay'
import { RouteCreatePage } from './pages/app-portal/routes/route-create-page'
import { RouteEditPage } from './pages/app-portal/routes/route-edit-page'
import { SignIn } from './pages/auth/sign-in'
import { About } from './pages/home/about/about'
import { Author } from './pages/home/author/author'
import { CooperativeDetail } from './pages/home/cooperatives/cooperative-detail'
import { Cooperatives } from './pages/home/cooperatives/cooperatives'
import { HomePage } from './pages/home/homepage/homepage'
import { RouteDetail } from './pages/home/routes/route-detail'
import { Favorites } from './pages/home/schedules/favorites/favorites'
import { Schedules } from './pages/home/schedules/schedules'

export const router = createBrowserRouter([
  {
    element: <NuqsRouteWrapper />,
    children: [
  {
    path: '/',
    element: <Home />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'author',
        element: <Author />,
      },
      {
        path: 'schedules',
        children: [
          {
            index: true,
            element: <Schedules />,
          },
          {
            path: 'favorites',
            element: <Favorites />,
          },
        ],
      },
      {
        path: 'cooperatives',
        children: [
          {
            index: true,
            element: <Cooperatives />,
          },
          {
            path: ':id',
            element: <CooperativeDetail />,
          },
        ],
      },
      {
        path: 'routes',
        children: [
          {
            path: ':id',
            element: <RouteDetail />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: 'sign-in',
        element: <SignIn />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AppPortalLayout />,
    errorElement: <RouteErrorElement />,
    handle: { crumb: 'Início' } satisfies RouteHandle,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
        handle: { crumb: 'Dashboard' } satisfies RouteHandle,
      },
      {
        path: 'cities',
        element: <AdminCitiesPage />,
        handle: { crumb: 'Cidades' } satisfies RouteHandle,
      },
      {
        path: 'schedules',
        element: <AdminSchedulesPage />,
        handle: { crumb: 'Horários' } satisfies RouteHandle,
      },
      {
        path: 'routes',
        handle: { crumb: 'Rotas' } satisfies RouteHandle,
        children: [
          { index: true, element: <AdminRoutesPage /> },
          {
            path: 'new',
            element: <RouteCreatePage />,
            handle: { crumb: 'Nova Rota' } satisfies RouteHandle,
          },
          {
            path: ':id/edit',
            element: <RouteEditPage />,
            handle: { crumb: 'Editar Rota' } satisfies RouteHandle,
          },
          // Redirects legados — remover após sunset
          { path: 'nova', element: <LegacyRedirect /> },
          { path: ':id/editar', element: <LegacyRedirect /> },
        ],
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
        handle: { crumb: 'Usuários' } satisfies RouteHandle,
      },
      {
        path: 'cooperatives',
        element: <AdminCooperativesPage />,
        handle: { crumb: 'Cooperativas' } satisfies RouteHandle,
      },
      {
        path: 'delays',
        element: <AdminDelaysPage />,
        handle: { crumb: 'Atrasos' } satisfies RouteHandle,
      },
      ...(import.meta.env.DEV
        ? [
            {
              path: 'components-preview',
              element: <AdminComponentsPreviewPage />,
              handle: { crumb: 'Componentes' } satisfies RouteHandle,
            },
          ]
        : []),
    ],
  },
  {
    path: '/cooperative',
    element: <AppPortalLayout />,
    errorElement: <RouteErrorElement />,
    handle: { crumb: 'Início' } satisfies RouteHandle,
    children: [
      {
        index: true,
        element: <CooperativeDashboardPage />,
        handle: { crumb: 'Dashboard' } satisfies RouteHandle,
      },
      {
        path: 'my-cooperative',
        element: <CooperativeMyCooperativePage />,
        handle: { crumb: 'Minha Cooperativa' } satisfies RouteHandle,
      },
      {
        path: 'users',
        element: <CooperativeUsersPage />,
        handle: { crumb: 'Usuários' } satisfies RouteHandle,
      },
      {
        path: 'routes',
        handle: { crumb: 'Rotas' } satisfies RouteHandle,
        children: [
          { index: true, element: <CooperativeRoutesPage /> },
          {
            path: 'new',
            element: <RouteCreatePage />,
            handle: { crumb: 'Nova Rota' } satisfies RouteHandle,
          },
          {
            path: ':id/edit',
            element: <RouteEditPage />,
            handle: { crumb: 'Editar Rota' } satisfies RouteHandle,
          },
          // Redirects legados — remover após sunset
          { path: 'nova', element: <LegacyRedirect /> },
          { path: ':id/editar', element: <LegacyRedirect /> },
        ],
      },
      {
        path: 'schedules',
        element: <CooperativeSchedulesPage />,
        handle: { crumb: 'Horários' } satisfies RouteHandle,
      },
      {
        path: 'delays',
        element: <CooperativeDelaysPage />,
        handle: { crumb: 'Atrasos' } satisfies RouteHandle,
      },
    ],
  },
  {
    path: '/driver',
    element: <AppPortalLayout />,
    errorElement: <RouteErrorElement />,
    handle: { crumb: 'Início' } satisfies RouteHandle,
    children: [
      {
        index: true,
        element: <DriverDashboardPage />,
        handle: { crumb: 'Dashboard' } satisfies RouteHandle,
      },
      {
        path: 'me',
        element: <DriverProfilePage />,
        handle: { crumb: 'Meu Perfil' } satisfies RouteHandle,
      },
      {
        path: 'my-routes',
        element: <DriverMyRoutesPage />,
        handle: { crumb: 'Minhas Rotas' } satisfies RouteHandle,
      },
      {
        path: 'my-schedules',
        element: <DriverMySchedulesPage />,
        handle: { crumb: 'Meus Horários' } satisfies RouteHandle,
      },
      {
        path: 'report-delay',
        element: <DriverReportDelayPage />,
        handle: { crumb: 'Reportar Atraso' } satisfies RouteHandle,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
  ], // fim do children do NuqsRouteWrapper
  },
])
