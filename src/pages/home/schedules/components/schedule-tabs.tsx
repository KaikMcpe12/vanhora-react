import { Search } from 'lucide-react'
import { useMemo } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TAB_CONFIG,
  type TabType,
  useScheduleTabs,
} from '@/hooks/use-schedule-tabs'
import {
  filterMockSchedules,
  getMockSchedules,
} from '@/lib/data/mock-schedules'

import { LeavingNowTab } from './leaving-now-tab'
import { PastTab } from './past-tab'
import { UpcomingTab } from './upcoming-tab'

// tab colors
const colorMap: Record<
  string,
  {
    active: string
    icon: string
    hover: string
  }
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

export function ScheduleTabs() {
  const { activeTab, setActiveTab, allTabFilters } = useScheduleTabs()

  const allSchedules = useMemo(() => getMockSchedules(), [])

  const tabData = useMemo(() => {
    return {
      'leaving-now': filterMockSchedules(
        allSchedules,
        allTabFilters['leaving-now'],
      ),
      upcoming: filterMockSchedules(allSchedules, allTabFilters.upcoming),
      past: filterMockSchedules(allSchedules, allTabFilters.past),
    }
  }, [allSchedules, allTabFilters])

  const hasAnyData = Object.values(tabData).some((data) => data.length > 0)

  if (!hasAnyData) {
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
        {/* tabs */}
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
                  <span>{config.label}</span>
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <div className="bg-card p-6">
          <TabsContent value="leaving-now" className="mt-0">
            <LeavingNowTab schedules={tabData['leaving-now']} />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <UpcomingTab schedules={tabData.upcoming} />
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            <PastTab schedules={tabData.past} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
