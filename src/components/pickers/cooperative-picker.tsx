import {
  SearchableSelect,
  type SearchableSelectOption,
} from '@/components/ui/searchable-select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type CooperativeOption,
  useCooperativeOptions,
} from '@/lib/api/mock-cooperatives-api'
import { cn } from '@/lib/utils'

interface CooperativePickerProps {
  value: string // '' significa "todas"
  onChange: (id: string) => void
  placeholder?: string
  /** mostra a opção "Todas as cooperativas" (default true) */
  allowAll?: boolean
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

type CoopSelectOption = SearchableSelectOption & { brandColor: string }

function BrandDot({ color }: { color: string }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}

/**
 * Picker de domínio de cooperativa. Consome `useCooperativeOptions` (React Query,
 * sem loading fake) e renderiza a bolinha da cor da marca via `renderOption`.
 * `value=''` = "todas" (sentinel preservado para filtros).
 */
export function CooperativePicker({
  value,
  onChange,
  placeholder = 'Selecionar cooperativa',
  allowAll = true,
  disabled = false,
  className,
  triggerClassName,
}: CooperativePickerProps) {
  const { data, isLoading, isError, refetch } = useCooperativeOptions()

  if (isLoading) {
    return <Skeleton className={cn('h-8 w-44 rounded-md', triggerClassName)} />
  }

  if (isError) {
    return (
      <button
        type="button"
        onClick={() => refetch()}
        className="border-destructive text-destructive h-8 rounded-md border px-3 text-xs"
      >
        Erro ao carregar — tentar novamente
      </button>
    )
  }

  const options: CoopSelectOption[] = (data ?? []).map(
    (c: CooperativeOption) => ({
      value: c.id,
      label: c.name,
      brandColor: c.brandColor,
    }),
  )

  return (
    <SearchableSelect
      options={options}
      value={value || null}
      onChange={(next) => onChange(next ?? '')}
      placeholder={placeholder}
      searchPlaceholder="Buscar cooperativa"
      allLabel={allowAll ? 'Todas as cooperativas' : undefined}
      renderOption={(o) => (
        <span className="flex min-w-0 items-center gap-2">
          <BrandDot color={o.brandColor} />
          <span className="truncate">{o.label}</span>
        </span>
      )}
      disabled={disabled}
      className={className}
      triggerClassName={triggerClassName}
    />
  )
}
