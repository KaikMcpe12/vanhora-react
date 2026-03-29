import { Calendar, Clock, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getCurrentActiveRange, getTimeRanges } from '@/lib/utils/time-ranges'

import { useScheduleFilters } from './use-schedule-filters'

export type TabType = 'leaving-now' | 'upcoming' | 'past'

/**
 * Hook para gerenciar estado das tabs de horários
 * - Sincroniza com URL (?tab=leaving-now)
 * - Combina filtros base com time ranges
 * - Gerencia estado ativo da tab
 */
export function useScheduleTabs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { getCurrentFilters } = useScheduleFilters()

  // ✅ Tab padrão baseada no horário atual (memoizada)
  const defaultTab = useMemo(() => {
    const range = getCurrentActiveRange()
    // Mapear keyof TimeRanges para TabType
    return range === 'leavingNow' ? 'leaving-now' : range
  }, [])

  // ✅ Tab ativa vem da URL ou usa fallback inteligente
  const urlTab = searchParams.get('tab') as TabType
  const activeTab = urlTab || defaultTab
  const [currentTab, setCurrentTab] = useState<TabType>(activeTab)

  // ✅ Sincroniza estado com URL e define tab padrão quando ausente
  useEffect(() => {
    const currentUrlTab = searchParams.get('tab') as TabType

    // Se não há tab na URL, define a padrão
    if (!currentUrlTab) {
      setSearchParams(
        (prev) => {
          prev.set('tab', defaultTab)
          return prev
        },
        { replace: true },
      )
      setCurrentTab(defaultTab)
    } else if (currentUrlTab !== currentTab) {
      // Sincroniza mudanças na URL com o estado
      setCurrentTab(currentUrlTab)
    }
  }, [searchParams, defaultTab, currentTab, setSearchParams])

  const setActiveTab = (tab: TabType) => {
    setCurrentTab(tab)

    // Atualiza URL
    setSearchParams(
      (prev) => {
        prev.set('tab', tab)
        return prev
      },
      { replace: true },
    )
  }

  // Obtém ranges de tempo atuais
  const timeRanges = getTimeRanges()

  // Filtros base do formulário
  const baseFilters = getCurrentFilters()

  // Combina filtros base com time ranges para cada tab
  const getTabFilters = (tab: TabType) => {
    let timeRange
    switch (tab) {
      case 'leaving-now':
        timeRange = timeRanges.leavingNow
        break
      case 'upcoming':
        timeRange = timeRanges.upcoming
        break
      case 'past':
        timeRange = timeRanges.past
        break
      default:
        timeRange = {}
    }

    return {
      ...baseFilters,
      ...timeRange,
    }
  }

  // Filtros para cada tab
  const tabFilters = {
    'leaving-now': getTabFilters('leaving-now'),
    upcoming: getTabFilters('upcoming'),
    past: getTabFilters('past'),
  }

  return {
    activeTab: currentTab,
    setActiveTab,
    currentFilters: tabFilters[currentTab],
    allTabFilters: tabFilters,
    timeRanges,
  }
}

/**
 * Configuração das tabs com metadados
 */
export const TAB_CONFIG = {
  'leaving-now': {
    icon: Zap, // ✅ ⚡ → <Zap />
    label: 'Partindo Agora',
    description: 'Próximos 60 minutos',
    color: 'emerald',
    bgClass:
      'data-[state=active]:border-emerald-500 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-950/20',
  },
  upcoming: {
    icon: Calendar, // ✅ 📅 → <Calendar />
    label: 'Próximos',
    description: 'Hoje após 60 minutos',
    color: 'blue',
    bgClass:
      'data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/20',
  },
  past: {
    icon: Clock, // ✅ ✓ → <Clock />
    label: 'Decorridos',
    description: 'Já partiram hoje',
    color: 'gray',
    bgClass:
      'data-[state=active]:border-muted-foreground data-[state=active]:bg-muted/50',
  },
} as const
