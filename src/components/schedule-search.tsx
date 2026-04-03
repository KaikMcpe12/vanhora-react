import { Calendar, Loader2, Search, X } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'

import { CityPicker } from '@/components/city-picker'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'

export function ScheduleSearch() {
  const { control, handleFilter, handleClearFilters, errors, watch } =
    useScheduleFilters()
  const [isSearching, setIsSearching] = useState(false)

  const currentFilters = watch()

  // Mostrar botão limpar apenas se origem ou destino estiverem preenchidos
  // (ignora data porque data default de hoje não conta como "filtro ativo")
  const showClearButton = Boolean(
    currentFilters.origin || currentFilters.destination,
  )

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setIsSearching(true)

    setTimeout(() => {
      handleFilter(e)
      setIsSearching(false)
      toast.success('Busca realizada com sucesso!')
    }, 1200)
  }

  const onClear = () => {
    handleClearFilters()
    toast.info('Filtros limpos')
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="bg-card rounded-xl border p-4 shadow-lg">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Origem
            </label>
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <CityPicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="De onde?"
                  disabled={isSearching}
                />
              )}
            />
            {errors.origin && (
              <p className="text-destructive mt-1 text-[10px]">
                {errors.origin.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Destino
            </label>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <CityPicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Para onde?"
                  disabled={isSearching}
                />
              )}
            />
            {errors.destination && (
              <p className="text-destructive mt-1 text-[10px]">
                {errors.destination.message}
              </p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              Data
            </label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <InputGroup>
                  <InputGroupInput
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    className="bg-muted/50 border-border text-foreground rounded-xl [&::-webkit-calendar-picker-indicator]:invert-0 dark:[&::-webkit-calendar-picker-indicator]:invert"
                    disabled={isSearching}
                  />
                  <InputGroupAddon>
                    <Calendar className="text-muted-foreground h-4 w-4" />
                  </InputGroupAddon>
                </InputGroup>
              )}
            />
            {errors.date && (
              <p className="text-destructive mt-1 text-[10px]">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex items-end gap-2">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 h-10 flex-1 transition-colors"
              disabled={
                isSearching ||
                (!currentFilters.origin &&
                  !currentFilters.destination &&
                  !currentFilters.date)
              }
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>

            {showClearButton && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="bg-card text-foreground hover:bg-muted h-10 w-10 shrink-0"
                onClick={onClear}
                disabled={isSearching}
                title="Limpar filtros"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
