import { z } from 'zod'

export const DELAY_CAUSES = [
  'traffic',
  'mechanical',
  'accident',
  'weather',
  'passengers',
  'other',
] as const

export type DelayCause = (typeof DELAY_CAUSES)[number]

export const reportDelaySchema = z.object({
  routeId: z.string().min(1, 'Selecione uma rota'),
  scheduleId: z.string().optional(),
  cause: z.enum(DELAY_CAUSES, {
    error: 'Selecione a causa do atraso',
  }),
  delayMinutes: z
    .number({ error: 'Informe os minutos de atraso' })
    .int('Deve ser um número inteiro')
    .min(1, 'Mínimo 1 minuto')
    .max(999, 'Máximo 999 minutos'),
  // severidade é DERIVADA dos minutos (severityFromMinutes) — não é campo do form
  reason: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export type ReportDelaySchema = z.infer<typeof reportDelaySchema>
