import { useInfiniteQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef } from 'react'

import {
  type FetchSchedulesParams,
  mockSchedulesAPI,
} from '@/lib/api/mock-schedules-api'
import type { Schedule } from '@/lib/types/schedule'

/**
 * Retorno do hook
 */
export interface UseSchedulesReturn {
  schedules: Schedule[]
  totalCount: number
  isLoading: boolean
  isFetchingNextPage: boolean
  isError: boolean
  error: Error | null
  hasNextPage: boolean
  fetchNextPage: () => void
  sentinelRef: (node: HTMLElement | null) => void
}

/**
 * Hook para buscar schedules com paginação infinita
 * Usa React Query useInfiniteQuery para paginação server-side
 *
 * @example
 * // Buscar todos os schedules
 * const { schedules, isLoading, sentinelRef } = useSchedules()
 *
 * @example
 * // Buscar favoritos com filtros e paginação
 * const { favoriteIds } = useFavorites()
 * const { schedules, sentinelRef } = useSchedules({
 *   ids: favoriteIds,
 *   origin: 'Juazeiro',
 *   date: '2026-04-01'
 * }, { limit: 12 })
 */
export function useSchedules(
  params: Omit<FetchSchedulesParams, 'page' | 'limit'> = {},
  options?: { limit?: number },
): UseSchedulesReturn {
  const limit = options?.limit ?? 12
  const observerRef = useRef<IntersectionObserver | null>(null)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['schedules', params],
    queryFn: ({ pageParam = 0 }) =>
      mockSchedulesAPI({ ...params, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.meta.pageIndex + 1
      const totalPages = Math.ceil(lastPage.meta.totalCount / limit)
      return nextPage < totalPages ? nextPage : undefined
    },
    initialPageParam: 0,

    // Cache strategy
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 10, // 10 min

    // Retry strategy
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Flatten all pages into single array
  const schedules = useMemo(() => {
    return data?.pages.flatMap((page) => page.schedules) ?? []
  }, [data])

  const totalCount = data?.pages[0]?.meta.totalCount ?? 0

  // Intersection Observer para infinite scroll (preload 3 cards antes)
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (isFetchingNextPage || !hasNextPage) {
        if (observerRef.current) observerRef.current.disconnect()
        return
      }

      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        },
        { rootMargin: '300px' }, // Preload ~3 cards antes
      )

      if (node) observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  return {
    schedules,
    totalCount,
    isLoading,
    isFetchingNextPage,
    isError,
    error: error as Error | null,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    sentinelRef,
  }
}
