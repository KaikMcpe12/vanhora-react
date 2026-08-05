import type { ReactNode } from 'react'

import { type ActionKey, can, type ResourceKey } from '@/lib/permissions'
import type { AppPortalRole } from '@/pages/app-portal/app-portal-navigation'

interface CanProps {
  /** Papel do usuário autenticado */
  role: AppPortalRole
  /** Recurso a verificar (ex: 'routes', 'users') */
  resource: ResourceKey
  /** Ação a verificar (ex: 'create', 'delete') */
  action: ActionKey
  /** Conteúdo renderizado quando a permissão é concedida */
  children: ReactNode
  /** Conteúdo alternativo quando a permissão é negada (padrão: null) */
  fallback?: ReactNode
}

/**
 * Renderiza `children` somente se o `role` tiver permissão para
 * executar `action` no `resource`. Caso contrário renderiza `fallback`.
 *
 * @example
 *   <Can role={role} resource="routes" action="create">
 *     <Button>Nova Rota</Button>
 *   </Can>
 *
 *   <Can role={role} resource="cooperatives" action="delete" fallback={<p>Sem acesso</p>}>
 *     <DeleteButton />
 *   </Can>
 */
export function Can({
  role,
  resource,
  action,
  children,
  fallback = null,
}: CanProps) {
  if (!can(role, resource, action)) return <>{fallback}</>
  return <>{children}</>
}
