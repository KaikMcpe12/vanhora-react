import { Calendar, X } from 'lucide-react'
import { Controller } from 'react-hook-form'

import { CityPicker } from '@/components/city-picker'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'

interface EditSearchSheetProps {
  open: boolean
  onClose: () => void
}

export function EditSearchSheet({ open, onClose }: EditSearchSheetProps) {
  const { control, handleFilter, errors } = useScheduleFilters()

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilter(e as React.FormEvent<HTMLFormElement>)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl px-5 pb-8 pt-5 sm:max-w-md sm:rounded-2xl"
      >
        <SheetHeader className="mb-5 flex-row items-center justify-between">
          <SheetTitle className="text-base font-semibold">Alterar busca</SheetTitle>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">De onde você sai?</Label>
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <CityPicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Fortaleza"
                />
              )}
            />
            {errors.origin && (
              <p className="text-destructive text-[10px]">{errors.origin.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Para onde você vai?</Label>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <CityPicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Sobral"
                />
              )}
            />
            {errors.destination && (
              <p className="text-destructive text-[10px]">{errors.destination.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Data</Label>
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
                  />
                  <InputGroupAddon>
                    <Calendar className="text-muted-foreground h-4 w-4" />
                  </InputGroupAddon>
                </InputGroup>
              )}
            />
            {errors.date && (
              <p className="text-destructive text-[10px]">{errors.date.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Buscar horários
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
