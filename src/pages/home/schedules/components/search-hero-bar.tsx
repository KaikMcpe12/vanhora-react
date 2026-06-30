import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeftRight, Calendar, MapPin, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface SearchHeroBarProps {
  onEdit: () => void
  className?: string
}

function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return 'hoje'
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return `hoje, ${format(d, 'd MMM', { locale: ptBR })}`
  if (isTomorrow(d)) return `amanhã, ${format(d, 'd MMM', { locale: ptBR })}`
  return format(d, "EEE',' d MMM", { locale: ptBR })
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </span>
  )
}

export function SearchHeroBar({ onEdit, className }: SearchHeroBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''

  const handleSwap = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (origin) next.set('destination', origin)
        else next.delete('destination')
        if (destination) next.set('origin', destination)
        else next.delete('origin')
        return next
      },
      { replace: true },
    )
  }

  const dateLabel = formatDateLabel(date)

  return (
    <div className={cn('border-b border-border/60 bg-muted/40 px-4 py-5 lg:px-6 lg:py-6', className)}>

      {/* ── Desktop (≥1024px): layout horizontal ── */}
      <div className="mx-auto hidden max-w-6xl items-center gap-3.5 lg:flex">

        {/* Barra de busca */}
        <div className="flex h-16 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-card">

          {/* Origem */}
          <button
            type="button"
            onClick={onEdit}
            className="flex h-full flex-1 cursor-pointer items-center gap-3 px-5 transition-colors hover:bg-muted/20"
          >
            <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
            <div className="min-w-0 text-left">
              <FieldLabel>De onde</FieldLabel>
              <span
                className={cn(
                  'block truncate text-[14px] leading-tight',
                  origin
                    ? 'font-medium text-foreground'
                    : 'font-normal text-muted-foreground',
                )}
              >
                {origin || 'De onde sai?'}
              </span>
            </div>
          </button>

          {/* Botão swap */}
          <div className="flex shrink-0 items-center px-1">
            <button
              type="button"
              onClick={handleSwap}
              className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-card transition-all hover:border-[#0F6E56]"
              aria-label="Inverter origem e destino"
            >
              <ArrowLeftRight
                size={13}
                strokeWidth={1.75}
                className="text-muted-foreground transition-all duration-300 group-hover:rotate-180 group-hover:text-[#0F6E56]"
              />
            </button>
          </div>

          {/* Destino */}
          <button
            type="button"
            onClick={onEdit}
            className="flex h-full flex-1 cursor-pointer items-center gap-3 px-5 transition-colors hover:bg-muted/20"
          >
            <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
            <div className="min-w-0 text-left">
              <FieldLabel>Para onde</FieldLabel>
              <span
                className={cn(
                  'block truncate text-[14px] leading-tight',
                  destination
                    ? 'font-medium text-foreground'
                    : 'font-normal text-muted-foreground',
                )}
              >
                {destination || 'Para onde vai?'}
              </span>
            </div>
          </button>

          {/* Divisória */}
          <div className="my-3.5 w-px shrink-0 bg-border/60" />

          {/* Data */}
          <button
            type="button"
            onClick={onEdit}
            className="flex h-full w-48 shrink-0 cursor-pointer items-center gap-3 px-5 transition-colors hover:bg-muted/20"
          >
            <Calendar size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
            <div className="min-w-0 text-left">
              <FieldLabel>Quando</FieldLabel>
              <span className="block truncate text-[14px] font-medium leading-tight text-foreground">
                {dateLabel}
              </span>
            </div>
          </button>
        </div>

        {/* Botão de busca circular */}
        <button
          type="button"
          onClick={onEdit}
          className="flex h-[60px] w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#0F6E56] text-white transition-colors hover:bg-[#0a5a45]"
          aria-label="Buscar horários"
        >
          <Search size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* ── Mobile (<1024px): stack vertical ── */}
      <div className="flex flex-col gap-2 lg:hidden">

        {/* Origem */}
        <button
          type="button"
          onClick={onEdit}
          className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card px-4 text-left transition-colors hover:bg-muted/10"
        >
          <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
          <div className="min-w-0 flex-1">
            <FieldLabel>De onde</FieldLabel>
            <span
              className={cn(
                'block truncate text-[14px] leading-tight',
                origin ? 'font-medium text-foreground' : 'font-normal text-muted-foreground',
              )}
            >
              {origin || 'De onde sai?'}
            </span>
          </div>
        </button>

        {/* Swap mobile */}
        <button
          type="button"
          onClick={handleSwap}
          className="flex cursor-pointer items-center justify-center gap-1 self-center py-0.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftRight size={12} strokeWidth={1.75} />
          inverter
        </button>

        {/* Destino */}
        <button
          type="button"
          onClick={onEdit}
          className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card px-4 text-left transition-colors hover:bg-muted/10"
        >
          <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
          <div className="min-w-0 flex-1">
            <FieldLabel>Para onde</FieldLabel>
            <span
              className={cn(
                'block truncate text-[14px] leading-tight',
                destination ? 'font-medium text-foreground' : 'font-normal text-muted-foreground',
              )}
            >
              {destination || 'Para onde vai?'}
            </span>
          </div>
        </button>

        {/* Data */}
        <button
          type="button"
          onClick={onEdit}
          className="flex h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card px-4 text-left transition-colors hover:bg-muted/10"
        >
          <Calendar size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
          <div className="min-w-0 flex-1">
            <FieldLabel>Quando</FieldLabel>
            <span className="block truncate text-[14px] font-medium leading-tight text-foreground">
              {dateLabel}
            </span>
          </div>
        </button>

        {/* Buscar */}
        <button
          type="button"
          onClick={onEdit}
          className="h-12 w-full cursor-pointer rounded-xl bg-[#0F6E56] text-[14px] font-medium text-white transition-colors hover:bg-[#0a5a45]"
        >
          Buscar horários
        </button>
      </div>
    </div>
  )
}
