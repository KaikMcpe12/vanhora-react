import { z } from 'zod'

import { TIME_REGEX } from './route-schema'

const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const

export const scheduleFormSchema = z.object({
  routeId: z.string().min(1, 'Selecione a rota'),
  departureTime: z.string().regex(TIME_REGEX, 'Horário inválido (hh:mm)'),
  activeDays: z.array(z.enum(DAYS)).min(1, 'Selecione ao menos um dia'),
  notes: z.string(),
})

export type ScheduleFormSchemaValues = z.infer<typeof scheduleFormSchema>
