import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeftRight, Calendar, Check, MapPin, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useUserCity } from '@/hooks/use-user-city'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CITIES_WITH_IDS, getCityNameById } from '@/lib/data/mock-cities'
import { cn } from '@/lib/utils'

function formatDateLabel(dateStr?: string): string {
  if (!dateStr) return 'hoje'
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return `hoje, ${format(d, 'd MMM', { locale: ptBR })}`
  if (isTomorrow(d)) return `amanhã, ${format(d, 'd MMM', { locale: ptBR })}`
  return format(d, "EEE',' d MMM", { locale: ptBR })
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </span>
  )
}

interface CityListProps {
  selectedId: string
  excludeId?: string
  allowAny?: boolean
  onSelect: (id: string) => void
}

function CityList({ selectedId, excludeId, allowAny, onSelect }: CityListProps) {
  return (
    <Command>
      <CommandInput placeholder="Buscar cidade..." className="h-9" autoFocus />
      <CommandList>
        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
        <CommandGroup>
          {allowAny && (
            <CommandItem value="qualquer" onSelect={() => onSelect('')} className="cursor-pointer">
              <Check className={cn('mr-2 h-4 w-4', !selectedId ? 'opacity-100' : 'opacity-0')} />
              <span className={cn('italic', !selectedId ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                Qualquer destino
              </span>
            </CommandItem>
          )}
          {CITIES_WITH_IDS.map((city) => {
            const isSelected = selectedId === city.id
            const isExcluded = city.id === excludeId
            return (
              <CommandItem
                key={city.id}
                value={city.name}
                disabled={isExcluded}
                onSelect={() => !isExcluded && onSelect(isSelected ? '' : city.id)}
                className={cn('cursor-pointer', isExcluded && 'pointer-events-none opacity-40')}
              >
                <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                {city.name}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

interface SearchHeroBarProps {
  className?: string
  onSearch?: () => void
}

export function SearchHeroBar({ className, onSearch }: SearchHeroBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const originId = searchParams.get('origin') || ''
  const destinationId = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''

  const originName = getCityNameById(originId)
  const destinationName = getCityNameById(destinationId)
  const dateLabel = formatDateLabel(date)
  const today = todayStr()
  const canSwap = Boolean(originId && destinationId)

  // estados separados por layout: um popover open={true} no layout oculto
  // (css hidden) porta conteúdo sem âncora e sobrepõe o layout visível
  const [dOriginOpen, setDOriginOpen] = useState(false)
  const [dDestOpen, setDDestOpen] = useState(false)
  const [dDateOpen, setDDateOpen] = useState(false)
  const [mOriginOpen, setMOriginOpen] = useState(false)
  const [mDestOpen, setMDestOpen] = useState(false)
  const [mDateOpen, setMDateOpen] = useState(false)

  const { cityId: detectedCityId, isLoading: isDetectingCity } = useUserCity()

  useEffect(() => {
    if (isDetectingCity) return
    setSearchParams(
      (prev) => {
        if (prev.get('origin')) return prev // usuário já definiu origem
        const next = new URLSearchParams(prev)
        if (detectedCityId) next.set('origin', detectedCityId)
        return next // sem match → deixa vazio (fallback: usuário seleciona)
      },
      { replace: true },
    )
  }, [isDetectingCity, detectedCityId, setSearchParams])

  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  const handleSwap = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (originId) next.set('destination', originId)
        else next.delete('destination')
        if (destinationId) next.set('origin', destinationId)
        else next.delete('origin')
        return next
      },
      { replace: true },
    )
  }

  const handleDOriginSelect = (id: string) => {
    setParam('origin', id)
    setDOriginOpen(false)
    if (id && !destinationId) setDDestOpen(true)
  }
  const handleDDestSelect = (id: string) => {
    setParam('destination', id)
    setDDestOpen(false)
  }
  const handleDDateSelect = (value: string) => {
    setParam('date', value)
    setDDateOpen(false)
  }

  const handleMOriginSelect = (id: string) => {
    setParam('origin', id)
    setMOriginOpen(false)
    if (id && !destinationId) setMDestOpen(true)
  }
  const handleMDestSelect = (id: string) => {
    setParam('destination', id)
    setMDestOpen(false)
  }
  const handleMDateSelect = (value: string) => {
    setParam('date', value)
    setMDateOpen(false)
  }

  const fieldDesktop = 'flex h-full cursor-pointer items-center gap-3 px-5 transition-colors hover:bg-muted/20'
  const fieldMobile  = 'flex h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card px-4 text-left transition-colors hover:bg-muted/10'

  return (
    <div className={cn('border-b border-border/60 bg-muted/40 px-4 py-5 lg:px-6 lg:py-6', className)}>

      <div className="mx-auto hidden max-w-6xl items-center gap-3.5 lg:flex">
        <div className="flex h-16 flex-1 overflow-hidden rounded-2xl border border-border/70 bg-card">
          <Popover open={dOriginOpen} onOpenChange={setDOriginOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn(fieldDesktop, 'flex-1')}>
                <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
                <div className="min-w-0 text-left">
                  <FieldLabel>De onde</FieldLabel>
                  <span className={cn('block truncate text-[14px] leading-tight',
                    originId ? 'font-medium text-foreground' : 'font-normal text-muted-foreground')}>
                    {originName || 'De onde sai?'}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start" sideOffset={8}>
              <CityList selectedId={originId} excludeId={destinationId} onSelect={handleDOriginSelect} />
            </PopoverContent>
          </Popover>

          {canSwap && (
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
          )}

          <Popover open={dDestOpen} onOpenChange={setDDestOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn(fieldDesktop, 'flex-1')}>
                <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
                <div className="min-w-0 text-left">
                  <FieldLabel>Para onde</FieldLabel>
                  <span className={cn('block truncate text-[14px] leading-tight',
                    destinationId ? 'font-medium text-foreground' : 'italic font-normal text-muted-foreground')}>
                    {destinationName || 'Qualquer destino'}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-0" align="start" sideOffset={8}>
              <CityList selectedId={destinationId} excludeId={originId} allowAny onSelect={handleDDestSelect} />
            </PopoverContent>
          </Popover>

          <div className="my-3.5 w-px shrink-0 bg-border/60" />

          <Popover open={dDateOpen} onOpenChange={setDDateOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn(fieldDesktop, 'w-44 shrink-0')}>
                <Calendar size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
                <div className="min-w-0 text-left">
                  <FieldLabel>Quando</FieldLabel>
                  <span className="block truncate text-[14px] font-medium leading-tight text-foreground">
                    {dateLabel}
                  </span>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end" sideOffset={8}>
              <input
                type="date"
                defaultValue={date || today}
                min={today}
                onChange={(e) => handleDDateSelect(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/40"
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <button
          type="button"
          onClick={() => originId && onSearch?.()}
          className={cn(
            'flex h-[60px] w-[60px] shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors',
            originId ? 'bg-[#0F6E56] hover:bg-[#0a5a45]' : 'cursor-not-allowed bg-muted-foreground/40',
          )}
          aria-label="Buscar horários"
        >
          <Search size={22} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex flex-col gap-2 lg:hidden">
        <Popover open={mOriginOpen} onOpenChange={setMOriginOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={fieldMobile}>
              <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
              <div className="min-w-0 flex-1">
                <FieldLabel>De onde</FieldLabel>
                <span className={cn('block truncate text-[14px] leading-tight',
                  originId ? 'font-medium text-foreground' : 'font-normal text-muted-foreground')}>
                  {originName || 'De onde sai?'}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] p-0" align="start" sideOffset={6}>
            <CityList selectedId={originId} excludeId={destinationId} onSelect={handleMOriginSelect} />
          </PopoverContent>
        </Popover>

        {canSwap && (
          <button
            type="button"
            onClick={handleSwap}
            className="flex cursor-pointer items-center justify-center gap-1 self-center py-0.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftRight size={12} strokeWidth={1.75} />
            inverter
          </button>
        )}

        <Popover open={mDestOpen} onOpenChange={setMDestOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={fieldMobile}>
              <MapPin size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
              <div className="min-w-0 flex-1">
                <FieldLabel>Para onde</FieldLabel>
                <span className={cn('block truncate text-[14px] leading-tight',
                  destinationId ? 'font-medium text-foreground' : 'italic font-normal text-muted-foreground')}>
                  {destinationName || 'Qualquer destino'}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] p-0" align="start" sideOffset={6}>
            <CityList selectedId={destinationId} excludeId={originId} allowAny onSelect={handleMDestSelect} />
          </PopoverContent>
        </Popover>

        <Popover open={mDateOpen} onOpenChange={setMDateOpen}>
          <PopoverTrigger asChild>
            <button type="button" className={fieldMobile}>
              <Calendar size={16} strokeWidth={1.75} className="shrink-0 text-[#0F6E56]" />
              <div className="min-w-0 flex-1">
                <FieldLabel>Quando</FieldLabel>
                <span className="block truncate text-[14px] font-medium leading-tight text-foreground">
                  {dateLabel}
                </span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start" sideOffset={6}>
            <input
              type="date"
              defaultValue={date || today}
              min={today}
              onChange={(e) => handleMDateSelect(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-[14px] text-foreground focus:outline-none"
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={() => originId && onSearch?.()}
          className={cn(
            'h-12 w-full rounded-xl text-[14px] font-medium text-white transition-colors',
            originId ? 'cursor-pointer bg-[#0F6E56] hover:bg-[#0a5a45]' : 'cursor-not-allowed bg-muted-foreground/40',
          )}
        >
          {destinationId ? `Ver horários para ${destinationName}` : 'Ver horários disponíveis'}
        </button>
      </div>
    </div>
  )
}
