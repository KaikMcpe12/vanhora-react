import { Check, Loader2, Users } from 'lucide-react'
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

const cooperatives = [
  { id: '1', name: 'Cooperativa A' },
  { id: '2', name: 'Cooperativa B' },
  { id: '3', name: 'Cooperativa C' },
  { id: '4', name: 'Cooperativa D' },
  { id: '5', name: 'Cooperativa E' },
  { id: '6', name: 'Cooperativa F' },
]

interface CooperativePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CooperativePicker({
  value,
  onChange,
  placeholder = 'Selecione uma cooperativa',
  disabled = false,
  className,
}: CooperativePickerProps) {
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

  if (isError) {
    return (
      <div className="space-y-2">
        <div className="bg-destructive/10 border-destructive flex h-10 w-full items-center justify-between rounded-xl border px-3">
          <span className="text-destructive text-sm">
            Erro ao carregar cooperativas
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

  if (cooperatives.length === 0) {
    return (
      <div className="bg-muted/50 border-border flex h-10 w-full items-center rounded-xl border px-3">
        <span className="text-muted-foreground text-sm">
          Nenhuma cooperativa disponível
        </span>
      </div>
    )
  }

  const selectedCooperative = cooperatives.find(
    (cooperative) => cooperative.id === value,
  )

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
              {selectedCooperative ? selectedCooperative.name : placeholder}
            </span>
          </Button>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Users className="text-muted-foreground h-4 w-4" />
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Buscar cooperativa..." className="h-9" />
          <CommandList>
            <CommandEmpty>Nenhuma cooperativa encontrada.</CommandEmpty>
            <CommandGroup>
              {cooperatives.map((cooperative) => (
                <CommandItem
                  key={cooperative.id}
                  value={cooperative.name}
                  onSelect={() => {
                    onChange(cooperative.id === value ? '' : cooperative.id)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === cooperative.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {cooperative.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
