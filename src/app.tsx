import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from './components/theme/theme-provider'
import { router } from './routes'

export function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vanhora-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </>
  )
}
