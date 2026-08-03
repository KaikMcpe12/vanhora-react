import { IMaskInput } from 'react-imask'

import { cn } from '@/lib/utils'

interface PriceFieldProps {
  value?: number
  onChange: (value: number) => void
  id?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  invalid?: boolean
}

/**
 * Campo de preço em Real (BRL) com máscara numérica: separador de milhar `.`,
 * decimal `,` e 2 casas. Emite `number`. Controlado.
 */
export function PriceField({
  value,
  onChange,
  id,
  disabled,
  placeholder = '0,00',
  className,
  invalid,
}: PriceFieldProps) {
  return (
    <div
      className={cn(
        'flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        invalid && 'border-destructive',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <span className="shrink-0 text-sm text-muted-foreground">R$</span>
      <IMaskInput
        id={id}
        mask={Number}
        scale={2}
        thousandsSeparator="."
        radix=","
        mapToRadix={['.']}
        min={0}
        value={value == null || Number.isNaN(value) ? '' : String(value).replace('.', ',')}
        onAccept={(_val, mask) =>
          onChange(mask.unmaskedValue === '' ? 0 : Number(mask.unmaskedValue))
        }
        placeholder={placeholder}
        disabled={disabled}
        inputMode="decimal"
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
