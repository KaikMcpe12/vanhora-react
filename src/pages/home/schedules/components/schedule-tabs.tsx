import { Calendar, Clock, Search, Zap } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TAB_CONFIG,
  type TabType,
  useScheduleTabs,
} from '@/hooks/use-schedule-tabs'
import { useSchedules } from '@/hooks/use-schedules'

import { ScheduleTabContent } from './schedule-tab-content'

const colorMap: Record<
  string,
  { active: string; icon: string; hover: string }
> = {
  'leaving-now': {
    active: 'border-b-emerald-500 text-emerald-700 dark:text-emerald-400',
    icon: 'text-emerald-600 dark:text-emerald-400',
    hover:
      'hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
  },
  upcoming: {
    active: 'border-b-blue-500 text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20',
  },
  past: {
    active: 'border-b-gray-400 text-gray-700 dark:text-gray-400',
    icon: 'text-gray-600 dark:text-gray-400',
    hover: 'hover:text-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-950/20',
  },
}

const emptyStateConfig = {
  'leaving-now': {
    icon: Zap,
    title: 'Nenhum horário partindo agora',
    description:
      "Não há vans saindo nos próximos 60 minutos. Confira a aba 'Próximos' para horários mais tarde ou ajuste seus filtros de busca.",
    action: {
      label: 'Ver Próximos Horários',
      onClick: () => {
        window.location.hash = '#upcoming'
      },
    },
  },
  upcoming: {
    icon: Calendar,
    title: 'Nenhum horário próximo',
    description:
      "Todos os horários de hoje já estão em 'Partindo Agora' ou 'Decorridos'. Tente buscar em outra data ou rota.",
    action: {
      label: 'Alterar Filtros',
      onClick: () => {
        document
          .querySelector('input[type="date"]')
          ?.scrollIntoView({ behavior: 'smooth' })
      },
    },
  },
  past: {
    icon: Clock,
    title: 'Nenhum horário já partiu',
    description:
      "Ainda não há horários que já partiram hoje. Confira 'Partindo Agora' para ver as próximas saídas.",
    action: {
      label: 'Ver Partindo Agora',
      onClick: () => {
        window.location.hash = '#leaving-now'
      },
    },
  },
}

export function ScheduleTabs() {
  const { activeTab, setActiveTab, allTabFilters } = useScheduleTabs()

  const leavingNowData = useSchedules(allTabFilters['leaving-now'], {
    limit: 12,
  })
  const upcomingData = useSchedules(allTabFilters.upcoming, { limit: 12 })
  const pastData = useSchedules(allTabFilters.past, { limit: 12 })

  const tabData = {
    'leaving-now': leavingNowData,
    upcoming: upcomingData,
    past: pastData,
  }

  const hasAnyData =
    leavingNowData.schedules.length > 0 ||
    upcomingData.schedules.length > 0 ||
    pastData.schedules.length > 0

  const isLoading =
    leavingNowData.isLoading || upcomingData.isLoading || pastData.isLoading

  if (!isLoading && !hasAnyData) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Search className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          Nenhum horário encontrado
        </h3>
        <p className="text-muted-foreground mx-auto mb-6 max-w-md text-sm">
          Não encontramos horários com os filtros selecionados. Tente ajustar
          seus critérios de busca.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabType)}
      >
        <TabsList className="grid w-full grid-cols-3 gap-1 bg-transparent p-2">
          {Object.entries(TAB_CONFIG).map(([tabKey, config]) => {
            const Icon = config.icon
            const isActive = activeTab === tabKey
            const colorClasses = colorMap[tabKey] || colorMap['past']

            return (
              <TabsTrigger
                key={tabKey}
                value={tabKey}
                className={`border-b-2 border-transparent px-4 py-3 font-semibold transition-all duration-200 ${
                  isActive
                    ? `bg-background ${colorClasses.active}`
                    : `text-muted-foreground ${colorClasses.hover}`
                } `}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon
                    className={`h-4 w-4 ${isActive ? colorClasses.icon : ''}`}
                  />
                  <span className="text-wrap">{config.label}</span>
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <div className="bg-card p-4 md:p-6">
          {(['leaving-now', 'upcoming', 'past'] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              <ScheduleTabContent
                data={tabData[tab]}
                emptyState={emptyStateConfig[tab]}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}
