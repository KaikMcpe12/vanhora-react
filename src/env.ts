import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url().optional(),
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
  // Token de autenticação do ipinfo.io (opcional — sem token usa tier gratuito)
  VITE_IPINFO_TOKEN: z.string().optional(),
  // Sobrescreve a cidade detectada por IP (útil para testar casos específicos)
  // Ex: VITE_MOCK_USER_CITY="Crateús" testa normalização de acento
  VITE_MOCK_USER_CITY: z.string().optional(),
})

export const env = envSchema.parse(import.meta.env)
