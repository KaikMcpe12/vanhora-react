import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Info,
  Pencil,
  Route as RouteIcon,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AdminStatusBadge } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { cn } from '@/lib/utils'

import {
  getCooperativeDelays,
  getCooperativeDrivers,
  getCooperativeRoutes,
  getCooperativeStats,
} from './cooperative-data'
import { cooperativeStatusBadge, getInitials } from './cooperative-shared'
import { DelaysTab } from './tabs/delays-tab'
import { DriversTab } from './tabs/drivers-tab'
import { GeneralTab } from './tabs/general-tab'
import { RoutesTab } from './tabs/routes-tab'

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-[15px] font-semibold text-foreground">{value}</p>
    </div>
  )
}

interface CooperativeDetailPanelProps {
  cooperative: AdminCooperative
  activeTab: string
  onTabChange: (tab: string) => void
  onEdit: () => void
  onBack?: () => void
}

export function CooperativeDetailPanel({
  cooperative,
  activeTab,
  onTabChange,
  onEdit,
  onBack,
}: CooperativeDetailPanelProps) {
  const navigate = useNavigate()
  const coopName = encodeURIComponent(cooperative.name)
  const quickLinks = [
    { label: 'Ver rotas', icon: RouteIcon, to: `/admin/routes?cooperative=${coopName}` },
    { label: 'Ver motoristas', icon: Users, to: `/admin/users?cooperative=${cooperative.id}` },
    { label: 'Ver horários', icon: Clock, to: `/admin/schedules?cooperative=${coopName}` },
  ]
  const stats = getCooperativeStats(cooperative)
  const routeCount = getCooperativeRoutes(cooperative.id).length
  const driverCount = getCooperativeDrivers(cooperative.id).length
  const delayCount = getCooperativeDelays(cooperative.id).length

  const tabs = [
    { value: 'geral', label: 'Geral', icon: Info, count: undefined as number | undefined },
    { value: 'rotas', label: 'Rotas', icon: RouteIcon, count: routeCount },
    { value: 'motoristas', label: 'Motoristas', icon: Users, count: driverCount },
    { value: 'atrasos', label: 'Atrasos', icon: Clock, count: delayCount },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Voltar</span>
          </Button>
        )}
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: cooperative.brandColor }}
        >
          {getInitials(cooperative.name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {cooperative.name}
            </h2>
            <AdminStatusBadge {...cooperativeStatusBadge(cooperative.status)} />
          </div>
          <p className="text-[12px] text-muted-foreground">
            {cooperative.phone}
            {cooperative.site ? ` • ${cooperative.site}` : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 rounded-full"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </Button>
      </div>

      {/* Metrics */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-border bg-card px-5 py-4">
        <Metric label="Rotas" value={String(routeCount)} />
        <Metric label="Frota" value={String(driverCount)} />
        <Metric
          label="Avaliação"
          value={cooperative.reviewCount > 0 ? cooperative.rating.toFixed(1) : '—'}
        />
        <Metric label="Pontualidade" value={`${stats.onTimeRate}%`} />
        <Metric label="Alertas críticos" value={String(stats.criticalAlerts)} />
      </div>

      {/* Quick links → dedicated pages filtered by this cooperative */}
      <div className="flex flex-wrap gap-2">
        {quickLinks.map((link) => {
          const Icon = link.icon
          return (
            <Button
              key={link.label}
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-full"
              onClick={() => navigate(link.to)}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </Button>
          )
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList
          variant="line"
          className="w-full justify-start gap-1 border-b border-border"
        >
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.value
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="gap-1.5 text-muted-foreground data-[state=active]:text-primary data-[state=active]:after:bg-primary"
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={cn(
                      'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="geral" className="pt-5">
          <GeneralTab cooperative={cooperative} />
        </TabsContent>
        <TabsContent value="rotas" className="pt-5">
          <RoutesTab cooperative={cooperative} />
        </TabsContent>
        <TabsContent value="motoristas" className="pt-5">
          <DriversTab cooperative={cooperative} />
        </TabsContent>
        <TabsContent value="atrasos" className="pt-5">
          <DelaysTab cooperative={cooperative} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
