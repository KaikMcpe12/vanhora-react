import { Clock } from 'lucide-react'
import { IMask, IMaskInput } from 'react-imask'

import { cn } from '@/lib/utils'

interface TimeFieldProps {
  value?: string
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  placeholder?: string
  className?: string
  invalid?: boolean
}

/**
 * Campo de horário com máscara `hh:mm` (react-imask). Bloqueia horas > 23 e
 * minutos > 59 durante a digitação; combine com validação Zod para o submit.
 * Controlado — pronto para `Controller` do react-hook-form.
 */
export function TimeField({
  value,
  onChange,
  id,
  disabled,
  placeholder = 'hh:mm',
  className,
  invalid,
}: TimeFieldProps) {
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
      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
      <IMaskInput
        id={id}
        mask="HH:MM"
        blocks={{
          HH: { mask: IMask.MaskedRange, from: 0, to: 23, maxLength: 2 },
          MM: { mask: IMask.MaskedRange, from: 0, to: 59, maxLength: 2 },
        }}
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
