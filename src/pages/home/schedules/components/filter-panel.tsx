import { ChevronDown, ChevronUp, Filter, Moon, MoonStar, Star, Sun, Sunrise, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Slider } from '@/components/ui/slider'
import { useDisplayFilters } from '@/hooks/use-display-filters'
import type { Schedule } from '@/lib/types/schedule'
import type { LucideIcon } from 'lucide-react'

import {
  type Period,
  PERIOD_LABELS,
  PERIOD_ORDER,
  PERIOD_RANGES,
  type RatingFilter,
} from '@/lib/types/filters'

const PERIOD_ICONS: Record<Period, LucideIcon> = {
  dawn: Moon,
  morning: Sunrise,
  afternoon: Sun,
  evening: MoonStar,
}
import {
  applyDisplayFilters,
  parseDurationToMinutes,
} from '@/lib/utils/apply-display-filters'
import { cn } from '@/lib/utils'

// ─── helpers ───────────────────────────────────────────────────────────────

function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 && m > 0 ? `${h}h ${m}min` : h > 0 ? `${h}h` : `${m}min`
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.5px] text-muted-foreground">
      {children}
    </span>
  )
}

function PeriodHint({ period }: { period: Period }) {
  const [start, end] = PERIOD_RANGES[period]
  return (
    <span className="text-[10px] text-muted-foreground/70">
      {String(start).padStart(2, '0')}h–{String(end).padStart(2, '0')}h
    </span>
  )
}

const RATING_OPTIONS: { value: RatingFilter; stars: number; label: string }[] = [
  { value: 'any', stars: 0, label: 'Qualquer' },
  { value: '3+', stars: 3, label: '3+' },
  { value: '4+', stars: 4, label: '4+' },
  { value: '5', stars: 5, label: '5' },
]

function StarDisplay({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={cn(
            i < filled
              ? 'fill-[#EF9F27] text-[#EF9F27]'
              : 'fill-muted/40 text-muted-foreground/30',
          )}
          strokeWidth={1.5}
        />
      ))}
    </span>
  )
}

// ─── FilterPanel ───────────────────────────────────────────────────────────

interface FilterPanelProps {
  rawSchedules: Schedule[]
  className?: string
}

const DEBOUNCE_MS = 300

