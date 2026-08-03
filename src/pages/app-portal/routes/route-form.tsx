import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  GripVertical,
  Info,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react'
import { type Control, Controller, useFieldArray, useForm } from 'react-hook-form'

import { AdminStat } from '@/components/admin'
import { CityPicker } from '@/components/city-picker'
import { DriverPicker } from '@/components/driver-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PriceField } from '@/components/ui/price-field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeField } from '@/components/ui/time-field'
import type { RouteRowStatus } from '@/lib/api/mock-routes-api'
import { MOCK_ADMIN_COOPERATIVES } from '@/lib/data/mock-admin-cooperatives'
import { routeFormSchema,type RouteFormValues } from '@/lib/schemas/route-schema'
import { cn } from '@/lib/utils'

const DAYS: { value: string; label: string }[] = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
  { value: 'dom', label: 'Dom' },
]

const STATUS_OPTIONS: { value: RouteRowStatus; label: string }[] = [
  { value: 'active', label: 'Ativa' },
  { value: 'suspended', label: 'Suspensa' },
  { value: 'inactive', label: 'Inativa' },
]

interface SortableStopRowProps {
  id: string
  index: number
  control: Control<RouteFormValues>
  onRemove: () => void
}

/** Linha de parada arrastável (@dnd-kit); o GripVertical é o handle de drag. */
function SortableStopRow({ id, index, control, onRemove }: SortableStopRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2',
        isDragging && 'relative z-10 opacity-80 shadow-lg',
      )}
    >
      <button
        type="button"
        aria-label="Reordenar parada"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
        {index + 1}
      </span>
      <Controller
        name={`stops.${index}.city`}
        control={control}
        render={({ field }) => (
          <CityPicker
            value={field.value}
            onChange={field.onChange}
            valueMode="name"
            placeholder="Cidade / parada"
            className="h-8 flex-1 rounded-lg"
          />
        )}
      />
      <Controller
        name={`stops.${index}.time`}
        control={control}
        render={({ field }) => (
          <TimeField
            value={field.value ?? ''}
            onChange={field.onChange}
            className="h-8 w-24"
          />
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

interface RouteFormProps {
  mode: 'create' | 'edit'
  defaultValues: RouteFormValues
  isSubmitting?: boolean
  onSubmit: (values: RouteFormValues) => void | Promise<void>
  onCancel: () => void
  /** Edição: código exibido no título. */
  routeCode?: string
  /** Edição: usados na aba Horários. */
  scheduleCount?: number
  onManageSchedules?: () => void
}

export function RouteForm({
  mode,
  defaultValues,
  isSubmitting = false,
  onSubmit,
  onCancel,
  routeCode,
  scheduleCount = 0,
  onManageSchedules,
}: RouteFormProps) {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues,
  })

  const { fields, append, remove, move } = useFieldArray({ control, name: 'stops' })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleStopsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex)
  }

  const origin = watch('origin')
  const activeDays = watch('activeDays')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="mb-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Rotas
          </button>
          <h1 className="text-foreground text-xl font-semibold">
            {mode === 'edit' ? (
              <>
                Editar Rota: <span className="font-mono">{routeCode}</span>
              </>
            ) : (
              'Nova Rota'
            )}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Configure as informações, paradas e horários desta rota.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Descartar
          </Button>
          <Button type="submit" size="sm" className="gap-1.5" disabled={isSubmitting}>
            {isSubmitting
              ? 'Salvando...'
              : mode === 'edit'
                ? 'Salvar alterações'
                : 'Criar rota'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="geral">
        <TabsList variant="line" className="w-full justify-start gap-1 border-b border-border">
          <TabsTrigger value="geral" className="gap-1.5 text-muted-foreground data-[state=active]:text-primary data-[state=active]:after:bg-primary">
            <Info className="h-4 w-4" />
            Informações Gerais
          </TabsTrigger>
          <TabsTrigger value="paradas" className="gap-1.5 text-muted-foreground data-[state=active]:text-primary data-[state=active]:after:bg-primary">
            <MapPin className="h-4 w-4" />
            Paradas
          </TabsTrigger>
          <TabsTrigger value="horarios" className="gap-1.5 text-muted-foreground data-[state=active]:text-primary data-[state=active]:after:bg-primary">
            <Clock className="h-4 w-4" />
            Horários
          </TabsTrigger>
        </TabsList>

        {/* Informações Gerais */}
        <TabsContent value="geral" className="pt-5">
          <div className="space-y-5 rounded-xl border border-border bg-card p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Nome da rota *</Label>
                <Input {...register('name')} aria-invalid={!!errors.name} className="text-sm" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Preço da passagem (R$)</Label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <PriceField value={field.value} onChange={field.onChange} invalid={!!errors.price} />
                  )}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Cooperativa *</Label>
                <Controller
                  name="cooperativeName"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        const coop = MOCK_ADMIN_COOPERATIVES.find((c) => c.name === v)
                        setValue('cooperativeId', coop?.id)
                      }}
                    >
                      <SelectTrigger className="text-sm" aria-invalid={!!errors.cooperativeName}>
                        <SelectValue placeholder="Selecione a cooperativa" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_ADMIN_COOPERATIVES.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.cooperativeName && (
                  <p className="text-xs text-destructive">{errors.cooperativeName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Motorista responsável</Label>
                <Controller
                  name="driverName"
                  control={control}
                  render={({ field }) => (
                    <DriverPicker value={field.value} onChange={field.onChange} placeholder="Nenhum" />
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Origem *</Label>
                <Controller
                  name="origin"
                  control={control}
                  render={({ field }) => (
                    <CityPicker
                      value={field.value}
                      onChange={field.onChange}
                      valueMode="name"
                      placeholder="Cidade de origem"
                    />
                  )}
                />
                {errors.origin && <p className="text-xs text-destructive">{errors.origin.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Destino *</Label>
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <CityPicker
                      value={field.value}
                      onChange={field.onChange}
                      valueMode="name"
                      placeholder="Cidade de destino"
                    />
                  )}
                />
                {errors.destination && (
                  <p className="text-xs text-destructive">{errors.destination.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px]">Dias ativos *</Label>
              <Controller
                name="activeDays"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                      const active = field.value.includes(day.value)
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              active
                                ? field.value.filter((d) => d !== day.value)
                                : [...field.value, day.value],
                            )
                          }
                          className={cn(
                            'h-8 min-w-[42px] rounded-full border px-2 text-xs font-medium transition-colors',
                            active
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-input text-muted-foreground hover:bg-accent',
                          )}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              />
              {errors.activeDays && (
                <p className="text-xs text-destructive">{errors.activeDays.message}</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Paradas */}
        <TabsContent value="paradas" className="pt-5">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-foreground">Sequência de paradas</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-full"
                  onClick={() => append({ city: '', time: '' })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar parada
                </Button>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleStopsDragEnd}
              >
                <SortableContext
                  items={fields.map((f) => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {fields.map((stop, index) => (
                      <SortableStopRow
                        key={stop.id}
                        id={stop.id}
                        index={index}
                        control={control}
                        onRemove={() => remove(index)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {fields.length === 0 && (
                <p className="py-4 text-center text-[13px] text-muted-foreground">
                  Nenhuma parada. Adicione a primeira.
                </p>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-card p-5">
              <p className="text-[13px] font-semibold text-foreground">Resumo da rota</p>
              <AdminStat label="Nº de paradas" value={fields.length} icon={MapPin} />
              <AdminStat label="Origem → Destino" value={`${origin || '—'}`} icon={MapPin} tone="success" />
            </div>
          </div>
        </TabsContent>

        {/* Horários */}
        <TabsContent value="horarios" className="pt-5">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-lg">
              <AdminStat label="Horários" value={scheduleCount} icon={Clock} />
              <AdminStat label="Dias ativos" value={activeDays.length} icon={CalendarDays} tone="success" />
            </div>
            {mode === 'edit' && onManageSchedules ? (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5">
                <p className="text-[13px] text-muted-foreground">
                  Os horários desta rota são gerenciados na página de Horários, já filtrada por esta rota.
                </p>
                <Button type="button" size="sm" className="gap-1.5" onClick={onManageSchedules}>
                  <Clock className="h-3.5 w-3.5" />
                  Gerenciar horários desta rota
                </Button>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-[13px] text-muted-foreground">
                  Salve a rota para começar a cadastrar horários.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </form>
  )
}
