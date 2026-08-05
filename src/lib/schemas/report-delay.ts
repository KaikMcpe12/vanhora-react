import { z } from 'zod'

export const reportDelaySchema = z.object({
  routeId: z.string().min(1, 'Selecione uma rota'),
  delayMinutes: z
    .number({ invalid_type_error: 'Informe os minutos de atraso' })
    .int('Deve ser um número inteiro')
    .min(1, 'Mínimo 1 minuto')
    .max(999, 'Máximo 999 minutos'),
  severity: z.enum(['low', 'medium', 'high'], {
    required_error: 'Selecione a severidade',
  }),
  reason: z
    .string()
    .min(10, 'Descreva o motivo com pelo menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
})

export type ReportDelaySchema = z.infer<typeof reportDelaySchema>
