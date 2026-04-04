import { Calendar, Clock, Zap } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getCurrentActiveRange, getTimeRanges } from '@/lib/utils/time-ranges'

import { useScheduleFilters } from './use-schedule-filters'

export type TabType = 'leaving-now' | 'upcoming' | 'past'

/** hook para gerenciar estado das tabs de horários sincronizado com url */
export function useScheduleTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { filtersFromUrl } = useScheduleFilters()

  // tab padrão baseada no horário atual
  const defaultTab = useMemo(() => {
    const range = getCurrentActiveRange()
    return range === 'leavingNow' ? 'leaving-now' : range
  }, [])

  // url como fonte de verdade (sem estado local)
  const activeTab = (searchParams.get('tab') as TabType) || defaultTab

  const setActiveTab = (tab: TabType) => {
    setSearchParams(
      (prev) => {
        prev.set('tab', tab)
        return prev
      },
      { replace: true },
    )
  }

  const timeRanges = useMemo(() => getTimeRanges(), [])

  // combina filtros base com time ranges para cada tab
  const allTabFilters = useMemo(() => {
    return {
      'leaving-now': { ...filtersFromUrl, ...timeRanges.leavingNow },
      upcoming: { ...filtersFromUrl, ...timeRanges.upcoming },
      past: { ...filtersFromUrl, ...timeRanges.past },
    }
  }, [filtersFromUrl, timeRanges])

  return {
    activeTab,
    setActiveTab,
    currentFilters: allTabFilters[activeTab],
    allTabFilters,
    timeRanges,
  }
}

/** configuração das tabs com metadados */
export const TAB_CONFIG = {
  'leaving-now': {
    icon: Zap,
    label: 'Partindo Agora',
    description: 'Próximos 60 minutos',
    color: 'emerald',
    bgClass:
      'data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/20',
  },
  upcoming: {
    icon: Calendar,
    label: 'Próximos',
    description: 'Hoje após 60 minutos',
    color: 'blue',
    bgClass:
      'data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/20',
  },
  past: {
    icon: Clock,
    label: 'Decorridos',
    description: 'Já partiram hoje',
    color: 'gray',
    bgClass:
      'data-[state=active]:border-muted-foreground data-[state=active]:bg-muted/50',
  },
} as const
