import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
})

export const env = envSchema.parse(import.meta.env)
