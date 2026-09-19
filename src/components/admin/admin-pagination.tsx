import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminPaginationProps {
  /** 0-indexed (padrão do useTableFilters) */
  page: number
  perPage: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

/**
 * Paginação reutilizável do admin. "N–M de T" à esquerda, controles à direita.
 * Escondida quando cabe tudo em uma página (`total <= perPage`).
 */
export function AdminPagination({
  page,
  perPage,
  total,
  onPageChange,
  className,
}: AdminPaginationProps) {
  if (total <= perPage) return null

  const totalPages = Math.ceil(total / perPage)
  const start = page * perPage + 1
  const end = Math.min((page + 1) * perPage, total)
  const isFirst = page <= 0
  const isLast = page >= totalPages - 1

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <p className="text-muted-foreground text-xs">
        {start}–{end} de {total}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={isFirst}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-muted-foreground px-2 text-xs tabular-nums">
          {page + 1} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={isLast}
          onClick={() => onPageChange(page + 1)}
        >
          Próximo
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
