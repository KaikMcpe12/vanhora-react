import { z } from 'zod'

const optionalUrl = z
  .string()
  .refine((v) => v === '' || /^https?:\/\/.+/.test(v), 'URL inválida (use http:// ou https://)')

export const cooperativeFormSchema = z.object({
  name: z.string().min(2, 'Informe o nome da cooperativa'),
  phone: z.string().min(8, 'Informe um telefone válido'),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida (use o formato #RRGGBB)'),
  site: optionalUrl,
  logoUrl: optionalUrl,
  description: z.string(),
})

export type CooperativeFormValues = z.infer<typeof cooperativeFormSchema>
