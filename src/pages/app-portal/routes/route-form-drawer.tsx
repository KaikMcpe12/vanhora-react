import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type AdminRouteRow,
  routeValuesToPayload,
  useCreateRoute,
  useRoute,
  useUpdateRoute,
} from '@/lib/api/mock-routes-api'
import type { RouteFormValues } from '@/lib/schemas/route-schema'

import { RouteForm } from './route-form'

interface DrawerStateCreate {
  mode: 'create'
  defaults?: Partial<RouteFormValues>
  sourceCode?: string
}
interface DrawerStateEdit {
  mode: 'edit'
  id: string
}
export type RouteDrawerState = DrawerStateCreate | DrawerStateEdit | null

interface RouteFormDrawerProps {
  state: RouteDrawerState
  onClose: () => void
  basePath: string
  onSaved?: (saved: AdminRouteRow, wasCreate: boolean) => void
}

const EMPTY_DEFAULTS: RouteFormValues = {
  name: '',
  code: '',
  cooperativeId: '',
  origin: '',
  destination: '',
  price: 0,
  activeDays: [],
  driverName: '',
  status: 'active',
  stops: [],
}

export function RouteFormDrawer({
  state,
  onClose,
  basePath,
  onSaved,
}: RouteFormDrawerProps) {
  const open = state !== null
  const navigate = useNavigate()

  const editId = state?.mode === 'edit' ? state.id : undefined
  const { data: editRoute, isLoading: isLoadingEdit } = useRoute(editId)

  const createRoute = useCreateRoute()
  const updateRoute = useUpdateRoute()

  const defaultValues = useMemo<RouteFormValues>(() => {
    if (state?.mode === 'edit') {
      if (!editRoute) return EMPTY_DEFAULTS
      return {
        name: editRoute.name,
        code: editRoute.code,
        cooperativeId: editRoute.cooperativeId,
        origin: editRoute.origin,
        destination: editRoute.destination,
        price: editRoute.price,
        activeDays: [...editRoute.activeDays],
        driverName: editRoute.driverName ?? '',
        status: editRoute.status,
        stops: editRoute.stops.map((s) => ({
          city: s.city,
          time: s.time ?? '',
        })),
      }
    }
    if (state?.mode === 'create') {
      return { ...EMPTY_DEFAULTS, ...state.defaults }
    }
    return EMPTY_DEFAULTS
  }, [state, editRoute])

  const isEdit = state?.mode === 'edit'
  const routeCode =
    state?.mode === 'edit'
      ? editRoute?.code
      : state?.mode === 'create'
        ? state.sourceCode
        : undefined
  const scheduleCount =
    state?.mode === 'edit' ? (editRoute?.scheduleCount ?? 0) : 0
  const onManageSchedules =
    isEdit && editRoute
      ? () => navigate(`${basePath}/schedules?route=${editRoute.code}`)
      : undefined

  const handleSubmit = async (values: RouteFormValues) => {
    if (state?.mode === 'edit' && editRoute) {
      const saved = await updateRoute.mutateAsync({
        id: editRoute.id,
        payload: routeValuesToPayload(values),
      })
      onSaved?.(saved, false)
    } else if (state?.mode === 'create') {
      const saved = await createRoute.mutateAsync(routeValuesToPayload(values))
      onSaved?.(saved, true)
    }
  }

  const isPending = createRoute.isPending || updateRoute.isPending

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-2xl">
        <SheetHeader className="border-border border-b pb-3">
          <SheetTitle className="text-[15px] font-medium">
            {isEdit ? (
              <>
                Editar rota{' '}
                {routeCode && (
                  <span className="text-muted-foreground font-mono text-[13px]">
                    · {routeCode}
                  </span>
                )}
              </>
            ) : state?.sourceCode ? (
              <>
                Duplicar rota{' '}
                <span className="text-muted-foreground font-mono text-[13px]">
                  · {state.sourceCode}
                </span>
              </>
            ) : (
              'Nova rota'
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isEdit && isLoadingEdit ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : isEdit && !editRoute ? (
            <p className="text-muted-foreground text-sm">
              Rota não encontrada.
            </p>
          ) : (
            <RouteForm
              key={isEdit ? editRoute?.id : 'create'}
              mode={isEdit ? 'edit' : 'create'}
              defaultValues={defaultValues}
              isSubmitting={isPending}
              onSubmit={async (v) => {
                try {
                  await handleSubmit(v)
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : 'Ocorreu um erro ao salvar a rota.',
                    { duration: 5000 },
                  )
                }
              }}
              onCancel={onClose}
              routeCode={routeCode}
              scheduleCount={scheduleCount}
              onManageSchedules={onManageSchedules}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
