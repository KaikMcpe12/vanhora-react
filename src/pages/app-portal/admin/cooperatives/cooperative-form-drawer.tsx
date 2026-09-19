import { zodResolver } from '@hookform/resolvers/zod'
import { Globe, ImageIcon } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AdminSectionTitle } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PhoneField } from '@/components/ui/phone-field'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { useFormDialogState } from '@/hooks/use-form-dialog-state'
import {
  type CreateCooperativePayload,
  useCreateCooperative,
  useUpdateCooperative,
} from '@/lib/api/mock-cooperatives-api'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import {
  cooperativeFormSchema,
  type CooperativeFormValues,
} from '@/lib/schemas/cooperative-schema'

interface CooperativeFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cooperative?: AdminCooperative | null
  /** chamado com a cooperativa recém-criada — usado para selecioná-la na lista */
  onCreated?: (cooperative: AdminCooperative) => void
}

function toDefaults(
  cooperative?: AdminCooperative | null,
): CooperativeFormValues {
  return {
    name: cooperative?.name ?? '',
    phone: cooperative?.phone ?? '',
    site: cooperative?.site ?? '',
    logoUrl: cooperative?.logoUrl ?? '',
    brandColor: cooperative?.brandColor ?? '#1A5FA8',
    description: cooperative?.description ?? '',
  }
}

export function CooperativeFormDrawer({
  open,
  onOpenChange,
  cooperative,
  onCreated,
}: CooperativeFormDrawerProps) {
  const isEdit = !!cooperative

  const createCoop = useCreateCooperative()
  const updateCoop = useUpdateCooperative()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CooperativeFormValues>({
    resolver: zodResolver(cooperativeFormSchema),
    defaultValues: toDefaults(cooperative),
  })

  // Sincroniza os campos quando o drawer abre (inclui aberturas programáticas).
  useFormDialogState(open, cooperative, (c) => reset(toDefaults(c)))

  const submit = handleSubmit(async (values) => {
    const payload: CreateCooperativePayload = values
    try {
      if (isEdit && cooperative) {
        await updateCoop.mutateAsync({ id: cooperative.id, payload })
        toast.success(`Cooperativa "${values.name}" atualizada`)
      } else {
        const created = await createCoop.mutateAsync(payload)
        toast.success(`Cooperativa "${values.name}" criada`)
        onCreated?.(created)
      }
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado',
      )
    }
  })

  const isPending = createCoop.isPending || updateCoop.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-[15px] font-medium">
            {isEdit ? 'Editar cooperativa' : 'Nova cooperativa'}
          </SheetTitle>
        </SheetHeader>

        <form
          id="cooperative-form"
          onSubmit={submit}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4"
        >
          <div className="space-y-4">
            <AdminSectionTitle title="Identificação" />
            <div className="space-y-1.5">
              <Label className="text-[13px]">Nome *</Label>
              <Input
                {...register('name')}
                placeholder="Ex: Cooperativa Nordeste"
                aria-invalid={!!errors.name}
                className="text-sm"
              />
              {errors.name && (
                <p className="text-destructive text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Cor da marca</Label>
              <Controller
                name="brandColor"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="border-border h-9 w-12 cursor-pointer rounded-md border p-0.5"
                    />
                    <Input
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="#1A5FA8"
                      aria-invalid={!!errors.brandColor}
                      className="font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                )}
              />
              {errors.brandColor && (
                <p className="text-destructive text-xs">
                  {errors.brandColor.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Descrição (opcional)</Label>
              <Textarea
                {...register('description')}
                placeholder="Breve descrição da cooperativa..."
                className="resize-none text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <AdminSectionTitle title="Contato" />
            <div className="space-y-1.5">
              <Label className="text-[13px]">Telefone *</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneField
                    value={field.value}
                    onChange={field.onChange}
                    invalid={!!errors.phone}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-destructive text-xs">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Site (opcional)</Label>
              <div className="border-input bg-background flex items-center gap-2 rounded-md border px-3">
                <Globe className="text-muted-foreground h-4 w-4" />
                <Input
                  {...register('site')}
                  placeholder="https://..."
                  type="url"
                  className="border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                />
              </div>
              {errors.site && (
                <p className="text-destructive text-xs">
                  {errors.site.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">URL do logotipo (opcional)</Label>
              <div className="border-input bg-background flex items-center gap-2 rounded-md border px-3">
                <ImageIcon className="text-muted-foreground h-4 w-4" />
                <Input
                  {...register('logoUrl')}
                  placeholder="https://..."
                  className="border-0 bg-transparent px-0 text-sm focus-visible:ring-0"
                />
              </div>
              {errors.logoUrl && (
                <p className="text-destructive text-xs">
                  {errors.logoUrl.message}
                </p>
              )}
            </div>
          </div>
        </form>

        <SheetFooter className="border-border border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" form="cooperative-form" disabled={isPending}>
            {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
