import { ArrowLeft } from 'lucide-react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  routeValuesToPayload,
  useRoute,
  useUpdateRoute,
} from '@/lib/api/mock-routes-api'
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

export function RouteEditPage() {
  const { id } = useParams<{ id: string }>()
  const { basePath } = useOutletContext<AppPortalOutletContext>()
  const navigate = useNavigate()

  const { data: route, isLoading } = useRoute(id)
  const updateRoute = useUpdateRoute()

  const backToList = () => navigate(`${basePath}/routes`)

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </section>
    )
  }

  if (!route) {
    return (
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Rota não encontrada.</p>
        <Button variant="outline" size="sm" onClick={backToList}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para rotas
        </Button>
      </section>
    )
  }

  const defaultValues: RouteFormValues = {
    name: route.name,
    code: route.code,
    cooperativeName: route.cooperativeName,
    cooperativeId: route.cooperativeId,
    origin: route.origin,
    destination: route.destination,
    price: route.price,
    activeDays: [...route.activeDays],
    driverName: route.driverName ?? '',
    status: route.status,
    stops: route.stops.map((s) => ({ city: s.city, time: s.time ?? '' })),
  }

  const handleSave = async (values: RouteFormValues) => {
    await updateRoute.mutateAsync({ id: route.id, payload: routeValuesToPayload(values) })
    toast.success(`Rota "${values.name}" atualizada`)
    backToList()
  }

  return (
    <section>
      <RouteForm
        mode="edit"
        defaultValues={defaultValues}
        isSubmitting={updateRoute.isPending}
        onSubmit={handleSave}
        onCancel={backToList}
        routeCode={route.code}
        scheduleCount={route.scheduleCount}
        onManageSchedules={() => navigate(`${basePath}/schedules?route=${route.code}`)}
      />
    </section>
  )
}
