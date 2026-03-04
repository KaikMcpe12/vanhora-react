import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from './pages/_layouts/app'
import { AuthLayout } from './pages/_layouts/auth'
import { Home } from './pages/_layouts/home'
import { NotFound } from './pages/404'
import { Dashboard } from './pages/app/dashboard'
import { SignIn } from './pages/auth/sign-in'
import { HomePage } from './pages/home/homepage/homepage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    children: [
      {
        index: true,
        element: <HomePage />,
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
    path: '*',
    element: <NotFound />,
  },
])
