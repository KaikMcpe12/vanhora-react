import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="flex gap-2 antialiased">
      <h1>App Layout</h1>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
