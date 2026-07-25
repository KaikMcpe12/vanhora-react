import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
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
}: AdminTableProps<T>) {
  const alignClass: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-accent/30 hover:bg-accent/30">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  'h-11 px-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground',
                  alignClass[col.align ?? 'left'],
                  col.sortable && onSort && 'cursor-pointer select-none',
                )}
                onClick={
                  col.sortable && onSort ? () => onSort(col.key) : undefined
                }
              >
                {col.label}
                {col.sortable && onSort && (
                  <SortIcon columnKey={col.key} sortState={sortState} />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: LOADING_ROWS }).map((_, i) => (
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-4 py-3">
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
            data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                className={cn(
                  'text-[13px]',
                  onRowClick && 'cursor-pointer hover:bg-accent/30',
                )}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'px-4 py-3',
                      alignClass[col.align ?? 'left'],
                    )}
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
