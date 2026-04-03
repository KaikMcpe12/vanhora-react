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

/**
 * Hook customizado para gerenciar filtros de horários
 *
 * Responsabilidades:
 * - Sincronização entre formulário e URL
 * - Validação com Zod
 * - Gerenciamento de estado do formulário
 * - Reset para valores padrão
 */
export function useScheduleFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse dos filtros da URL (reativo - atualiza quando URL muda)
  const filtersFromUrl = useMemo(
    () => searchParamsToFilters(searchParams),
    [searchParams],
  )

  // Configuração do React Hook Form com Zod
  const form = useForm({
    resolver: zodResolver(scheduleFiltersSchema),
    defaultValues: filtersFromUrl,
    mode: 'onBlur' as const, // Validação no onBlur para melhor UX
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

  /**
   * Aplica filtros atualizando a URL
   * Remove página para voltar ao início dos resultados
   */
  const handleFilter = useCallback(
    (data: ScheduleFiltersSchema) => {
      const params = filtersToSearchParams(data)

      // Remove página para voltar ao início dos resultados
      params.delete('page')

      setSearchParams(params, { replace: true })
    },
    [setSearchParams],
  )

  /**
   * Limpa todos os filtros e reseta para valores padrão
   */
  const handleClearFilters = useCallback(() => {
    const defaultFilters = getDefaultFilters()

    // Reset do formulário
    reset(defaultFilters)

    // Limpa URL mantendo apenas valores padrão significativos
    const params = filtersToSearchParams(defaultFilters)
    params.delete('page')

    setSearchParams(params, { replace: true })
  }, [reset, setSearchParams])

  /**
   * Atualiza um campo específico do formulário
   */
  const updateField = useCallback(
    (field: keyof ScheduleFiltersSchema, value: any) => {
      setValue(field, value, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  /**
   * Conta o número de filtros ativos
   */
  const getActiveFiltersCount = useCallback(() => {
    const currentValues = filtersFromUrl
    const defaultValues = getDefaultFilters()

    let count = 0

    // Compara cada campo com valor padrão
    Object.entries(currentValues).forEach(([key, value]) => {
      const typedKey = key as keyof ScheduleFiltersSchema
      const defaultValue = defaultValues[typedKey]

      if (Array.isArray(value)) {
        // Para arrays, considera ativo se diferente do padrão
        if (JSON.stringify(value) !== JSON.stringify(defaultValue)) {
          count++
        }
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

  /**
   * Verifica se há filtros básicos ativos
   */
  const getHasBasicFilters = useCallback(() => {
    return Boolean(
      filtersFromUrl.origin ||
      filtersFromUrl.destination ||
      filtersFromUrl.date,
    )
  }, [filtersFromUrl])

  /**
   * Verifica se há filtros avançados ativos
   */
  const getHasAdvancedFilters = useCallback(() => {
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

  /**
   * Obtém apenas filtros avançados
   */
  const getAdvancedFilters = useCallback(() => {
    return {
      cooperative: filtersFromUrl.cooperative,
      dayOfWeek: filtersFromUrl.dayOfWeek,
      priceMin: filtersFromUrl.priceMin,
      priceMax: filtersFromUrl.priceMax,
      minRating: filtersFromUrl.minRating,
    }
  }, [filtersFromUrl])

  /**
   * Obtém os filtros atuais da URL (fonte de verdade)
   */
  const getCurrentFilters = useCallback((): ScheduleFiltersSchema => {
    return filtersFromUrl
  }, [filtersFromUrl])

  /**
   * Submit handler tipado
   */
  const onSubmit = handleSubmit((data: any) => {
    handleFilter(data as ScheduleFiltersSchema)
  })

  return {
    // Form methods
    register,
    control,
    errors,
    isSubmitting,
    watch,

    // Filtros da URL (fonte de verdade para queries)
    filtersFromUrl,

    // Custom methods
    handleFilter: onSubmit,
    handleClearFilters,
    updateField,

    // Status helpers (computed values)
    get activeFiltersCount() {
      return getActiveFiltersCount()
    },
    get hasBasicFilters() {
      return getHasBasicFilters()
    },
    get hasAdvancedFilters() {
      return getHasAdvancedFilters()
    },
    get advancedFilters() {
      return getAdvancedFilters()
    },

    // Utilities
    getCurrentFilters,

    // Form instance (para casos avançados)
    form,
  }
}

/**
 * Tipo para o retorno do hook
 */
export type UseScheduleFiltersReturn = ReturnType<typeof useScheduleFilters>
