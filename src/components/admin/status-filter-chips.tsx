import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

interface StatusFilterChip {
  value: string
  label: string
}

interface StatusFilterChipsProps {
  options: StatusFilterChip[]
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function StatusFilterChips({
  options,
  value,
  onChange,
  className,
}: StatusFilterChipsProps) {
  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v))
    } else {
      onChange([...value, v])
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {options.map((opt) => (
        <Toggle
          key={opt.value}
          pressed={value.includes(opt.value)}
          onPressedChange={() => toggle(opt.value)}
          variant="outline"
          size="sm"
          className="h-8 rounded-full px-3 text-xs font-medium data-[state=on]:bg-accent data-[state=on]:text-foreground"
        >
          {opt.label}
        </Toggle>
      ))}
    </div>
  )
}
