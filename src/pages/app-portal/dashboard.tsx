import { useOutletContext } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  APP_PORTAL_ROLE_LABEL,
  type AppPortalRole,
  type AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

export function AppPortalDashboard() {
  const { role, basePath } = useOutletContext<AppPortalOutletContext>()

  return (
    <section className="space-y-3">
      <Badge variant="secondary">Mock habilitado no desenvolvimento</Badge>
      <h1 className="text-foreground text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground max-w-3xl text-sm">
        Portal de {APP_PORTAL_ROLE_LABEL[role]}. Prefixo de rota atual: `
        {basePath}`. Essa tela esta pronta para integracao futura com API e
        dados reais.
      </p>
    </section>
  )
}
