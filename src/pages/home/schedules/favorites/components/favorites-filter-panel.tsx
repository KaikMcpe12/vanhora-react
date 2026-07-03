import { CooperativeAvatar } from '@/components/cooperative-avatar'
import { cn } from '@/lib/utils'

export type FavoritesFilters = {
  routeKeys: string[]
  cooperativeNames: string[]
  status: 'all' | 'active' | 'cancelled'
}

export type AvailableRoute = {
  id: string
  label: string
  count: number
}

export type AvailableCoop = {
  name: string
  color: string
  count: number
}

type FavoritesFilterPanelProps = {
  filters: FavoritesFilters
  onFiltersChange: (f: FavoritesFilters) => void
  availableRoutes: AvailableRoute[]
  availableCooperatives: AvailableCoop[]
}

const STATUS_OPTIONS: { value: FavoritesFilters['status']; label: string }[] = [
  { value: 'active', label: 'Ativos' },
  { value: 'cancelled', label: 'Cancelados hoje' },
  { value: 'all', label: 'Todos' },
]

export function FavoritesFilterPanel({
  filters,
  onFiltersChange,
  availableRoutes,
  availableCooperatives,
}: FavoritesFilterPanelProps) {
  const activeCount =
    filters.routeKeys.length +
    filters.cooperativeNames.length +
    (filters.status !== 'all' ? 1 : 0)

  const toggleRoute = (id: string) => {
    const next = filters.routeKeys.includes(id)
      ? filters.routeKeys.filter((r) => r !== id)
      : [...filters.routeKeys, id]
    onFiltersChange({ ...filters, routeKeys: next })
  }

  const toggleCoop = (name: string) => {
    const next = filters.cooperativeNames.includes(name)
      ? filters.cooperativeNames.filter((c) => c !== name)
      : [...filters.cooperativeNames, name]
    onFiltersChange({ ...filters, cooperativeNames: next })
  }

  const clearAll = () => {
    onFiltersChange({ routeKeys: [], cooperativeNames: [], status: 'active' })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Rotas */}
      {availableRoutes.length > 0 && (
        <div>
          <span className="mb-3 block text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
            Rotas dos seus favoritos
          </span>
          <div className="flex flex-col gap-2">
            {availableRoutes.map((route) => {
              const checked = filters.routeKeys.includes(route.id)
              return (
                <label
                  key={route.id}
                  className="flex cursor-pointer items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRoute(route.id)}
                      className="h-3.5 w-3.5 accent-primary cursor-pointer"
                    />
                    <span className={cn('text-[13px]', checked ? 'font-medium text-foreground' : 'text-foreground/80')}>
                      {route.label}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{route.count}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Cooperativas */}
      {availableCooperatives.length > 0 && (
        <div>
          <span className="mb-3 block text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
            Cooperativas
          </span>
          <div className="flex flex-col gap-2">
            {availableCooperatives.map((coop) => {
              const checked = filters.cooperativeNames.includes(coop.name)
              return (
                <label
                  key={coop.name}
                  className="flex cursor-pointer items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCoop(coop.name)}
                      className="h-3.5 w-3.5 accent-primary cursor-pointer"
                    />
                    <CooperativeAvatar name={coop.name} color={coop.color} size="sm" />
                    <span className={cn('text-[13px]', checked ? 'font-medium text-foreground' : 'text-foreground/80')}>
                      {coop.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{coop.count}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <span className="mb-3 block text-[11px] font-medium uppercase tracking-[0.6px] text-muted-foreground">
          Status
        </span>
        <div className="flex flex-col gap-2">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="favorites-status"
                checked={filters.status === value}
                onChange={() => onFiltersChange({ ...filters, status: value })}
                className="h-3.5 w-3.5 accent-primary cursor-pointer"
              />
              <span className={cn('text-[13px]', filters.status === value ? 'font-medium text-foreground' : 'text-foreground/80')}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Limpar */}
      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="cursor-pointer text-left text-[12px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
