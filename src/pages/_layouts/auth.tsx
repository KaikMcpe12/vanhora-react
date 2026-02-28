import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1>Auth Layout</h1>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
