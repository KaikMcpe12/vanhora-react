import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h1>App Layout</h1>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
