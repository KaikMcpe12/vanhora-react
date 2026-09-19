import { Check, User } from 'lucide-react'
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
import { MOCK_USERS } from '@/lib/data/mock-users'
import { cn } from '@/lib/utils'

const DRIVERS = MOCK_USERS.filter((user) => user.role === 'driver')

interface DriverPickerProps {
  /** Nome do motorista selecionado. */
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * Seletor de motorista com busca (Popover + Command), mesmo padrão do
 * `CityPicker`. Emite o nome do motorista para casar com `driverName` das rotas.
 */
export function DriverPicker({
  value,
  onChange,
  placeholder = 'Selecione um motorista',
  disabled = false,
  className,
}: DriverPickerProps) {
  const [open, setOpen] = useState(false)

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
              'focus-visible:ring-primary focus-visible:ring-2',
              'pr-10 pl-3',
              value ? 'text-foreground' : 'text-muted-foreground',
              disabled && 'cursor-not-allowed opacity-50',
              className,
            )}
          >
            <span className="truncate">{value || placeholder}</span>
          </Button>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <User className="text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar motorista..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhum motorista encontrado.</CommandEmpty>
            <CommandGroup>
              {DRIVERS.map((driver) => (
                <CommandItem
                  key={driver.id}
                  value={driver.name}
                  onSelect={() => {
                    onChange(driver.name === value ? '' : driver.name)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === driver.name ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {driver.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
