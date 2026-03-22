import { Calendar, Loader2, Search } from 'lucide-react'
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
  const { control, handleFilter, errors, watch } = useScheduleFilters()
  const [isSearching, setIsSearching] = useState(false)

  const currentFilters = watch()

  const onSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setIsSearching(true)

    setTimeout(() => {
      handleFilter(e)
      setIsSearching(false)
      toast.success('Busca realizada com sucesso!')
    }, 1200)
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
                    className="bg-muted/50 border-border rounded-xl"
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

          {/* Botão */}
          <div className="flex items-end">
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 h-10 w-full transition-colors"
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
          </div>
        </div>
      </div>
    </form>
  )
}
