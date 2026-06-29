import { AdvanceFilter } from '@/components/advance-filter'
import { cn } from '@/lib/utils'

interface FilterPanelProps {
  className?: string
}

export function FilterPanel({ className }: FilterPanelProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <span className="block text-[10px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
        Filtros
      </span>

      {/* Prompt 3 redesenhará este bloco com chips e seções colapsáveis.
          Por ora, o AdvanceFilter existente garante que os filtros continuam
          acessíveis sem regressão. */}
      <AdvanceFilter />
    </div>
  )
}
