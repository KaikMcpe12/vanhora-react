import { z } from 'zod'

/** schema de validação para filtros de horários */
export const scheduleFiltersSchema = z
  .object({
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

          // usa timezone local para evitar problemas utc
          const selectedDate = new Date(date + 'T00:00:00')
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          return selectedDate >= today
        },
        {
          message: 'A data não pode ser no passado',
        },
      ),

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
      return !!(data.origin || data.destination || data.date)
    },
    {
      message: 'Preencha pelo menos um campo para buscar',
      path: ['origin'],
    },
  )

export type ScheduleFiltersSchema = z.infer<typeof scheduleFiltersSchema>

/** valores padrão para resetar filtros */
export function getDefaultFilters(): ScheduleFiltersSchema {
  const today = new Date()

  return {
    origin: '',
    destination: '',
    date: today.toISOString().split('T')[0],
    cooperative: '',
    dayOfWeek: [],
    priceMin: undefined,
    priceMax: undefined,
    minRating: undefined,
  }
}

/** converte schedulefilterschema para urlsearchparams */
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

/** converte urlsearchparams para schedulefiltersschema */
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

  const result = scheduleFiltersSchema.safeParse(rawData)

  if (result.success) {
    return result.data
  }

  // se houver erro na validação, retorna valores padrão
  console.warn('Erro ao parsear filtros da URL:', result.error)
  return getDefaultFilters()
}
