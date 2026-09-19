import { Calendar } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DateFieldProps {
  value?: string
  onChange: (value: string) => void
  id?: string
  disabled?: boolean
  min?: string
  max?: string
  className?: string
  invalid?: boolean
}

/**
 * Campo de data sobre `<input type="date">` nativo com ícone e estilo padrão.
 * Emite `yyyy-mm-dd`. Controlado — combine com validação Zod.
 */
export function DateField({
  value,
  onChange,
  id,
  disabled,
  min,
  max,
  className,
  invalid,
}: DateFieldProps) {
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
      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        id={id}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-calendar-picker-indicator]:opacity-70"
      />
    </div>
  )
}
