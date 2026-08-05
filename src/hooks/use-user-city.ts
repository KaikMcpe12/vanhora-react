import { useQuery } from '@tanstack/react-query'

import { fetchUserCity } from '@/lib/api/geolocation-api'
import { CITIES_WITH_IDS } from '@/lib/data/mock-cities'
import { queryKeys } from '@/lib/query-keys'
import { normalizeCity } from '@/lib/utils/normalize-city'

export function useUserCity() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.geo.userCity(),
    queryFn: async () => {
      const rawCity = await fetchUserCity()
      if (!rawCity) return null

      const normalized = normalizeCity(rawCity)
      const match = CITIES_WITH_IDS.find(
        (city) => normalizeCity(city.name) === normalized,
      )

      return match?.id ?? null // null → cidade fora do nosso banco
    },
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  })

  return {
    cityId: data ?? null,
    isLoading,
  }
}
