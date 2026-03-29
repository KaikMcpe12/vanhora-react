import { useQuery, useQueryClient } from '@tanstack/react-query'

import { getMockSchedulesPage } from '@/lib/data/mock-schedules'
import type { ScheduleFilters } from '@/lib/types/schedule'

/**
 * Hook para buscar horários com React Query
 * - Cache separado por filtros (query key inclui filtros)
 * - Simula API com mock data paginado
 * - Configuração para infinite scroll futura
 */
export function useSchedulesQuery(
  filters: ScheduleFilters,
  page: number = 1,
  enabled: boolean = true,
) {
  return useQuery({
    // ✅ Query key com filtros para cache separado
    queryKey: ['schedules', filters, page],

    queryFn: async () => {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 500))

      return getMockSchedulesPage(page, 12, filters)
    },

    enabled,

    // Configurações específicas para schedules
    staleTime: 5 * 60 * 1000, // 5 minutos conforme definido
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
}

/**
 * Hook para invalidar cache de schedules
 * - Usado em refresh manual
 * - Limpa todo cache relacionado a schedules
 */
export function useInvalidateSchedules() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({
      queryKey: ['schedules'],
      exact: false, // Invalida todas as queries que começam com 'schedules'
    })
  }
}
