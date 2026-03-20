import { Check, Loader2, Navigation } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'

import { Skeleton } from './ui/skeleton'

const cities = [
  { id: '1', name: 'Fortaleza' },
  { id: '2', name: 'Sobral' },
  { id: '3', name: 'Juazeiro do Norte' },
  { id: '4', name: 'Cratéus' },
  { id: '5', name: 'Ipueiras' },
  { id: '6', name: 'Quixadá' },
  { id: '7', name: 'Iguatu' },
  { id: '8', name: 'Crato' },
]

interface CityPickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CityPicker({
  value,
  onChange,
  placeholder = 'Selecione uma cidade',
  disabled = false,
  className,
}: CityPickerProps) {
  const [open, setOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  setTimeout(() => {
    setIsLoading(false)
  }, 1000)
  
  const isError = false
  const refetch = () => {}

  if (isLoading) {
    return (
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        </div>
      </div>
    )
  }

  // ERROR STATE
  if (isError) {
    return (
      <div className="space-y-2">
        <div className="bg-destructive/10 border-destructive flex h-10 w-full items-center justify-between rounded-xl border px-3">
          <span className="text-destructive text-sm">
            Erro ao carregar cidades
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-6 text-xs"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  // EMPTY STATE
  if (cities.length === 0) {
    return (
      <div className="bg-muted/50 border-border flex h-10 w-full items-center rounded-xl border px-3">
        <span className="text-muted-foreground text-sm">
          Nenhuma cidade disponível
        </span>
      </div>
    )
  }

  const selectedCity = cities.find((city) => city.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'h-10 w-full justify-start text-left font-normal',
              'bg-muted/50 border-border rounded-xl',
              'hover:bg-muted/70 transition-colors',
              'focus:ring-primary focus:border-primary focus:ring-2',
              'focus-visible:ring-primary focus-visible:ring-2',
              'pr-10 pl-3',
              !value && 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
          >
            <span className="truncate">
              {selectedCity ? selectedCity.name : placeholder}
            </span>
          </Button>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Navigation className="text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar cidade..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {cities.map((city) => (
                <CommandItem
                  key={city.id}
                  value={city.name}
                  onSelect={() => {
                    onChange(city.id === value ? '' : city.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === city.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
