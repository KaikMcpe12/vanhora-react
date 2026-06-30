import { cn } from '@/lib/utils'

interface ScheduleSectionProps {
  title: string
  badge?: string
  count?: number
  countLabel?: string
  variant?: 'featured' | 'grid' | 'muted'
  children: React.ReactNode
  className?: string
}

export function ScheduleSection({
  title,
  badge,
  count,
  countLabel,
  variant = 'grid',
  children,
  className,
}: ScheduleSectionProps) {
  const countText =
    countLabel ??
    (count !== undefined
      ? `${count} ${count === 1 ? 'horário' : 'horários'}`
      : undefined)

  return (
    <section className={cn('space-y-3', className)}>
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
          {badge && (
            <span className="inline-flex items-center rounded-full bg-[#0F6E56] px-1.5 py-[2px] text-[9px] font-medium tracking-[0.3px] text-white">
              {badge}
            </span>
          )}
          {title}
        </span>
        {countText && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {countText}
          </span>
        )}
      </div>

      {/* conteúdo */}
      <div
        className={cn(
          variant === 'featured' && 'space-y-0',
          (variant === 'grid' || variant === 'muted') &&
            'grid grid-cols-1 gap-3 sm:grid-cols-2',
          variant === 'muted' && 'opacity-70',
        )}
      >
        {children}
      </div>
    </section>
  )
}
