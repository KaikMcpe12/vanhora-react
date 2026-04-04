import { Heart } from 'lucide-react'

import { ScheduleSearch } from '@/components/schedule-search'
import { useFavorites } from '@/hooks/use-favorites'

export function FavoritesHero() {
  const { count, isAtLimit } = useFavorites()

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-rose-500 to-pink-500 text-white shadow-2xl">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          {/* ícone + título */}
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="flex items-center gap-4">
              {/* ícone com glow */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 ring-4 ring-white/20 backdrop-blur-sm lg:h-20 lg:w-20">
                <Heart className="h-8 w-8 fill-white text-white drop-shadow-lg lg:h-10 lg:w-10" />
                <div className="absolute inset-0 rounded-2xl bg-white/10 blur-xl" />
              </div>

              {/* título + subtítulo */}
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-lg lg:text-5xl">
                  Meus Favoritos
                </h1>
                <p className="mt-1 text-sm font-medium text-white/90 drop-shadow lg:text-base">
                  {count > 0
                    ? `Você tem ${count} ${count === 1 ? 'horário salvo' : 'horários salvos'}`
                    : 'Nenhum horário salvo ainda'}
                </p>
              </div>
            </div>
          </div>

          {/* stats */}
          {count > 0 && (
            <div className="flex gap-3">
              {/* total */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-white/15 px-6 py-4 ring-1 ring-white/20 backdrop-blur-md">
                <span className="text-3xl font-black text-white drop-shadow-lg">
                  {count}
                </span>
                <span className="text-xs font-medium tracking-wide text-white/80 uppercase">
                  Total
                </span>
              </div>
            </div>
          )}
        </div>

        {/* aviso de limite */}
        {isAtLimit && (
          <div className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
            ⚠️ Você atingiu o limite de 100 favoritos. Remova alguns para
            adicionar novos.
          </div>
        )}

        {/* busca */}
        <div className="mt-8">
          <ScheduleSearch />
        </div>
      </div>

      {/* decorações de fundo */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      {/* pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
    </div>
  )
}
