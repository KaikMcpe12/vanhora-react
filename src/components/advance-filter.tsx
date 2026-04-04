import { SlidersHorizontal, X } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { CooperativePicker } from '@/components/cooperative-picker'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Toggle } from '@/components/ui/toggle'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'

const WEEK_DAYS = [
  { id: 'monday', label: 'Seg' },
  { id: 'tuesday', label: 'Ter' },
  { id: 'wednesday', label: 'Qua' },
  { id: 'thursday', label: 'Qui' },
  { id: 'friday', label: 'Sex' },
  { id: 'saturday', label: 'Sáb' },
  { id: 'sunday', label: 'Dom' },
]

export function AdvanceFilter() {
  const {
    register,
    control,
    handleFilter,
    updateField,
    hasAdvancedFilters,
    errors,
    watch,
  } = useScheduleFilters()

  const currentFilters = watch()

  const advancedFiltersCount = [
    currentFilters.cooperative,
    currentFilters.dayOfWeek?.length,
    currentFilters.priceMin !== undefined ||
      currentFilters.priceMax !== undefined,
    currentFilters.minRating !== undefined,
  ].filter(Boolean).length

  const toggleDayOfWeek = (day: string) => {
    const current = currentFilters.dayOfWeek || []
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day]

    updateField('dayOfWeek', updated)
  }

  const handleClearAdvancedOnly = () => {
    updateField('cooperative', '')
    updateField('dayOfWeek', [])
    updateField('priceMin', undefined)
    updateField('priceMax', undefined)
    updateField('minRating', undefined)
  }

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      {/* header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary h-5 w-5" />
            <h3 className="font-semibold">Filtros Avançados</h3>
            {advancedFiltersCount > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                {advancedFiltersCount}
              </span>
            )}
          </div>

          {hasAdvancedFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAdvancedOnly}
              className="h-7 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* conteúdo */}
      <div className="space-y-4 p-4">
        <form onSubmit={handleFilter} className="space-y-4">
          {/* cooperativa */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cooperativa</Label>
            <Controller
              name="cooperative"
              control={control}
              render={({ field }) => (
                <CooperativePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Todas as cooperativas"
                />
              )}
            />
            {errors.cooperative && (
              <p className="text-destructive text-xs">
                {errors.cooperative.message}
              </p>
            )}
          </div>

          {/* dias da semana */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dias da semana</Label>
            <p className="text-muted-foreground mb-3 text-xs">
              Buscar horários que operam nesses dias específicos
            </p>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <Toggle
                  key={day.id}
                  type="button"
                  size="sm"
                  pressed={(currentFilters.dayOfWeek || []).includes(day.id)}
                  onPressedChange={() => toggleDayOfWeek(day.id)}
                  className="data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border-border h-8 rounded-lg border px-3 text-xs font-medium transition-colors"
                >
                  {day.label}
                </Toggle>
              ))}
            </div>
            {errors.dayOfWeek && (
              <p className="text-destructive text-xs">
                {errors.dayOfWeek.message}
              </p>
            )}
          </div>

          {/* faixa de preço */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Faixa de preço</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Mínimo</Label>
                <InputGroup>
                  <InputGroupAddon className="border-r-0">
                    <span className="text-xs">R$</span>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="number"
                    min={0}
                    max={1000}
                    placeholder="0"
                    {...register('priceMin', {
                      setValueAs: (value) =>
                        value === '' ? undefined : Number(value),
                    })}
                    className="bg-muted/50 border-border rounded-xl"
                  />
                </InputGroup>
                {errors.priceMin && (
                  <p className="text-destructive text-xs">
                    {errors.priceMin.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">Máximo</Label>
                <InputGroup>
                  <InputGroupAddon className="border-r-0">
                    <span className="text-xs">R$</span>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="number"
                    min={0}
                    max={1000}
                    placeholder="100"
                    {...register('priceMax', {
                      setValueAs: (value) =>
                        value === '' ? undefined : Number(value),
                    })}
                    className="bg-muted/50 border-border rounded-xl"
                  />
                </InputGroup>
                {errors.priceMax && (
                  <p className="text-destructive text-xs">
                    {errors.priceMax.message}
                  </p>
                )}
              </div>
            </div>

            {(currentFilters.priceMin || currentFilters.priceMax) && (
              <p className="text-muted-foreground text-xs">
                Faixa: R$ {currentFilters.priceMin || '0'} - R${' '}
                {currentFilters.priceMax || '∞'}
              </p>
            )}
          </div>

          {/* avaliação mínima */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Avaliação mínima</Label>
              {currentFilters.minRating && (
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                  {currentFilters.minRating}+ ⭐
                </span>
              )}
            </div>
            <Controller
              name="minRating"
              control={control}
              render={({ field: { value, onChange } }) => (
                <Slider
                  min={0}
                  max={5}
                  step={0.5}
                  value={[value || 0]}
                  onValueChange={([newValue]) =>
                    onChange(newValue > 0 ? newValue : undefined)
                  }
                  className="py-2"
                />
              )}
            />
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>Qualquer</span>
              <span>5 estrelas</span>
            </div>
            {errors.minRating && (
              <p className="text-destructive text-xs">
                {errors.minRating.message}
              </p>
            )}
          </div>

          {/* botão aplicar */}
          <div className="border-t pt-3">
            <Button type="submit" className="w-full" size="sm">
              Aplicar Filtros Avançados
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
