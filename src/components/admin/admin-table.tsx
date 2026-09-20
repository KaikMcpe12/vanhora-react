import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react'
import { type ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { AdminEmptyState } from './admin-empty-state'

export interface AdminTableColumn<T> {
  key: string
  label: string
  render: (item: T) => ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  hideOnMobile?: boolean
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  emptyState?: ReactNode
  isLoading?: boolean
  onRowClick?: (item: T) => void
  sortState?: { key: string; direction: 'asc' | 'desc' }
  onSort?: (key: string) => void
  /**
   * Atributos extras por linha (id, data-*, className). Usado por páginas com
   * deep-link `?highlight=<uuid>` para marcar a linha alvo do scroll/pulse.
   */
  getRowAttrs?: (item: T) => {
    id?: string
    className?: string
    'data-highlight'?: string
  }
}

function SortIcon({
  columnKey,
  sortState,
}: {
  columnKey: string
  sortState?: { key: string; direction: 'asc' | 'desc' }
}) {
  if (!sortState || sortState.key !== columnKey) {
    return <ChevronsUpDown className="ml-1 inline h-3 w-3 opacity-50" />
  }
  if (sortState.direction === 'asc') {
    return <ChevronUp className="ml-1 inline h-3 w-3" />
  }
  return <ChevronDown className="ml-1 inline h-3 w-3" />
}

const LOADING_ROWS = 5

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  isLoading = false,
  onRowClick,
  sortState,
  onSort,
  getRowAttrs,
}: AdminTableProps<T>) {
  const alignClass: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className="border-border overflow-hidden rounded-xl border">
      {/* scroll wrapper — em viewports estreitas as colunas não são cortadas: a tabela rola horizontalmente. */}
      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow className="bg-accent/30 hover:bg-accent/30">
            {columns.map((col) => {
              const isSortable = Boolean(col.sortable && onSort)
              const ariaSort = isSortable
                ? sortState?.key === col.key
                  ? sortState.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
                : undefined
              return (
                <TableHead
                  key={col.key}
                  aria-sort={ariaSort}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'text-muted-foreground h-11 px-4 text-[11px] font-medium tracking-wide uppercase',
                    alignClass[col.align ?? 'left'],
                    col.hideOnMobile && 'hidden sm:table-cell',
                  )}
                >
                  {isSortable ? (
                    <button
                      type="button"
                      onClick={() => onSort!(col.key)}
                      className="focus-visible:ring-ring/50 -mx-1 inline-flex items-center rounded px-1 uppercase select-none focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {col.label}
                      <SortIcon columnKey={col.key} sortState={sortState} />
                    </button>
                  ) : (
                    col.label
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: LOADING_ROWS }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      col.hideOnMobile && 'hidden sm:table-cell',
                    )}
                  >
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                {emptyState ?? (
                  <AdminEmptyState title="Nenhum item encontrado" />
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const rowAttrs = getRowAttrs?.(item)
              return (
              <TableRow
                key={keyExtractor(item)}
                id={rowAttrs?.id}
                data-highlight={rowAttrs?.['data-highlight']}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onRowClick(item)
                        }
                      }
                    : undefined
                }
                className={cn(
                  'text-[13px]',
                  onRowClick &&
                    'hover:bg-accent/30 focus-visible:bg-accent/30 focus-visible:ring-ring/50 cursor-pointer focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
                  rowAttrs?.className,
                )}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      alignClass[col.align ?? 'left'],
                      col.hideOnMobile && 'hidden sm:table-cell',
                    )}
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
