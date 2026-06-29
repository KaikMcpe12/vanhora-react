import { CalendarOff, ClockAlert, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ScheduleCard } from '@/components/schedule-card'
import { ScheduleCardSkeleton } from '@/components/schedule-card-skeleton'
import { EmptyState } from '@/components/empty-state'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useFavorites } from '@/hooks/use-favorites'
import { useGroupedSchedules } from '@/hooks/use-grouped-schedules'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'
import type { SortMode } from '@/lib/utils/group-schedules'
import { getCooperativeColor } from '@/lib/utils/schedule-status'
import { cn } from '@/lib/utils'

import { CompactSearchBar } from './components/compact-search-bar'
import { EditSearchSheet } from './components/edit-search-sheet'
import { FeaturedScheduleCard } from './components/featured-schedule-card'
import { ScheduleSection } from './components/schedule-section'
import { SchedulesRail } from './components/schedules-rail'

const GRID_PAGE_SIZE = 6

function SchedulesSkeleton() {
  return (
    <div className="space-y-8 py-6">
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
  useFavorites() // mantido para trigger de re-render ao favoritar

  const [sortMode, setSortMode] = useState<SortMode>('earliest')
  const [visibleLater, setVisibleLater] = useState(GRID_PAGE_SIZE)
  const [visibleCancelled, setVisibleCancelled] = useState(GRID_PAGE_SIZE)
  const [searchSheetOpen, setSearchSheetOpen] = useState(false)
  const [railSheetOpen, setRailSheetOpen] = useState(false)

  useEffect(() => {
    setVisibleLater(GRID_PAGE_SIZE)
    setVisibleCancelled(GRID_PAGE_SIZE)
  }, [filtersFromUrl])

  const { grouped, isLoading, isError } = useGroupedSchedules(
    filtersFromUrl,
    sortMode,
  )

  const referenceDate = filtersFromUrl.date
    ? new Date(filtersFromUrl.date + 'T00:00:00')
    : undefined

  // Métricas para o rail
  const activeCount = grouped
    ? (grouped.nextDeparture ? 1 : 0) +
      grouped.urgent.length +
      grouped.later.length
    : 0

  const cancelledCount = grouped?.cancelled.length ?? 0

  const averageRating = useMemo(() => {
    if (!grouped) return null
    const all = [
      ...(grouped.nextDeparture ? [grouped.nextDeparture] : []),
      ...grouped.urgent,
      ...grouped.later,
    ]
    const rated = all.filter((s) => s.cooperativeRating != null)
    if (rated.length === 0) return null
    return rated.reduce((sum, s) => sum + (s.cooperativeRating ?? 0), 0) / rated.length
  }, [grouped])

  const accentColor = grouped?.nextDeparture
    ? getCooperativeColor(grouped.nextDeparture.cooperativeName)
    : undefined

  const totalActive = activeCount

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

  const railProps = {
    origin: filtersFromUrl.origin,
    destination: filtersFromUrl.destination,
    date: filtersFromUrl.date,
    accentColor,
    onEditSearch: () => setSearchSheetOpen(true),
    activeCount,
    cancelledCount,
    averageRating,
    sortMode,
    onSortChange: (m: SortMode) => {
      setSortMode(m)
      setRailSheetOpen(false)
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── barra de busca compacta (sempre visível) ── */}
      <CompactSearchBar
        origin={filtersFromUrl.origin}
        destination={filtersFromUrl.destination}
        date={filtersFromUrl.date}
        onEdit={() => setSearchSheetOpen(true)}
      />

      {/* ── botão "Filtros e ordenação" — mobile / tablet only ── */}
      <div className="flex items-center gap-2 border-b border-border/40 bg-background px-4 py-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => setRailSheetOpen(true)}
          className={cn(
            'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 py-[5px]',
            'text-[12px] font-medium transition-all duration-150',
            activeFiltersCount > 0
              ? 'border-[#0F6E56] text-[#0F6E56] bg-[rgba(15,110,86,0.06)]'
              : 'border-border/70 text-muted-foreground hover:border-border hover:text-foreground',
          )}
        >
          <SlidersHorizontal size={13} strokeWidth={1.75} />
          <span>Filtros e ordenação</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0F6E56] px-1 text-[10px] font-semibold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* ── grade: rail (desktop) + conteúdo ── */}
      <div className="mx-auto max-w-6xl lg:grid lg:items-start lg:gap-6 lg:px-6 lg:py-5"
        style={{ gridTemplateColumns: '240px 1fr' }}
      >
        {/* Rail — desktop only */}
        <aside className="hidden lg:block">
          <div className="sticky top-4">
            <SchedulesRail {...railProps} />
          </div>
        </aside>

        {/* Conteúdo principal */}
        <main className="space-y-8 px-4 py-6 lg:px-0">
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

              {/* ── Cancelados hoje ── */}
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
                        onClick={() => setVisibleCancelled((v) => v + GRID_PAGE_SIZE)}
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
      </div>

      {/* ── Rail Sheet — mobile / tablet ── */}
      <Sheet open={railSheetOpen} onOpenChange={(v) => !v && setRailSheetOpen(false)}>
        <SheetContent
          side="bottom"
          className="max-h-[88vh] overflow-y-auto rounded-t-2xl px-5 pb-10 pt-5"
        >
          <SheetHeader className="mb-5">
            <SheetTitle className="text-base font-semibold">
              Filtros e ordenação
            </SheetTitle>
          </SheetHeader>
          <SchedulesRail {...railProps} />
        </SheetContent>
      </Sheet>

      {/* ── Sheet de edição de busca ── */}
      <EditSearchSheet
        open={searchSheetOpen}
        onClose={() => setSearchSheetOpen(false)}
      />
    </div>
  )
}
