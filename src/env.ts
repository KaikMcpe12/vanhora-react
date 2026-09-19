import { z } from 'zod'

const envSchema = z
  .object({
    VITE_API_URL: z.url().optional(),
    VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
    VITE_IPINFO_TOKEN: z.string().optional(),
    VITE_MOCK_USER_CITY: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const env = data.VITE_APP_ENV ?? 'development'
    if (env !== 'development' && !data.VITE_API_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['VITE_API_URL'],
        message: 'VITE_API_URL é obrigatória em ambientes staging e production.',
      })
    }
  })

export const env = envSchema.parse(import.meta.env)
