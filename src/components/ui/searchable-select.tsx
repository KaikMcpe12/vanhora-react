import { Check, ChevronsUpDown } from 'lucide-react'
import { type ReactNode, useState } from 'react'

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

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps<T extends SearchableSelectOption> {
  options: T[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** rótulo da opção que limpa o filtro (value = null). Ex.: "Todas". */
  allLabel?: string
  /** render custom da opção (ex.: bolinha de cor da marca). Default: `label`. */
  renderOption?: (option: T) => ReactNode
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

/**
 * Combobox pesquisável genérico (cmdk + Popover). Para filtros com muitas
 * opções onde o Select simples fica ruim de navegar (>~8 itens).
 * `renderOption` permite render custom sem acoplar domínio ao primitivo.
 */
export function SearchableSelect<T extends SearchableSelectOption>({
  options,
  value,
  onChange,
  placeholder = 'Selecionar',
  searchPlaceholder = 'Buscar...',
  emptyText = 'Nenhum resultado.',
  allLabel,
  renderOption,
  disabled = false,
  className,
  triggerClassName,
}: SearchableSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  function select(next: string | null) {
    onChange(next)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-8 justify-between gap-2 text-xs font-normal',
            !selected && 'text-muted-foreground',
            triggerClassName,
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {selected
              ? (renderOption?.(selected) ?? selected.label)
              : (allLabel ?? placeholder)}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn('w-56 p-0', className)} align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="text-sm" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {allLabel && (
                <CommandItem value={allLabel} onSelect={() => select(null)}>
                  <Check
                    className={cn(
                      'size-4',
                      value === null ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {allLabel}
                </CommandItem>
              )}
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => select(opt.value)}
                >
                  <Check
                    className={cn(
                      'size-4',
                      value === opt.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  {renderOption?.(opt) ?? opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
