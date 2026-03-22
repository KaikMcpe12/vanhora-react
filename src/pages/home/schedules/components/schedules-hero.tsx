import { ScheduleSearch } from '@/components/schedule-search'
import { useScheduleFilters } from '@/hooks/use-schedule-filters'

export function SchedulesHero() {
  const { watch } = useScheduleFilters()

  const currentFilters = watch()

  return (
    <section className="from-primary/5 via-primary/10 to-primary/5 border-b bg-linear-to-r">
      <div className="max-w-7xl mx-auto px-4 py-12">        
        <nav className="text-muted-foreground mb-6 text-sm">
          <span className="hover:text-foreground cursor-pointer transition-colors">
            Início
          </span>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium">Horários</span>
        </nav>
        
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">
            Horários Disponíveis
          </h1>
          <p className="text-muted-foreground text-lg">
            Encontre vans partindo agora ou nos próximos dias
            {currentFilters.origin && currentFilters.destination && (
              <span className="text-primary ml-1 font-medium">
                • {currentFilters.origin} → {currentFilters.destination}
              </span>
            )}
          </p>
        </div>
        
        <ScheduleSearch />
      </div>
    </section>
  )
}
