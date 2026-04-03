import { z } from 'zod'

/**
 * Schema de validação para filtros de horários
 * Inclui validações de dados e lógica de negócio
 */
export const scheduleFiltersSchema = z
  .object({
    // Filtros básicos - usando string vazia como padrão para melhor compatibilidade
    origin: z
      .string()
      .default('')
      .transform((val) => val?.trim() || ''),

    destination: z
      .string()
      .default('')
      .transform((val) => val?.trim() || ''),

    date: z
      .string()
      .default('')
      .refine(
        (date) => {
          if (!date) return true

          // ✅ Usar timezone local explicitamente para evitar problemas UTC
          const selectedDate = new Date(date + 'T00:00:00')
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          // ✅ Permite data de hoje (>=)
          return selectedDate >= today
        },
        {
          message: 'A data não pode ser no passado',
        },
      ),

    // Filtros avançados
    cooperative: z
      .string()
      .default('')
      .transform((val) => val?.trim() || ''),

    dayOfWeek: z
      .array(z.string())
      .default([])
      .refine(
        (days) => {
          const validDays = [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ]
          return days.every((day) => validDays.includes(day))
        },
        {
          message: 'Dias da semana inválidos',
        },
      ),

    priceMin: z
      .number()
      .min(0, 'O preço mínimo deve ser maior ou igual a 0')
      .max(1000, 'O preço mínimo não pode ser maior que R$ 1.000')
      .optional(),

    priceMax: z
      .number()
      .min(0, 'O preço máximo deve ser maior ou igual a 0')
      .max(1000, 'O preço máximo não pode ser maior que R$ 1.000')
      .optional(),

    minRating: z
      .number()
      .min(0, 'A avaliação mínima deve ser maior ou igual a 0')
      .max(5, 'A avaliação mínima não pode ser maior que 5')
      .optional(),
  })
  .refine(
    (data) => {
      // Validação cruzada: preço mínimo não pode ser maior que máximo
      if (data.priceMin && data.priceMax) {
        return data.priceMin <= data.priceMax
      }
      return true
    },
    {
      message: 'O preço mínimo não pode ser maior que o preço máximo',
      path: ['priceMin'],
    },
  )
  .refine(
    (data) => {
      // Validação: origem e destino não podem ser iguais
      if (data.origin && data.destination) {
        return data.origin.toLowerCase() !== data.destination.toLowerCase()
      }
      return true
    },
    {
      message: 'Origem e destino não podem ser iguais',
      path: ['destination'],
    },
  )
  .refine(
    (data) => {
      // Validação: pelo menos 1 campo básico deve estar preenchido
      return !!(data.origin || data.destination || data.date)
    },
    {
      message: 'Preencha pelo menos um campo para buscar',
      path: ['origin'], // Mostra erro no primeiro campo
    },
  )

export type ScheduleFiltersSchema = z.infer<typeof scheduleFiltersSchema>

/**
 * Valores padrão para resetar filtros
 * Data atual como padrão, dayOfWeek vazio para consistência com URL
 */
export function getDefaultFilters(): ScheduleFiltersSchema {
  const today = new Date()

  return {
    origin: '',
    destination: '',
    date: today.toISOString().split('T')[0], // YYYY-MM-DD format
    cooperative: '',
    dayOfWeek: [], // Vazio por padrão - consistente com URL sem parâmetro
    priceMin: undefined,
    priceMax: undefined,
    minRating: undefined,
  }
}

/**
 * Helper para converter ScheduleFiltersSchema para URLSearchParams
 */
export function filtersToSearchParams(
  filters: ScheduleFiltersSchema,
): URLSearchParams {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','))
        }
      } else {
        params.set(key, String(value))
      }
    }
  })

  return params
}

/**
 * Helper para converter URLSearchParams para ScheduleFiltersSchema
 */
export function searchParamsToFilters(
  searchParams: URLSearchParams,
): ScheduleFiltersSchema {
  const rawData = {
    origin: searchParams.get('origin') || '',
    destination: searchParams.get('destination') || '',
    date: searchParams.get('date') || '',
    cooperative: searchParams.get('cooperative') || '',
    dayOfWeek: searchParams.get('dayOfWeek')?.split(',').filter(Boolean) || [],
    priceMin: searchParams.get('priceMin')
      ? Number(searchParams.get('priceMin'))
      : undefined,
    priceMax: searchParams.get('priceMax')
      ? Number(searchParams.get('priceMax'))
      : undefined,
    minRating: searchParams.get('minRating')
      ? Number(searchParams.get('minRating'))
      : undefined,
  }

  // Parse com schema para garantir validação
  const result = scheduleFiltersSchema.safeParse(rawData)

  if (result.success) {
    return result.data
  }

  // Se houver erro na validação, retorna valores padrão
  console.warn('Erro ao parsear filtros da URL:', result.error)
  return getDefaultFilters()
}
