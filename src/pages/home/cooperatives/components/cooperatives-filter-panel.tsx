import { Filter, Star } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  COOP_SORT_OPTIONS,
  type CoopRatingFilter,
  type CoopSort,
} from '@/hooks/use-cooperatives-filters'
import { cn } from '@/lib/utils'

const RATING_OPTIONS: { value: CoopRatingFilter; label: string; stars: number }[] = [
  { value: 'any', label: 'Qualquer avaliação', stars: 0 },
  { value: '3+', label: '3 estrelas ou mais', stars: 3 },
  { value: '4+', label: '4 estrelas ou mais', stars: 4 },
  { value: '5', label: '5 estrelas', stars: 5 },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
      {children}
    </span>
  )
}

function StarRow({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={11}
          strokeWidth={1.5}
          className={cn(i <= count ? 'fill-vh-amber text-vh-amber' : 'fill-none text-muted-foreground/30')}
        />
      ))}
    </span>
  )
}

type Props = {
  filters: { cities: string[]; minRating: CoopRatingFilter; sort: CoopSort }
  onFiltersChange: (updates: Partial<{ cities: string[]; minRating: CoopRatingFilter; sort: CoopSort }>) => void
  availableCities: Array<{ name: string; count: number }>
  activeFilterCount: number
  onReset: () => void
  className?: string
}

export function CooperativesFilterPanel({
  filters,
  onFiltersChange,
  availableCities,
  activeFilterCount,
  onReset,
  className,
}: Props) {
  const toggleCity = (name: string) => {
    const next = filters.cities.includes(name)
      ? filters.cities.filter((c) => c !== name)
      : [...filters.cities, name]
    onFiltersChange({ cities: next })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* header */}
      <div className="flex items-center gap-2">
        <Filter size={14} strokeWidth={1.75} className="text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">Filtros</span>
        {activeFilterCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0F6E56] text-[9px] font-medium text-white">
            {activeFilterCount}
          </span>
        )}
      </div>

      {/* cidades atendidas */}
      {availableCities.length > 0 && (
        <div>
          <SectionLabel>Cidades atendidas</SectionLabel>
          <div className="flex flex-col gap-2">
            {availableCities.map(({ name, count }) => {
              const checked = filters.cities.includes(name)
              const disabled = count === 0 && !checked
              return (
                <label
                  key={name}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2',
                    disabled && 'pointer-events-none opacity-40',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleCity(name)}
                      className="h-3.5 w-3.5 cursor-pointer accent-[#0F6E56]"
                    />
                    <span className={cn('text-[13px]', checked ? 'font-medium text-foreground' : 'text-foreground/80')}>
                      {name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{count}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* avaliação mínima */}
      <div>
        <SectionLabel>Avaliação mínima</SectionLabel>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map(({ value, label, stars }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="coop-rating"
                checked={filters.minRating === value}
                onChange={() => onFiltersChange({ minRating: value })}
                className="h-3.5 w-3.5 cursor-pointer accent-[#0F6E56]"
              />
              {stars > 0 ? (
                <span className="flex items-center gap-1.5 text-[13px] text-foreground/80">
                  <StarRow count={stars} />
                  <span className="text-muted-foreground text-[11px]">ou mais</span>
                </span>
              ) : (
                <span className="text-[13px] text-foreground/80">{label}</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* ordenar por */}
      <div>
        <SectionLabel>Ordenar por</SectionLabel>
        <Select
          value={`${filters.sort.field}:${filters.sort.direction}`}
          onValueChange={(v) => {
            const opt = COOP_SORT_OPTIONS.find(
              (o) => `${o.sort.field}:${o.sort.direction}` === v,
            )
            if (opt) onFiltersChange({ sort: opt.sort })
          }}
        >
          <SelectTrigger className="h-9 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COOP_SORT_OPTIONS.map((opt) => (
              <SelectItem
                key={`${opt.sort.field}:${opt.sort.direction}`}
                value={`${opt.sort.field}:${opt.sort.direction}`}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* limpar filtros */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer text-left text-[12px] text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
