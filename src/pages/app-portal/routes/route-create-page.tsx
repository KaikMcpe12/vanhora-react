import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import {
  routeValuesToPayload,
  useCreateRoute,
} from '@/lib/api/mock-routes-api'
import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import type { RouteFormValues } from '@/lib/schemas/route-schema'
import type {
  AppPortalRole,
  AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

import { RouteForm } from './route-form'

interface AppPortalOutletContext {
  role: AppPortalRole
  user: AppPortalUser
  basePath: string
}

export function RouteCreatePage() {
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createRoute = useCreateRoute()

  // Redirecionamento inteligente: quando aberto a partir de uma cooperativa
  // (`?cooperative=<nome>`), o campo já vem preenchido.
  const cooperativeParam = searchParams.get('cooperative') ?? ''
  const matchedCoop = MOCK_ADMIN_COOPERATIVES.find(
    (c) => c.name === cooperativeParam,
  )

  const defaultValues: RouteFormValues = {
    name: '',
    code: '',
    cooperativeName: matchedCoop?.name ?? '',
    cooperativeId: matchedCoop?.id,
    origin: '',
    destination: '',
    price: 0,
    activeDays: [],
    driverName: '',
    status: 'active',
    stops: [],
  }

  const backToList = () => navigate(`${basePath}/routes`)

  const handleCreate = async (values: RouteFormValues) => {
    const created = await createRoute.mutateAsync(routeValuesToPayload(values))
    toast.success(`Rota "${created.name}" criada`)
    backToList()
  }

  return (
    <section>
      <RouteForm
        mode="create"
        defaultValues={defaultValues}
        isSubmitting={createRoute.isPending}
        onSubmit={handleCreate}
        onCancel={backToList}
      />
    </section>
  )
}
