import { createBrowserRouter } from 'react-router-dom'

import { AppPortalLayout } from './pages/_layouts/app-portal'
import { AuthLayout } from './pages/_layouts/auth'
import { Home } from './pages/_layouts/home'
import { NotFound } from './pages/404'
import { AdminCitiesPage } from './pages/app-portal/admin/cities'
import { AdminCooperativesPage } from './pages/app-portal/admin/cooperatives'
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
import { SignIn } from './pages/auth/sign-in'
import { About } from './pages/home/about/about'
import { Author } from './pages/home/author/author'
import { HomePage } from './pages/home/homepage/homepage'
import { Favorites } from './pages/home/schedules/favorites/favorites'
import { Schedules } from './pages/home/schedules/schedules'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
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
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
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
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'cities',
        element: <AdminCitiesPage />,
      },
      {
        path: 'schedules',
        element: <AdminSchedulesPage />,
      },
      {
        path: 'routes',
        element: <AdminRoutesPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
      {
        path: 'cooperatives',
        element: <AdminCooperativesPage />,
      },
      {
        path: 'delays',
        element: <AdminDelaysPage />,
      },
    ],
  },
  {
    path: '/cooperative',
    element: <AppPortalLayout />,
    children: [
      {
        index: true,
        element: <CooperativeDashboardPage />,
      },
      {
        path: 'my-cooperative',
        element: <CooperativeMyCooperativePage />,
      },
      {
        path: 'users',
        element: <CooperativeUsersPage />,
      },
      {
        path: 'routes',
        element: <CooperativeRoutesPage />,
      },
      {
        path: 'schedules',
        element: <CooperativeSchedulesPage />,
      },
      {
        path: 'delays',
        element: <CooperativeDelaysPage />,
      },
    ],
  },
  {
    path: '/driver',
    element: <AppPortalLayout />,
    children: [
      {
        index: true,
        element: <DriverDashboardPage />,
      },
      {
        path: 'me',
        element: <DriverProfilePage />,
      },
      {
        path: 'my-routes',
        element: <DriverMyRoutesPage />,
      },
      {
        path: 'my-schedules',
        element: <DriverMySchedulesPage />,
      },
      {
        path: 'report-delay',
        element: <DriverReportDelayPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
