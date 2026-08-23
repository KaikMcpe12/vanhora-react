import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type Weekday = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

const DAYS: { value: Weekday; label: string }[] = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sáb' },
  { value: 'dom', label: 'Dom' },
]

const WEEKDAYS: Weekday[] = ['seg', 'ter', 'qua', 'qui', 'sex']
const WEEKEND: Weekday[] = ['sab', 'dom']
const ALL: Weekday[] = DAYS.map((d) => d.value)

interface WeekdayPickerProps {
  value: Weekday[]
  onChange: (days: Weekday[]) => void
  disabled?: boolean
  /** `multi` (rotas/horários) permite vários dias; `single` só um. */
  mode?: 'multi' | 'single'
  /** botões "Dias úteis" / "Fim de semana" / "Todos" (só em multi) */
  presets?: boolean
  className?: string
}

/**
 * Seleção de dias da semana. Chips ≥44px (§6). `multi` alterna cada dia;
 * `single` mantém exatamente um selecionado (clicar em outro troca).
 */
export function WeekdayPicker({
  value,
  onChange,
  disabled = false,
  mode = 'multi',
  presets = true,
  className,
}: WeekdayPickerProps) {
  const showPresets = presets && mode === 'multi'

  function toggle(day: Weekday) {
    if (mode === 'single') {
      onChange([day])
      return
    }
    onChange(
      value.includes(day) ? value.filter((d) => d !== day) : [...value, day],
    )
  }

  const sameSet = (a: Weekday[], b: Weekday[]) =>
    a.length === b.length && a.every((d) => b.includes(d))

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Dias da semana"
      >
        {DAYS.map((day) => {
          const active = value.includes(day.value)
          return (
            <button
              key={day.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => toggle(day.value)}
              className={cn(
                'flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground hover:bg-accent',
                disabled && 'pointer-events-none opacity-50',
              )}
            >
              {day.label}
            </button>
          )
        })}
      </div>

      {showPresets && (
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { label: 'Dias úteis', days: WEEKDAYS },
              { label: 'Fim de semana', days: WEEKEND },
              { label: 'Todos', days: ALL },
            ] as const
          ).map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => onChange(preset.days)}
              className={cn(
                'h-7 rounded-full px-3 text-xs',
                sameSet(value, preset.days) &&
                  'bg-accent text-accent-foreground',
              )}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
