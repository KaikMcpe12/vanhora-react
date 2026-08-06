import { type LucideIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface ChoiceChipsProps<T extends string> {
  options: ChoiceOption<T>[]
  value?: T
  onChange: (value: T) => void
  ariaLabel?: string
  className?: string
}

/**
 * Chips de escolha única sobre Radix ToggleGroup (roving tabindex, setas).
 * Alvos de toque de 44px (min-h-11). Entrada animada com Motion (escopo PR1).
 */
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: ChoiceChipsProps<T>) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value ?? ''}
      onValueChange={(next) => {
        if (next) onChange(next as T)
      }}
      aria-label={ariaLabel}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((opt, i) => {
        const Icon = opt.icon
        return (
          <motion.div
            key={opt.value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.18 }}
          >
            <ToggleGroupPrimitive.Item
              value={opt.value}
              className={cn(
                'border-input bg-background inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                'hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary',
              )}
            >
              {Icon && <Icon className="size-4" />}
              {opt.label}
            </ToggleGroupPrimitive.Item>
          </motion.div>
        )
      })}
    </ToggleGroupPrimitive.Root>
  )
}
