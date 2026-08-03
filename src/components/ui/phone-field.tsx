import { Phone } from 'lucide-react'
import { IMaskInput } from 'react-imask'

import { cn } from '@/lib/utils'

interface PhoneFieldProps {
  value?: string
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  invalid?: boolean
}

/**
 * Telefone brasileiro com máscara dinâmica: aceita fixo `(00) 0000-0000` e
 * celular `(00) 00000-0000`. Emite a string mascarada. Controlado.
 */
export function PhoneField({
  value,
  onChange,
  id,
  disabled,
  placeholder = '(00) 00000-0000',
  className,
  invalid,
}: PhoneFieldProps) {
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
      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
      <IMaskInput
        id={id}
        mask={[{ mask: '(00) 0000-0000' }, { mask: '(00) 00000-0000' }]}
        value={value ?? ''}
        onAccept={(val: string) => onChange(val)}
        placeholder={placeholder}
        disabled={disabled}
        inputMode="numeric"
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