export function FilterPanel({ rawSchedules, className }: FilterPanelProps) {
  const { filters, setFilters, resetAll, activeFilterCount } = useDisplayFilters()
  const [showMore, setShowMore] = useState(false)
  const [expandedCoops, setExpandedCoops] = useState(false)

  // ── computed ranges from loaded data ──────────────────────────────────
  const { listMinPrice, listMaxPrice, listMinDuration, listMaxDuration } = useMemo(() => {
    if (rawSchedules.length === 0)
      return { listMinPrice: 0, listMaxPrice: 200, listMinDuration: 0, listMaxDuration: 600 }
    const prices = rawSchedules.map((s) => s.price)
    const durations = rawSchedules.map((s) => parseDurationToMinutes(s.duration))
    return {
      listMinPrice: Math.floor(Math.min(...prices)),
      listMaxPrice: Math.ceil(Math.max(...prices)),
      listMinDuration: Math.min(...durations),
      listMaxDuration: Math.max(...durations),
    }
  }, [rawSchedules])

  // Local slider state (debounced → URL)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin ?? listMinPrice,
    filters.priceMax ?? listMaxPrice,
  ])
  const [durationMax, setDurationMax] = useState<number>(
    filters.durationMaxMinutes ?? listMaxDuration,
  )

  // Sync local slider from URL on mount / external change
  useEffect(() => {
    setPriceRange([
      filters.priceMin ?? listMinPrice,
      filters.priceMax ?? listMaxPrice,
    ])
  }, [filters.priceMin, filters.priceMax, listMinPrice, listMaxPrice])

  useEffect(() => {
    setDurationMax(filters.durationMaxMinutes ?? listMaxDuration)
  }, [filters.durationMaxMinutes, listMaxDuration])

  // Debounced setters
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const durationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handlePriceChange = useCallback(
    ([min, max]: number[]) => {
      setPriceRange([min, max])
      if (priceTimer.current) clearTimeout(priceTimer.current)
      priceTimer.current = setTimeout(() => {
        setFilters({
          priceMin: min <= listMinPrice ? null : min,
          priceMax: max >= listMaxPrice ? null : max,
        })
      }, DEBOUNCE_MS)
    },
    [setFilters, listMinPrice, listMaxPrice],
  )

  const handleDurationChange = useCallback(
    ([val]: number[]) => {
      setDurationMax(val)
      if (durationTimer.current) clearTimeout(durationTimer.current)
      durationTimer.current = setTimeout(() => {
        setFilters({
          durationMaxMinutes: val >= listMaxDuration ? null : val,
        })
      }, DEBOUNCE_MS)
    },
    [setFilters, listMaxDuration],
  )

  // ── cooperative dynamic counts ─────────────────────────────────────────
  const cooperativesWithCount = useMemo(() => {
    const names = [...new Set(rawSchedules.map((s) => s.cooperativeName))].sort()
    return names.map((name) => ({
      name,
      count: applyDisplayFilters(rawSchedules, filters, {
        exceptCooperatives: true,
      }).filter((s) => s.cooperativeName === name).length,
    }))
  }, [rawSchedules, filters])

  // ── stop cities dynamic counts ────────────────────────────────────────
  const stopCitiesWithCount = useMemo(() => {
    const cities = [
      ...new Set(rawSchedules.flatMap((s) => [s.origin, s.destination])),
    ].sort()
    return cities.map((city) => ({
      city,
      count: applyDisplayFilters(rawSchedules, filters, {
        exceptStops: true,
      }).filter((s) => s.origin === city || s.destination === city).length,
    }))
  }, [rawSchedules, filters])

  const visibleCoops = expandedCoops
    ? cooperativesWithCount
    : cooperativesWithCount.slice(0, 5)

  // ── toggle helpers ─────────────────────────────────────────────────────
  const togglePeriod = (p: Period) => {
    const next = filters.periods.includes(p)
      ? filters.periods.filter((x) => x !== p)
      : [...filters.periods, p]
    setFilters({ periods: next })
  }

  const toggleCooperative = (name: string) => {
    const next = filters.cooperatives.includes(name)
      ? filters.cooperatives.filter((c) => c !== name)
      : [...filters.cooperatives, name]
    setFilters({ cooperatives: next })
  }

  const toggleStopCity = (city: string) => {
    const next = filters.stopsCities.includes(city)
      ? filters.stopsCities.filter((c) => c !== city)
      : [...filters.stopsCities, city]
    setFilters({ stopsCities: next })
  }

  const priceIsActive =
    (filters.priceMin != null && filters.priceMin > listMinPrice) ||
    (filters.priceMax != null && filters.priceMax < listMaxPrice)

  return (
    <div className={cn('space-y-5', className)}>
      {/* ── header + banner ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
          Filtros
        </span>
        {activeFilterCount > 0 && (
          <span
            className="flex items-center gap-1 text-[11px] font-medium"
            style={{ color: '#0F6E56' }}
          >
            <Filter size={11} strokeWidth={2} />
            {activeFilterCount} aplicados
          </span>
        )}
      </div>

      {/* ── 1. Período do dia ─────────────────────────────────────────── */}
      <div>
        <SectionLabel>Período do dia</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {PERIOD_ORDER.map((p) => {
            const active = filters.periods.includes(p)
            const Icon = PERIOD_ICONS[p]
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePeriod(p)}
                className={cn(
                  'flex flex-col items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all',
                  active
                    ? 'border-transparent bg-[#0F6E56] text-white'
                    : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground',
                )}
              >
                <span className="flex items-center gap-1">
                  <Icon size={11} strokeWidth={1.5} />
                  {PERIOD_LABELS[p]}
                </span>
                <PeriodHint period={p} />
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 2. Faixa de preço ─────────────────────────────────────────── */}
      <div>
        <SectionLabel>Faixa de preço</SectionLabel>
        <Slider
          min={listMinPrice}
          max={listMaxPrice}
          step={1}
          value={priceRange}
          onValueChange={handlePriceChange}
          className={cn('my-3', priceIsActive && '[&_[data-slot=slider-range]]:bg-[#0F6E56]')}
        />
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>R$ {priceRange[0]}</span>
          <span>R$ {priceRange[1]}</span>
        </div>
      </div>

      {/* ── 3. Cooperativas ───────────────────────────────────────────── */}
      <div>
        <SectionLabel>Cooperativas</SectionLabel>
        <div className="space-y-1.5">
          {visibleCoops.map(({ name, count }) => {
            const checked = filters.cooperatives.includes(name)
            const disabled = count === 0 && !checked
            return (
              <label
                key={name}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-muted/30',
                  disabled && 'cursor-not-allowed opacity-40',
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleCooperative(name)}
                    className="h-3.5 w-3.5 cursor-pointer accent-[#0F6E56]"
                  />
                  <span className={cn('truncate', checked && 'font-medium text-foreground')}>
                    {name}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                  {count}
                </span>
              </label>
            )
          })}
          {cooperativesWithCount.length > 5 && (
            <button
              type="button"
              onClick={() => setExpandedCoops((v) => !v)}
              className="flex w-full cursor-pointer items-center gap-1 px-2 py-1 text-[12px] font-medium text-primary transition-opacity hover:opacity-75"
            >
              {expandedCoops ? (
                <>
                  <ChevronUp size={12} />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  +{cooperativesWithCount.length - 5} cooperativas
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Avaliação mínima ───────────────────────────────────────── */}
      <div>
        <SectionLabel>Avaliação mínima</SectionLabel>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map(({ value, stars, label }) => {
            const checked = filters.minRating === value
            return (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-muted/30"
              >
                <input
                  type="radio"
                  name="minRating"
                  checked={checked}
                  onChange={() => setFilters({ minRating: value as RatingFilter })}
                  className="h-3.5 w-3.5 cursor-pointer accent-[#0F6E56]"
                />
                {stars > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <StarDisplay filled={stars} />
                    <span
                      className={cn(
                        'text-[12px]',
                        checked ? 'font-medium text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {label}
                    </span>
                  </span>
                ) : (
                  <span
                    className={cn(
                      checked ? 'font-medium text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                )}
              </label>
            )
          })}
        </div>
      </div>

      {/* ── + Mais filtros ────────────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="flex cursor-pointer items-center gap-1 text-[12px] font-medium text-primary transition-opacity hover:opacity-75"
        >
          {showMore ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showMore ? 'Menos filtros' : '+ Mais filtros'}
        </button>

        {showMore && (
          <div className="mt-4 space-y-5">
            {/* Duração máxima */}
            <div>
              <SectionLabel>Duração máxima</SectionLabel>
              <Slider
                min={listMinDuration}
                max={listMaxDuration}
                step={15}
                value={[durationMax]}
                onValueChange={handleDurationChange}
                className={cn(
                  'my-3',
                  filters.durationMaxMinutes != null &&
                    '[&_[data-slot=slider-range]]:bg-[#0F6E56]',
                )}
              />
              <p className="text-center text-[12px] text-muted-foreground">
                até {formatDuration(durationMax)}
              </p>
            </div>

            {/* Paradas em */}
            {stopCitiesWithCount.length > 0 && (
              <div>
                <SectionLabel>Apenas com paradas em</SectionLabel>
                <div className="max-h-40 space-y-1.5 overflow-y-auto">
                  {stopCitiesWithCount.map(({ city, count }) => {
                    const checked = filters.stopsCities.includes(city)
                    const disabled = count === 0 && !checked
                    return (
                      <label
                        key={city}
                        className={cn(
                          'flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-muted/30',
                          disabled && 'cursor-not-allowed opacity-40',
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleStopCity(city)}
                            className="h-3.5 w-3.5 cursor-pointer accent-[#0F6E56]"
                          />
                          <span
                            className={cn(
                              'truncate',
                              checked && 'font-medium text-foreground',
                            )}
                          >
                            {city}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                          {count}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Clear ────────────────────────────────────────────────────── */}
      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={resetAll}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-border/60 py-2 text-[12px] font-medium text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <X size={12} strokeWidth={2} />
          Limpar filtros
        </button>
      )}
    </div>
  )
}
