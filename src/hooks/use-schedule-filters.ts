import { zodResolver } from '@hookform/resolvers/zod'
import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'nuqs'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import {
  getDefaultFilters,
  type ScheduleFiltersSchema,
  scheduleFiltersSchema,
} from '@/lib/schemas/schedule-filters'

// parsers para os filtros de busca na url
const searchParsers = {
  origin: parseAsString.withDefault(''),
  destination: parseAsString.withDefault(''),
  date: parseAsString.withDefault(''),
  cooperative: parseAsString.withDefault(''),
  dayOfWeek: parseAsArrayOf(parseAsString).withDefault([]),
  priceMin: parseAsFloat,
  priceMax: parseAsFloat,
  minRating: parseAsFloat,
}

/** hook para gerenciar filtros de horários com sincronização url via nuqs */
export function useScheduleFilters() {
  const [filtersInUrl, setFiltersInUrl] = useQueryStates(searchParsers, {
    history: 'replace',
  })

  // param separado para resetar paginação ao mudar filtros
  const [, setPage] = useQueryState('page', parseAsInteger)

  // projeta o estado da url para o shape esperado pelo rhf e pelos hooks de query
  const filtersFromUrl: ScheduleFiltersSchema = useMemo(
    () => ({
      origin: filtersInUrl.origin,
      destination: filtersInUrl.destination,
      date: filtersInUrl.date,
      cooperative: filtersInUrl.cooperative,
      dayOfWeek: filtersInUrl.dayOfWeek,
      priceMin: filtersInUrl.priceMin ?? undefined,
      priceMax: filtersInUrl.priceMax ?? undefined,
      minRating: filtersInUrl.minRating ?? undefined,
    }),
    [filtersInUrl],
  )

  const form = useForm({
    resolver: zodResolver(scheduleFiltersSchema),
    defaultValues: filtersFromUrl,
    mode: 'onBlur' as const,
  })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = form

  const handleFilter = useCallback(
    (data: ScheduleFiltersSchema) => {
      void setFiltersInUrl({
        origin: data.origin || null,
        destination: data.destination || null,
        date: data.date || null,
        cooperative: data.cooperative || null,
        dayOfWeek: data.dayOfWeek?.length ? data.dayOfWeek : null,
        priceMin: data.priceMin ?? null,
        priceMax: data.priceMax ?? null,
        minRating: data.minRating ?? null,
      })
      // reseta paginação ao aplicar novos filtros
      void setPage(null)
    },
    [setFiltersInUrl, setPage],
  )

  const handleClearFilters = useCallback(() => {
    const defaultFilters = getDefaultFilters()
    reset(defaultFilters)
    void setFiltersInUrl({
      origin: null,
      destination: null,
      date: null,
      cooperative: null,
      dayOfWeek: null,
      priceMin: null,
      priceMax: null,
      minRating: null,
    })
    void setPage(null)
  }, [reset, setFiltersInUrl, setPage])

  const updateField = useCallback(
    (field: keyof ScheduleFiltersSchema, value: unknown) => {
      setValue(field, value as never, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  const activeFiltersCount = useMemo(() => {
    const defaultValues = getDefaultFilters()
    let count = 0

    Object.entries(filtersFromUrl).forEach(([key, value]) => {
      const typedKey = key as keyof ScheduleFiltersSchema
      const defaultValue = defaultValues[typedKey]

      if (Array.isArray(value)) {
        if (JSON.stringify(value) !== JSON.stringify(defaultValue)) count++
      } else if (value !== defaultValue && value !== undefined && value !== '') {
        count++
      }
    })

    return count
  }, [filtersFromUrl])

  const hasBasicFilters = useMemo(
    () => Boolean(filtersFromUrl.origin || filtersFromUrl.destination || filtersFromUrl.date),
    [filtersFromUrl],
  )

  const hasAdvancedFilters = useMemo(() => {
    const defaultFilters = getDefaultFilters()
    return Boolean(
      filtersFromUrl.cooperative ||
        JSON.stringify(filtersFromUrl.dayOfWeek) !== JSON.stringify(defaultFilters.dayOfWeek) ||
        filtersFromUrl.priceMin !== undefined ||
        filtersFromUrl.priceMax !== undefined ||
        filtersFromUrl.minRating !== undefined,
    )
  }, [filtersFromUrl])

  const advancedFilters = useMemo(
    () => ({
      cooperative: filtersFromUrl.cooperative,
      dayOfWeek: filtersFromUrl.dayOfWeek,
      priceMin: filtersFromUrl.priceMin,
      priceMax: filtersFromUrl.priceMax,
      minRating: filtersFromUrl.minRating,
    }),
    [filtersFromUrl],
  )

  const onSubmit = handleSubmit((data) => {
    handleFilter(data as ScheduleFiltersSchema)
  })

  return {
    register,
    control,
    errors,
    isSubmitting,
    watch,
    filtersFromUrl,
    handleFilter: onSubmit,
    handleClearFilters,
    updateField,
    activeFiltersCount,
    hasBasicFilters,
    hasAdvancedFilters,
    advancedFilters,
    getCurrentFilters: () => filtersFromUrl,
    form,
  }
}

export type UseScheduleFiltersReturn = ReturnType<typeof useScheduleFilters>
