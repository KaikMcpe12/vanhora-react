import { Building2 } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { getMockCooperativeById } from '@/lib/data/mock-cooperative-details'

import { BackLink } from './components/back-link'
import { CooperativeProfileHeader } from './components/cooperative-profile-header'
import { CooperativeRoutesList } from './components/cooperative-routes-list'

export function CooperativeDetail() {
  const { id } = useParams<{ id: string }>()
  const cooperative = getMockCooperativeById(id ?? '')

  if (!cooperative) {
    return (
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4 px-6 py-20 text-center">
        <Building2 size={48} strokeWidth={1.25} className="text-muted-foreground" />
        <p className="text-[15px] font-medium text-foreground">Cooperativa não encontrada</p>
        <BackLink href="/cooperatives" label="Ver todas as cooperativas" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-8">
      <BackLink label="Cooperativas" href="/cooperatives" />
      <CooperativeProfileHeader cooperative={cooperative} />
      <div className="mt-8">
        <h2 className="mb-4 text-[18px] font-medium text-foreground">
          Rotas dessa cooperativa
        </h2>
        <CooperativeRoutesList routes={cooperative.routes} />
      </div>
    </div>
  )
}
