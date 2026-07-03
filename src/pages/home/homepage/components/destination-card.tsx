import { Flame } from 'lucide-react'

import { CooperativeAvatar } from '@/components/cooperative-avatar'
import { PromoBadge } from '@/components/ui/promo-badge'
import { cn } from '@/lib/utils'

type DestinationCardProps = {
  cityId: string
  cityName: string
  cityState?: string
  photoUrl?: string
  scheduleCount: number
  priceFrom: number
  primaryCooperativeName?: string
  primaryCooperativeColor?: string
  isPopular?: boolean
  onClick: () => void
}

export function DestinationCard({
  cityName,
  cityState,
  photoUrl,
  scheduleCount,
  priceFrom,
  primaryCooperativeName,
  primaryCooperativeColor,
  isPopular,
  onClick,
}: DestinationCardProps) {
  return (
    <div
      className="cursor-pointer overflow-hidden rounded-[12px] border border-border/50 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-border"
      onClick={onClick}
    >
      {/* visual top */}
      <div
        className={cn(
          'relative flex h-[120px] items-center justify-center',
          !photoUrl && !primaryCooperativeColor && 'bg-gradient-to-br from-vh-amber-bg to-vh-amber-card-bg',
        )}
        style={
          !photoUrl && primaryCooperativeColor
            ? {
                background: `linear-gradient(135deg, ${primaryCooperativeColor}22 0%, ${primaryCooperativeColor}0D 100%)`,
              }
            : {}
        }
      >
        {photoUrl ? (
          <img src={photoUrl} alt={cityName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[24px] font-medium tracking-[-0.5px] text-vh-amber-text">
            {cityName}
          </span>
        )}
        {isPopular && (
          <div className="absolute top-2 left-2">
            <PromoBadge icon={<Flame size={8} strokeWidth={2} />}>Popular</PromoBadge>
          </div>
        )}
      </div>

      {/* meta bottom */}
      <div className="flex flex-col gap-1 bg-card p-3">
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-medium text-foreground">{cityName}</span>
          {cityState && (
            <span className="text-[11px] text-muted-foreground">{cityState}</span>
          )}
        </div>
        <span className="text-[12px] text-muted-foreground">
          {scheduleCount > 0 ? `${scheduleCount} horários hoje` : 'Ver horários →'}
        </span>
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {primaryCooperativeName && (
              <>
                <CooperativeAvatar
                  name={primaryCooperativeName}
                  color={primaryCooperativeColor ?? '#185FA5'}
                  size="sm"
                />
                <span className="max-w-[80px] truncate text-[11px] text-muted-foreground">
                  {primaryCooperativeName}
                </span>
              </>
            )}
          </div>
          {priceFrom > 0 && (
            <span className="text-[13px] font-medium text-foreground">
              a partir de R$ {priceFrom.toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
