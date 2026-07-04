import { Heart, Share2 } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { batchFavoriteSchedules, useFavorites } from '@/hooks/use-favorites'
import type { RouteDetail } from '@/lib/data/mock-route-detail'
import { getMockSchedules } from '@/lib/data/mock-schedules'
import { cn } from '@/lib/utils'

type RouteActionsRowProps = {
  route: RouteDetail
}

export function RouteActionsRow({ route }: RouteActionsRowProps) {
  const { favoriteIds } = useFavorites()

  const routeScheduleIds = useMemo(
    () =>
      getMockSchedules()
        .filter((s) => s.origin === route.origin && s.destination === route.destination)
        .map((s) => s.id),
    [route.origin, route.destination],
  )

  const allFavorited =
    routeScheduleIds.length > 0 && routeScheduleIds.every((id) => favoriteIds.includes(id))

  function handleFavorite() {
    batchFavoriteSchedules(routeScheduleIds)
  }

  async function handleShare() {
    const url = window.location.href
    const title = `${route.displayName} — VanHora`

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled — noop
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado!')
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  const btnCls =
    'flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted'

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button type="button" onClick={handleFavorite} className={cn(btnCls, allFavorited && 'text-rose-500 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20')}>
        <Heart
          className={cn('h-3.5 w-3.5', allFavorited && 'fill-rose-500 text-rose-500')}
        />
        {allFavorited ? 'Remover favoritos' : 'Favoritar todos os horários'}
      </button>
      <button type="button" onClick={handleShare} className={btnCls}>
        <Share2 className="h-3.5 w-3.5" />
        Compartilhar
      </button>
    </div>
  )
}
