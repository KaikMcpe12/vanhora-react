import { useOutletContext } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { ADMIN_ROLE_LABEL, type AdminRole } from '@/lib/config/admin-navigation'

interface AdminOutletContext {
  role: AdminRole
}

export function AdminDashboard() {
  const { role } = useOutletContext<AdminOutletContext>()

  return (
    <section className="space-y-3">
      <Badge variant="secondary">Layout pronto</Badge>
      <h1 className="text-foreground text-2xl font-semibold">
        Area administrativa
      </h1>
      <p className="text-muted-foreground max-w-2xl text-sm">
        Este espaco usa menu lateral por permissao. Role atual:{' '}
        {ADMIN_ROLE_LABEL[role]}. Para testar outra role, abra
        `/admin?role=admin`, `/admin?role=cooperative` ou `/admin?role=driver`.
      </p>
    </section>
  )
}
