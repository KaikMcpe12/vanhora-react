import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

import {
  filtersToSearchParams,
  getDefaultFilters,
  type ScheduleFiltersSchema,
  scheduleFiltersSchema,
  searchParamsToFilters,
} from '@/lib/schemas/schedule-filters'

/** hook para gerenciar filtros de horários com sincronização url */
export function useScheduleFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // filtros da url (reativo)
  const filtersFromUrl = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
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
      const params = filtersToSearchParams(data)
      params.delete('page')
      setSearchParams(params, { replace: true })
    },
    [setSearchParams],
  )

  const handleClearFilters = useCallback(() => {
    const defaultFilters = getDefaultFilters()
    reset(defaultFilters)
    const params = filtersToSearchParams(defaultFilters)
    params.delete('page')
    setSearchParams(params, { replace: true })
  }, [reset, setSearchParams])

  const updateField = useCallback(
    (field: keyof ScheduleFiltersSchema, value: unknown) => {
      setValue(field, value as never, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  // valores computados (usememo ao invés de getters)
  const activeFiltersCount = useMemo(() => {
    const defaultValues = getDefaultFilters()
    let count = 0

    Object.entries(filtersFromUrl).forEach(([key, value]) => {
      const typedKey = key as keyof ScheduleFiltersSchema
      const defaultValue = defaultValues[typedKey]

      if (Array.isArray(value)) {
        if (JSON.stringify(value) !== JSON.stringify(defaultValue)) count++
      } else if (
        value !== defaultValue &&
        value !== undefined &&
        value !== ''
      ) {
        count++
      }
    })

    return count
  }, [filtersFromUrl])

  const hasBasicFilters = useMemo(
    () =>
      Boolean(
        filtersFromUrl.origin ||
        filtersFromUrl.destination ||
        filtersFromUrl.date,
      ),
    [filtersFromUrl],
  )

  const hasAdvancedFilters = useMemo(() => {
    const defaultFilters = getDefaultFilters()
    return Boolean(
      filtersFromUrl.cooperative ||
      JSON.stringify(filtersFromUrl.dayOfWeek) !==
        JSON.stringify(defaultFilters.dayOfWeek) ||
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
