import { useQuery } from '@tanstack/react-query'

import { fetchUserCity } from '@/lib/api/geolocation-api'
import { CITIES_WITH_IDS } from '@/lib/data/mock-cities'
import { normalizeCity } from '@/lib/utils/normalize-city'

/**
 * Detecta a cidade do usuário via IP e retorna o ID correspondente
 * em CITIES_WITH_IDS, ou null se a cidade não estiver cadastrada
 * ou se a API falhar (ambos os casos seguem para o fallback do componente).
 */
export function useUserCity() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-city'],
    queryFn: async () => {
      const rawCity = await fetchUserCity()
      if (!rawCity) return null

      const normalized = normalizeCity(rawCity)

      const match = CITIES_WITH_IDS.find(
        (city) => normalizeCity(city.name) === normalized,
      )

      return match?.id ?? null // null → cidade não está no nosso banco
    },
    staleTime: 24 * 60 * 60 * 1000, // cidade do usuário não muda dentro do dia
    gcTime: 24 * 60 * 60 * 1000,
    retry: false, // falha rápida; o componente tem fallback
  })

  return {
    cityId: data ?? null,
    isLoading,
  }
}
