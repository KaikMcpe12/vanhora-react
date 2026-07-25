import { Search } from 'lucide-react'
import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'

interface AdminFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
}

export function AdminFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  filters,
  actions,
}: AdminFilterBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {filters && (
        <div className="flex items-center gap-2">{filters}</div>
      )}
      {actions && (
        <>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <div className="flex items-center gap-2">{actions}</div>
        </>
      )}
    </div>
  )
}
