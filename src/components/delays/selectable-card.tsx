import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SelectableCardProps {
  selected: boolean
  onSelect: () => void
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  disabled?: boolean
  index?: number
}

/**
 * Cartão selecionável com semântica de radio (usar dentro de role="radiogroup").
 * Flat design: destaque por `border-l-4`. Entrada animada com Motion (escopo PR1).
 */
export function SelectableCard({
  selected,
  onSelect,
  title,
  subtitle,
  meta,
  disabled,
  index = 0,
}: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={cn(
        'bg-card border-input flex min-h-14 w-full items-center gap-3 rounded-lg border border-l-4 p-4 text-left transition-colors',
        'hover:bg-muted focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        selected ? 'border-l-primary bg-primary/5' : 'border-l-transparent',
        disabled && 'pointer-events-none opacity-50',
      )}
    >
      <div className="flex-1 space-y-0.5">
        <div className="font-medium">{title}</div>
        {subtitle && (
          <div className="text-muted-foreground text-sm">{subtitle}</div>
        )}
      </div>
      {meta}
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input',
        )}
      >
        {selected && <Check className="size-4" />}
      </span>
    </motion.button>
  )
}
