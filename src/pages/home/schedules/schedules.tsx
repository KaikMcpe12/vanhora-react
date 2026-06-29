import { ClockAlert, CalendarOff } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeleton } from '@/components/schedule-card-skeleton'
import { EmptyState } from '@/components/empty-state'
import { useFavorites } from '@/hooks/use-favorites'
import { useGroupedSchedules } from '@/hooks/use-grouped-schedules'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'
import type { SortMode } from '@/lib/utils/group-schedules'

import { CompactSearchBar } from './components/compact-search-bar'
import { EditSearchSheet } from './components/edit-search-sheet'
import { FeaturedScheduleCard } from './components/featured-schedule-card'
import { FilterToolbar } from './components/filter-toolbar'
import { ScheduleSection } from './components/schedule-section'

const GRID_PAGE_SIZE = 6

function SchedulesSkeleton() {
  return (
    <div className="space-y-8 px-4 py-6">
      <div className="space-y-3">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        <ScheduleCardSkeleton />
      </div>
      <div className="space-y-3">
        <div className="h-3 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <ScheduleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function Schedules() {
  const { filtersFromUrl, activeFiltersCount, handleClearFilters } =
    useScheduleFilters()
  const { count: favCount } = useFavorites()

  const [sortMode, setSortMode] = useState<SortMode>('earliest')
  const [visibleLater, setVisibleLater] = useState(GRID_PAGE_SIZE)
  const [visibleCancelled, setVisibleCancelled] = useState(GRID_PAGE_SIZE)
  const [searchSheetOpen, setSearchSheetOpen] = useState(false)

  // Resetar paginação quando filtros mudam
  useEffect(() => {
    setVisibleLater(GRID_PAGE_SIZE)
    setVisibleCancelled(GRID_PAGE_SIZE)
  }, [filtersFromUrl])

  const { grouped, isLoading, isError } = useGroupedSchedules(
    filtersFromUrl,
    sortMode,
  )

  // Data de referência para countdowns: usa a data do filtro (pode ser amanhã)
  // ou a data de hoje quando não há filtro de data
  const referenceDate = filtersFromUrl.date
    ? new Date(filtersFromUrl.date + 'T00:00:00')
    : undefined

  const totalActive = grouped
    ? (grouped.nextDeparture ? 1 : 0) +
      grouped.urgent.length +
      grouped.later.length
    : 0

  // "só cancelados" = há cancelados MAS nenhuma saída ativa futura E a lista
  // não está vazia (hasNoSchedules cobre o caso totalmente vazio)
  const onlyHasCancelled =
    !isLoading &&
    grouped !== null &&
    totalActive === 0 &&
    grouped.cancelled.length > 0

  const hasNoSchedules =
    !isLoading &&
    grouped !== null &&
    totalActive === 0 &&
    grouped.cancelled.length === 0

  const hasNoResults =
    !isLoading &&
    grouped !== null &&
    grouped.nextDeparture === null &&
    grouped.urgent.length === 0 &&
    grouped.later.length === 0 &&
    grouped.cancelled.length === 0

  return (
    <div className="min-h-screen bg-background">
      {/* ── barra de busca compacta ── */}
      <CompactSearchBar
        origin={filtersFromUrl.origin}
        destination={filtersFromUrl.destination}
        date={filtersFromUrl.date}
        onEdit={() => setSearchSheetOpen(true)}
      />

      {/* ── toolbar de filtros ── */}
      <FilterToolbar
        activeFiltersCount={activeFiltersCount}
        favoritesCount={favCount}
        sortMode={sortMode}
        onSortChange={setSortMode}
      />

      {/* ── conteúdo principal ── */}
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6">
        {isLoading && <SchedulesSkeleton />}

        {isError && (
          <EmptyState
            icon={ClockAlert}
            title="Erro ao carregar horários"
            description="Não foi possível buscar os horários. Tente novamente."
            action={{
              label: 'Tentar novamente',
              onClick: () => window.location.reload(),
            }}
          />
        )}

        {/* Sem resultados */}
        {hasNoSchedules && (
          <EmptyState
            icon={ClockAlert}
            title="Nenhum horário encontrado"
            description="Não encontramos horários para essa rota e data."
            action={{
              label: 'Alterar busca',
              onClick: () => setSearchSheetOpen(true),
            }}
          />
        )}

        {/* Sem resultados depois dos filtros */}
        {hasNoResults && activeFiltersCount > 0 && (
          <EmptyState
            icon={ClockAlert}
            title="Nenhum horário corresponde aos filtros"
            description="Tente ajustar ou limpar os filtros aplicados."
            action={{
              label: 'Limpar filtros',
              onClick: handleClearFilters,
            }}
          />
        )}

        {/* Alerta: só cancelados */}
        {onlyHasCancelled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
            Todos os horários de hoje para essa rota foram cancelados.
          </div>
        )}

        {grouped && !isLoading && (
          <>
            {/* ── Próxima saída ── */}
            {!hasNoSchedules && (
              <ScheduleSection
                title="Próxima saída"
                countLabel="a mais próxima de você"
                variant="featured"
              >
                {grouped.nextDeparture ? (
                  <FeaturedScheduleCard
                    schedule={grouped.nextDeparture}
                    referenceDate={referenceDate}
                  />
                ) : (
                  /* Todas as saídas do dia já passaram */
                  <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-border/60 bg-muted/20 px-6 py-8 text-center">
                    <CalendarOff
                      size={28}
                      strokeWidth={1.5}
                      className="text-muted-foreground"
                    />
                    <p className="text-[13px] text-muted-foreground">
                      Nenhuma saída restante para hoje nessa rota.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchSheetOpen(true)}
                      className="cursor-pointer text-[13px] font-medium text-primary transition-opacity hover:opacity-75"
                    >
                      Ver horários de outro dia →
                    </button>
                  </div>
                )}
              </ScheduleSection>
            )}

            {/* ── Saindo nos próximos 30 min ── */}
            {grouped.urgent.length > 0 && (
              <ScheduleSection
                title="Saindo nos próximos 30 minutos"
                count={grouped.urgent.length}
                variant="grid"
              >
                {grouped.urgent.map((s) => (
                  <ScheduleCard key={s.id} schedule={s} referenceDate={referenceDate} />
                ))}
              </ScheduleSection>
            )}

            {/* ── Mais tarde hoje ── */}
            {grouped.later.length > 0 && (
              <ScheduleSection
                title="Mais tarde hoje"
                count={grouped.later.length}
                variant="grid"
              >
                {grouped.later.slice(0, visibleLater).map((s) => (
                  <ScheduleCard key={s.id} schedule={s} referenceDate={referenceDate} />
                ))}

                {visibleLater < grouped.later.length && (
                  <div className="col-span-full pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleLater((v) => v + GRID_PAGE_SIZE)}
                      className="cursor-pointer text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Mostrar mais{' '}
                      {Math.min(GRID_PAGE_SIZE, grouped.later.length - visibleLater)}{' '}
                      horários ↓
                    </button>
                  </div>
                )}

                {visibleLater >= grouped.later.length &&
                  grouped.later.length > GRID_PAGE_SIZE && (
                    <div className="col-span-full py-2 text-center">
                      <p className="text-[12px] text-muted-foreground">
                        Todos os horários foram carregados
                      </p>
                    </div>
                  )}
              </ScheduleSection>
            )}

            {/* ── Cancelados hoje ── Bug 4: paginado em 6 */}
            {grouped.cancelled.length > 0 && (
              <ScheduleSection
                title="Cancelados hoje"
                count={grouped.cancelled.length}
                variant="muted"
              >
                {grouped.cancelled.slice(0, visibleCancelled).map((s) => (
                  <ScheduleCard key={s.id} schedule={s} referenceDate={referenceDate} />
                ))}

                {visibleCancelled < grouped.cancelled.length && (
                  <div className="col-span-full pt-2 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCancelled((v) => v + GRID_PAGE_SIZE)
                      }
                      className="cursor-pointer text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Mostrar mais{' '}
                      {Math.min(
                        GRID_PAGE_SIZE,
                        grouped.cancelled.length - visibleCancelled,
                      )}{' '}
                      cancelados ↓
                    </button>
                  </div>
                )}
              </ScheduleSection>
            )}
          </>
        )}
      </main>

      {/* ── Sheet de edição de busca ── */}
      <EditSearchSheet
        open={searchSheetOpen}
        onClose={() => setSearchSheetOpen(false)}
      />
    </div>
  )
}
