import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin } from 'lucide-react'

type RecentDestinationChipProps = {
  cityId: string
  cityName: string
  cityState?: string
  lastSearchedAt: string
  onClick: () => void
}

export function RecentDestinationChip({
  cityName,
  cityState,
  lastSearchedAt,
  onClick,
}: RecentDestinationChipProps) {
  const timeAgo = formatDistanceToNow(new Date(lastSearchedAt), {
    locale: ptBR,
    addSuffix: true,
  })

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-16 w-40 shrink-0 cursor-pointer items-center gap-[10px] rounded-[12px] border border-border/50 bg-card p-[12px_14px] text-left transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-border"
    >
      <MapPin size={18} strokeWidth={1.5} className="shrink-0 text-vh-amber" />
      <div className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-foreground">
          {cityName}
        </span>
        <span className="block text-[10px] text-muted-foreground">
          {cityState ? `${cityState} · ` : ''}
          {timeAgo}
        </span>
      </div>
    </button>
  )
}
