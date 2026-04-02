import { Heart } from 'lucide-react'

import { useFavorites } from '@/hooks/use-favorites'

// Loading Skeleton
function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 px-4 py-16 text-white shadow-2xl lg:px-8 lg:py-20">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left: Icon + Title */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-white/25 ring-4 ring-white/20 backdrop-blur-sm lg:h-20 lg:w-20" />
              <div>
                <div className="mb-2 h-10 w-64 animate-pulse rounded-lg bg-white/20" />
                <div className="h-6 w-40 animate-pulse rounded-lg bg-white/20" />
              </div>
            </div>
          </div>

          {/* Right: Stats (skeleton) */}
          <div className="flex gap-3">
            <div className="h-20 w-24 animate-pulse rounded-xl bg-white/20" />
            <div className="h-20 w-24 animate-pulse rounded-xl bg-white/20" />
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
    </div>
  )
}

export function FavoritesHero() {
  const { data: favoritesData, isLoading } = useFavorites()

  const totalFavorites = favoritesData?.ids.length || 0

  if (isLoading) {
    return <HeroSkeleton />
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 px-4 py-16 text-white shadow-2xl lg:px-8 lg:py-20">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left: Icon + Title */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="flex items-center gap-4">
              {/* Icon with glow */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 ring-4 ring-white/20 backdrop-blur-sm lg:h-20 lg:w-20">
                <Heart className="h-8 w-8 fill-white text-white drop-shadow-lg lg:h-10 lg:w-10" />
                <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg lg:text-5xl">
                  Meus Favoritos
                </h1>
                <p className="mt-1 text-sm font-medium text-white/90 drop-shadow lg:text-base">
                  {totalFavorites > 0
                    ? `Você tem ${totalFavorites} ${totalFavorites === 1 ? 'horário salvo' : 'horários salvos'}`
                    : 'Nenhum horário salvo ainda'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Stats Cards */}
          {totalFavorites > 0 && (
            <div className="flex gap-3">
              {/* Total Card */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/15 px-6 py-4 ring-1 ring-white/20 backdrop-blur-md">
                <span className="text-3xl font-black text-white drop-shadow-lg">
                  {totalFavorites}
                </span>
                <span className="text-xs font-medium tracking-wide text-white/80 uppercase">
                  Total
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
    </div>
  )
}
