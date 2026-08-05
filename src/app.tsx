import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { AppErrorBoundary } from './components/error-boundary'
import { ThemeProvider } from './components/theme/theme-provider'
import { Toaster } from './components/ui/sonner'
import { SessionProvider } from './lib/auth/session'
import { queryClient } from './lib/react-query'
import { router } from './routes'

export function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vanhora-theme">
        <SessionProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
          </QueryClientProvider>
        </SessionProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  )
}
