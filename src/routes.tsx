import { createBrowserRouter } from 'react-router-dom'

import { AdminLayout } from './pages/_layouts/admin'
import { AppLayout } from './pages/_layouts/app'
import { AuthLayout } from './pages/_layouts/auth'
import { Home } from './pages/_layouts/home'
import { NotFound } from './pages/404'
import { Dashboard } from './pages/app/dashboard'
import { AdminDashboard } from './pages/auth/admin/dashboard'
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
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'cities',
        element: <AdminDashboard />,
      },
      {
        path: 'schedules',
        element: <AdminDashboard />,
      },
      {
        path: 'routes',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <AdminDashboard />,
      },
      {
        path: 'cooperatives',
        element: <AdminDashboard />,
      },
      {
        path: 'my-cooperative',
        element: <AdminDashboard />,
      },
      {
        path: 'me',
        element: <AdminDashboard />,
      },
      {
        path: 'delays',
        element: <AdminDashboard />,
      },
      {
        path: 'my-routes',
        element: <AdminDashboard />,
      },
      {
        path: 'my-schedules',
        element: <AdminDashboard />,
      },
      {
        path: 'report-delay',
        element: <AdminDashboard />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
])
