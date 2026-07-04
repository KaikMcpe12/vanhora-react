import { Route } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { BackLink } from '@/pages/home/cooperatives/components/back-link'
import { getMockRouteDetail } from '@/lib/data/mock-route-detail'

import { AlternativeRoutesBlock } from './components/alternative-routes-block'
import { RouteActionsRow } from './components/route-actions-row'
import { RouteProfileHeader } from './components/route-profile-header'
import { RouteSchedulesList } from './components/route-schedules-list'
import { RouteStatisticsBlock } from './components/route-statistics-block'
import { RouteTimelineFull } from './components/route-timeline-full'

export function RouteDetail() {
  const { id } = useParams<{ id: string }>()
  const route = getMockRouteDetail(id ?? '')

  if (!route) {
    return (
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-4 px-6 py-20 text-center">
        <Route size={48} strokeWidth={1.25} className="text-muted-foreground" />
        <p className="text-[15px] font-medium text-foreground">Rota não encontrada</p>
        <BackLink href="/schedules" label="Voltar aos horários" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8">
      <BackLink href="/schedules" label="Horários" />

      <RouteActionsRow route={route} />

      <RouteProfileHeader route={route} />

      <RouteTimelineFull route={route} />

      <RouteSchedulesList route={route} />

      <RouteStatisticsBlock route={route} />

      <AlternativeRoutesBlock routes={route.alternatives} />

      <div className="h-16" />
    </div>
  )
}
