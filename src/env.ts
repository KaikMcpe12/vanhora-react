import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  VITE_IPINFO_TOKEN: z.string().optional(),
  VITE_MOCK_USER_CITY: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
