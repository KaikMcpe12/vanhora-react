import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  type FavoriteData,
  getFavorites,
  toggleFavorite,
} from '@/lib/data/mock-favorites'

/**
 * Hook para ler todos os favoritos
 * Cache infinito pois são dados locais
 */
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    staleTime: Infinity, // Nunca expira (dados locais)
    gcTime: Infinity, // Nunca remove do cache
  })
}

/**
 * Hook helper para verificar se um schedule é favorito
 */
export function useIsFavorite(scheduleId: string) {
  const { data } = useFavorites()
  return data?.ids.includes(scheduleId) ?? false
}

/**
 * Hook para toggle favorito com optimistic update
 * UI atualiza imediatamente, rollback em caso de erro
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    // Função assíncrona (simula API call)
    mutationFn: async (scheduleId: string) => {
      // Delay 300ms para simular latência de rede
      await new Promise((resolve) => setTimeout(resolve, 300))
      return toggleFavorite(scheduleId)
    },

    // 1. ANTES de executar mutationFn (IMEDIATO - OPTIMISTIC UPDATE)
    onMutate: async (scheduleId) => {
      // Cancela queries em andamento para evitar conflito
      await queryClient.cancelQueries({ queryKey: ['favorites'] })

      // Snapshot do estado atual (para rollback em caso de erro)
      const previousFavorites = queryClient.getQueryData<FavoriteData>([
        'favorites',
      ])

      // ATUALIZA CACHE IMEDIATAMENTE (UI muda agora!)
      queryClient.setQueryData<FavoriteData>(['favorites'], (old) => {
        if (!old) {
          return {
            version: 1,
            ids: [scheduleId],
            updatedAt: new Date().toISOString(),
          }
        }

        const isCurrentlyFavorite = old.ids.includes(scheduleId)
        const newIds = isCurrentlyFavorite
          ? old.ids.filter((id) => id !== scheduleId) // Remove
          : [...old.ids, scheduleId] // Adiciona

        return {
          ...old,
          ids: newIds,
          updatedAt: new Date().toISOString(),
        }
      })

      // Retorna snapshot para usar no onError
      return { previousFavorites }
    },

    // 2. Sucesso (após mutationFn completar)
    onSuccess: (data) => {
      const message = data.added
        ? 'Adicionado aos favoritos'
        : 'Removido dos favoritos'
      const description = data.added
        ? 'Acesse "Meus Favoritos" para ver todos'
        : undefined

      toast.success(message, { description })
    },

    // 3. Erro (se mutationFn falhar)
    onError: (error, _scheduleId, context) => {
      // ROLLBACK: restaura estado anterior
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites)
      }

      toast.error('Erro ao atualizar favoritos', {
        description: 'Tente novamente em alguns instantes',
      })

      console.error('Toggle favorite error:', error)
    },

    // 4. Sempre executa (sucesso ou erro)
    onSettled: () => {
      // Invalida cache (força refetch se necessário)
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
