import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { mockCheckUserRating, mockSubmitRating } from '@/lib/data/mock-ratings'

interface UseRatingOptions {
  scheduleId: string
  onSuccess?: (action: 'created' | 'updated') => void
}

/**
 * Hook para gerenciar avaliações com React Query
 * - Verifica se usuário já avaliou (cache 5min)
 * - Submete nova avaliação ou atualiza existente
 * - Invalida cache após submissão
 * - Mostra toasts de feedback
 */
export function useRating({ scheduleId, onSuccess }: UseRatingOptions) {
  const queryClient = useQueryClient()

  // Verifica se já avaliou
  const {
    data: checkData,
    isLoading,
    error: checkError,
  } = useQuery({
    queryKey: ['rating-check', scheduleId],
    queryFn: () => mockCheckUserRating(scheduleId),
    staleTime: 5 * 60 * 1000, // Cache 5min (mesmo padrão do projeto)
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
  })

  // Submete avaliação
  const {
    mutate: submitRating,
    isPending,
    error: submitError,
  } = useMutation({
    mutationFn: (stars: number) => mockSubmitRating(scheduleId, stars),
    onSuccess: (response) => {
      // Invalida cache para forçar re-fetch
      queryClient.invalidateQueries({ queryKey: ['rating-check', scheduleId] })
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] })

      // Toast de sucesso (biblioteca Sonner configurada)
      const message =
        response.action === 'created'
          ? 'Avaliação enviada com sucesso!'
          : 'Avaliação atualizada!'

      toast.success(message)

      onSuccess?.(response.action)
    },
    onError: (error) => {
      console.error('Erro ao enviar avaliação:', error)
      toast.error('Erro ao enviar avaliação. Tente novamente.')
    },
  })

  return {
    hasRated: checkData?.hasRated ?? false,
    currentRating: checkData?.rating,
    isLoading,
    isError: !!checkError || !!submitError,
    submitRating,
    isSubmitting: isPending,
  }
}
