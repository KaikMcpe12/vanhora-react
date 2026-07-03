import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useUserCity } from '@/hooks/use-user-city'
import { CITIES_WITH_IDS, getCityNameById } from '@/lib/data/mock-cities'
import { addRecentDestination } from '@/lib/recent-destinations'

import { SearchHeroBar } from '../schedules/components/search-hero-bar'
import { LocationBanner } from './components/location-banner'

export function HeroSection() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { cityId, isLoading: isDetectingCity } = useUserCity()
  const detectedCityName = cityId ? getCityNameById(cityId) : null

  const [locationConfirmed, setLocationConfirmed] = useState(
    () => localStorage.getItem('vh_location_confirmed') === 'true',
  )

  const showBanner = !isDetectingCity && Boolean(detectedCityName) && !locationConfirmed

  const handleSearch = () => {
    const destinationId = searchParams.get('destination')
    if (destinationId) {
      const cityData = CITIES_WITH_IDS.find((c) => c.id === destinationId)
      if (cityData) addRecentDestination(cityData.id, cityData.name)
    }
    navigate(`/schedules?${searchParams.toString()}`)
  }

  const handleConfirmLocation = () => {
    localStorage.setItem('vh_location_confirmed', 'true')
    setLocationConfirmed(true)
  }

  return (
    <section className="w-full overflow-hidden bg-gradient-to-b from-vh-amber-bg to-vh-surface-warm">
      {/* título + imagem */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 pt-14 pb-8 lg:grid-cols-2 lg:gap-12">
        <div className="z-10 space-y-5">
          <h1 className="text-foreground text-3xl leading-tight font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Encontre horários de topiques em{' '}
            <span className="text-primary">tempo real</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-base leading-relaxed md:text-lg">
            Consulte horários atualizados de todas as cooperativas do Ceará.
            Saiba exatamente quando sua van parte.
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="rotate-1 transform">
            <img
              alt="Van moderna em estrada costeira"
              className="aspect-video w-full rounded-2xl object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj1WNWIhxyDeiYz8f04BvZ3BY3nVXYjRDrq4vMRr6mIcxuSxpOBCbM3_DM4XTMlDL8mFTKYWCsF0Yt7Xr5bl3MLroAjS69Hr7f-5jTRBHoyMoMs8JgPJfWQbo60QyaLl0Dd03_Z9cftMvRuIvDNmg-dFHP8PT6RmdXCXBffKvBnSr1T41NHx0vqAIVwJ3kjeTanGYksyLidcXvN4bCrJJfFouoriT93gvmObQKb2TVMpFZnVbi5VLGDQl0wN1UM3SLoebIN2qBqvs"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>

      {/* search */}
      <div className="mx-auto max-w-4xl px-4 pb-8">
        <SearchHeroBar onSearch={handleSearch} />
        {showBanner && detectedCityName && (
          <div className="mt-2 flex justify-center px-4">
            <LocationBanner
              detectedCity={detectedCityName}
              onConfirm={handleConfirmLocation}
              onAlter={handleConfirmLocation}
            />
          </div>
        )}
      </div>
    </section>
  )
}
