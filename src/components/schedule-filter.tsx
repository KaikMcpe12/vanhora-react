import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'

type Layout = 'column' | 'row'

interface FilterState {
  search: string
  origin: string
  destination: string
  date: string
  weekDays: string[]
  status: {
    happening: boolean
    upcoming: boolean
    past: boolean
  }
}

interface ScheduleFiltersProps {
  layout?: Layout
  onApply?: (filters: FilterState) => void
  onReset?: () => void
}

const WEEK_DAYS = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
]

const DEFAULT_FILTERS: FilterState = {
  search: '',
  origin: '',
  destination: '',
  date: '',
  weekDays: [],
  status: { happening: true, upcoming: true, past: false },
}

export function ScheduleFilters({
  layout = 'column',
  onApply,
  onReset,
}: ScheduleFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const isRow = layout === 'row'

  function toggleWeekDay(day: string) {
    setFilters((prev) => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter((d) => d !== day)
        : [...prev.weekDays, day],
    }))
  }

  function toggleStatus(key: keyof FilterState['status']) {
    setFilters((prev) => ({
      ...prev,
      status: { ...prev.status, [key]: !prev.status[key] },
    }))
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS)
    onReset?.()
  }

  function handleApply() {
    onApply?.(filters)
  }

  return (
    <div className="border-border bg-card rounded-xl border p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal className="text-muted-foreground h-6 w-6" />
        <h2 className="text-foreground text-sm font-semibold">Filtros</h2>
      </div>

      {/* Fields grid — muda de layout via prop */}
      <div className={isRow ? 'space-y-4' : 'space-y-4'}>
        {/* Busca — sempre full width */}
        <div className="space-y-1.5">
          <Label className="text-muted-foreground text-xs">Buscar</Label>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              className="pl-9 text-sm"
              placeholder="Buscar por cooperativa, rota, ..."
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Origem + Destino + Data */}
        <div className={isRow ? 'grid grid-cols-3 gap-3' : 'space-y-4'}>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Origem</Label>
            <Input
              className="text-sm"
              placeholder="De onde?"
              value={filters.origin}
              onChange={(e) =>
                setFilters((p) => ({ ...p, origin: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Destino</Label>
            <Input
              className="text-sm"
              placeholder="Para onde?"
              value={filters.destination}
              onChange={(e) =>
                setFilters((p) => ({ ...p, destination: e.target.value }))
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Data</Label>
            <Input
              type="date"
              className="text-sm"
              value={filters.date}
              onChange={(e) =>
                setFilters((p) => ({ ...p, date: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Dia da semana + Status */}
        <div className={isRow ? 'grid grid-cols-2 gap-3' : 'space-y-4'}>
          {/* Dias da semana */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              Dia da semana
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.map((day) => (
                <Toggle
                  key={day.id}
                  size="sm"
                  pressed={filters.weekDays.includes(day.id)}
                  onPressedChange={() => toggleWeekDay(day.id)}
                  className="border-border data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground h-8 rounded-full border px-3 text-xs font-medium"
                >
                  {day.label}
                </Toggle>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Status</Label>
            <div className={isRow ? 'flex items-center gap-5' : 'space-y-2'}>
              {(
                [
                  { key: 'happening', label: 'Acontecendo agora' },
                  { key: 'upcoming', label: 'Próximos (2h)' },
                  { key: 'past', label: 'Já decorridos' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={filters.status[key]}
                    onCheckedChange={() => toggleStatus(key)}
                    className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor={key}
                    className="text-foreground/80 cursor-pointer text-xs select-none"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-border my-5 border-t" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button className="flex-1 text-sm font-medium" onClick={handleApply}>
          Aplicar filtro
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleReset}
          title="Limpar filtros"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
