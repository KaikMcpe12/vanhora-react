import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface UsePaginationProps<T> {
  items: T[]
  itemsPerPage?: number
  initialPage?: number
  autoLoad?: boolean // ✅ Novo: auto-trigger com intersection observer
}

interface UsePaginationReturn<T> {
  currentItems: T[]
  totalPages: number
  currentPage: number
  hasMore: boolean
  isLoading: boolean
  loadMore: () => void
  loadingMore: () => void
  stopLoading: () => void
  reset: () => void
  sentinelRef: (node: HTMLElement | null) => void // ✅ Novo: ref para intersection observer
}

export function usePagination<T>({
  items,
  itemsPerPage = 12,
  initialPage = 1,
  autoLoad = true, // ✅ Padrão: auto-carregamento ativado
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isLoading, setIsLoading] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)

  const totalPages = Math.ceil(items.length / itemsPerPage)

  // ✅ Corrigido: slice com índices corretos para infinite scroll
  const currentItems = useMemo(() => {
    const endIndex = currentPage * itemsPerPage
    return items.slice(0, endIndex) // Do início até a página atual (infinite scroll)
  }, [items, currentPage, itemsPerPage])

  const hasMore = currentPage < totalPages

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true)
      // Simulate loading delay (será substituído por React Query)
      setTimeout(() => {
        setCurrentPage((prev) => prev + 1)
        setIsLoading(false)
      }, 800)
    }
  }, [hasMore, isLoading])

  // ✅ Novo: Intersection Observer para auto-load
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && autoLoad) {
            loadMore()
          }
        },
        {
          threshold: 0.1, // Trigger quando 10% do elemento estiver visível
          rootMargin: '100px', // Trigger 100px antes do elemento ficar visível
        },
      )

      if (node) observer.current.observe(node)
    },
    [isLoading, hasMore, autoLoad, loadMore],
  )

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  const loadingMore = () => {
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  const reset = () => {
    setCurrentPage(initialPage)
    setIsLoading(false)
  }

  return {
    currentItems,
    totalPages,
    currentPage,
    hasMore,
    isLoading,
    loadMore,
    loadingMore,
    stopLoading,
    reset,
    sentinelRef, // ✅ Novo: ref para componentes
  }
}
