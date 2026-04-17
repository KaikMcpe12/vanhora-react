import { useOutletContext } from 'react-router-dom'

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

interface SectionPlaceholderProps {
  title: string
  description: string
}

export function SectionPlaceholder({
  title,
  description,
}: SectionPlaceholderProps) {
  const { role } = useOutletContext<AppPortalOutletContext>()

  return (
    <section className="space-y-2">
      <h1 className="text-foreground text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground max-w-3xl text-sm">
        {description} Contexto atual: {APP_PORTAL_ROLE_LABEL[role]}.
      </p>
    </section>
  )
}
