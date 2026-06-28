import { cn } from '@/lib/utils'

interface ScheduleSectionProps {
  title: string
  count?: number
  countLabel?: string
  variant?: 'featured' | 'grid' | 'muted'
  children: React.ReactNode
  className?: string
}

export function ScheduleSection({
  title,
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
        <span className="text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
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
