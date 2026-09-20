import { z } from 'zod'

import { MOCK_ADMIN_CITIES } from '@/lib/data/mock-admin-cities'

// UFs válidas (contrato api-spec.md §3.6 — cidade nunca sem estado).
const UF_VALUES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const UF_OPTIONS = UF_VALUES

/**
 * Schema base (sem checagem de duplicata). Use `cityFormSchema(ignoreId?)`
 * quando quiser validar contra o mock atual (superRefine olha o snapshot no
 * momento da chamada — em produção o back cobra 409 `CITY_CONFLICT`).
 */
export const cityFormBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(80, 'Nome muito longo'),
  state: z.enum(UF_VALUES, { error: 'Estado inválido' }),
})

export type CityFormValues = z.infer<typeof cityFormBaseSchema>

/**
 * Fábrica de schema com validação de duplicata `(name, state)`. Recebe o id
 * a ser ignorado (edição da própria cidade). Simula o 409 CITY_CONFLICT do
 * back — no mock consulta MOCK_ADMIN_CITIES no momento do parse.
 */
export function cityFormSchema(ignoreId?: string) {
  return cityFormBaseSchema.superRefine((data, ctx) => {
    const norm = (s: string) => s.trim().toLowerCase()
    const dup = MOCK_ADMIN_CITIES.find(
      (c) =>
        c.id !== ignoreId &&
        norm(c.name) === norm(data.name) &&
        c.state === data.state,
    )
    if (dup) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: `Já existe uma cidade com este nome em ${data.state}.`,
      })
    }
  })
}
