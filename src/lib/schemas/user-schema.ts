import { z } from 'zod'

export const createUserSchema = z
  .object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    role: z.enum(['admin', 'cooperative', 'driver']),
    cooperativeId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      // driver and cooperative roles require cooperativeId
      if (data.role === 'driver' || data.role === 'cooperative') {
        return data.cooperativeId && data.cooperativeId.trim().length > 0
      }
      return true
    },
    {
      message: 'Cooperativa é obrigatória para este role',
      path: ['cooperativeId'],
    },
  )
  .refine(
    (data) => {
      // admin role should not have cooperativeId
      if (data.role === 'admin') {
        return !data.cooperativeId || data.cooperativeId === ''
      }
      return true
    },
    {
      message: 'Admin não pode ter cooperativa vinculada',
      path: ['cooperativeId'],
    },
  )

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid('ID inválido'),
  newStatus: z.enum(['active', 'inactive']),
})

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>

export const listUsersFilterSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['admin', 'cooperative', 'driver']).optional(),
  cooperativeId: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
})

export type ListUsersFilter = z.infer<typeof listUsersFilterSchema>
