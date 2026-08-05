import { Search } from 'lucide-react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'

type CooperativesSearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function CooperativesSearchBar({
  value,
  onChange,
  placeholder = 'Buscar cooperativa por nome...',
  className,
}: CooperativesSearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(v), 300)
  }

  return (
    <div
      className={cn(
        'mb-4 flex h-12 items-center gap-3 rounded-[12px] border border-border/60 bg-card px-4',
        'transition-colors focus-within:border-primary',
        className,
      )}
    >
      <Search size={18} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
      <input
        type="text"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}
