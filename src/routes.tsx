import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from './pages/_layouts/app'
import { AppPortalLayout } from './pages/_layouts/app-portal'
import { AuthLayout } from './pages/_layouts/auth'
import { Home } from './pages/_layouts/home'
import { NotFound } from './pages/404'
import { Dashboard } from './pages/app/dashboard'
import { AdminCitiesPage } from './pages/app-portal/admin-cities'
import { CooperativeMyCooperativePage } from './pages/app-portal/cooperative-my-cooperative'
import { AppPortalDashboard } from './pages/app-portal/dashboard'
import { DriverProfilePage } from './pages/app-portal/driver-profile'
import { SectionPlaceholder } from './pages/app-portal/section-placeholder'
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
    path: '/app',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AppPortalLayout />,
    children: [
      {
        index: true,
        element: <AppPortalDashboard />,
      },
      {
        path: 'cities',
        element: <AdminCitiesPage />,
      },
      {
        path: 'schedules',
        element: (
          <SectionPlaceholder
            title="Horarios"
            description="CRUD de horarios para administradores."
          />
        ),
      },
      {
        path: 'routes',
        element: (
          <SectionPlaceholder
            title="Rotas"
            description="CRUD de rotas para administradores."
          />
        ),
      },
      {
        path: 'users',
        element: (
          <SectionPlaceholder
            title="Usuarios"
            description="Gestao de todos os usuarios da plataforma."
          />
        ),
      },
      {
        path: 'cooperatives',
        element: (
          <SectionPlaceholder
            title="Cooperativas"
            description="CRUD completo das cooperativas cadastradas."
          />
        ),
      },
      {
        path: 'delays',
        element: (
          <SectionPlaceholder
            title="Atrasos"
            description="Painel de visualizacao de atrasos reportados."
          />
        ),
      },
    ],
  },
  {
    path: '/cooperative',
    element: <AppPortalLayout />,
    children: [
      {
        index: true,
        element: <AppPortalDashboard />,
      },
      {
        path: 'my-cooperative',
        element: <CooperativeMyCooperativePage />,
      },
      {
        path: 'users',
        element: (
          <SectionPlaceholder
            title="Usuarios"
            description="Gestao de motoristas e funcionarios da cooperativa."
          />
        ),
      },
      {
        path: 'routes',
        element: (
          <SectionPlaceholder
            title="Rotas"
            description="CRUD de rotas vinculadas a cooperativa autenticada."
          />
        ),
      },
      {
        path: 'schedules',
        element: (
          <SectionPlaceholder
            title="Horarios"
            description="CRUD de horarios da cooperativa autenticada."
          />
        ),
      },
      {
        path: 'delays',
        element: (
          <SectionPlaceholder
            title="Atrasos"
            description="Visualizacao de atrasos das rotas da cooperativa."
          />
        ),
      },
    ],
  },
  {
    path: '/driver',
    element: <AppPortalLayout />,
    children: [
      {
        index: true,
        element: <AppPortalDashboard />,
      },
      {
        path: 'me',
        element: <DriverProfilePage />,
      },
      {
        path: 'my-routes',
        element: (
          <SectionPlaceholder
            title="Minhas Rotas"
            description="Rotas atribuidas ao motorista autenticado."
          />
        ),
      },
      {
        path: 'my-schedules',
        element: (
          <SectionPlaceholder
            title="Meus Horarios"
            description="Horarios do dia para acompanhamento do motorista."
          />
        ),
      },
      {
        path: 'report-delay',
        element: (
          <SectionPlaceholder
            title="Reportar Atraso"
            description="Registro de ocorrencias e atrasos em tempo real."
          />
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
