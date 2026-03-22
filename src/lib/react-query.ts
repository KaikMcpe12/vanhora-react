import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Cache de 5 minutos conforme definido
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (garbage collection)

      // ✅ Configurações para UX otimizada
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 3,
    },
    mutations: {
      retry: 1,
    },
  },
})
