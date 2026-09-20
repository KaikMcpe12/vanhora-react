import { z } from 'zod'

/** hh:mm 24h — usado também no schedule-form-schema. */
export const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

export const routeStopSchema = z.object({
  city: z.string().min(1, 'Informe a cidade da parada'),
  time: z
    .string()
    .refine((v) => v === '' || TIME_REGEX.test(v), 'Horário inválido (hh:mm)')
    .optional(),
})

export const routeFormSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    code: z.string(),
    cooperativeId: z.string().uuid('Selecione a cooperativa'),
    origin: z.string().min(1, 'Informe a origem'),
    destination: z.string().min(1, 'Informe o destino'),
    price: z.number().min(0, 'Preço inválido'),
    activeDays: z.array(z.string()).min(1, 'Selecione ao menos um dia'),
    driverName: z.string().optional(),
    status: z.enum(['active', 'suspended', 'inactive']),
    stops: z.array(routeStopSchema),
  })
  .refine(
    (d) => !d.origin || !d.destination || d.origin.trim() !== d.destination.trim(),
    {
      message: 'Origem e destino devem ser diferentes',
      path: ['destination'],
    },
  )

export type RouteFormValues = z.infer<typeof routeFormSchema>
