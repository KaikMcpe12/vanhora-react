import {
  ArrowLeft,
  Clock,
  Info,
  Pencil,
  Route as RouteIcon,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

import { StatusChip } from '@/components/status-chip'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AdminCooperative } from '@/lib/data/mock-admin-cooperatives'
import { cn } from '@/lib/utils'

import {
  getCooperativeDelays,
  getCooperativeDrivers,
  getCooperativeRoutes,
} from './cooperative-data'
import { cooperativeStatusBadge, getInitials } from './cooperative-shared'
import { DelaysTab } from './tabs/delays-tab'
import { DriversTab } from './tabs/drivers-tab'
import { GeneralTab } from './tabs/general-tab'
import { RoutesTab } from './tabs/routes-tab'

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
  const reduce = useReducedMotion()

  // contagens síncronas para os badges — batem com o que cada aba lista
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
    <motion.div
      key={cooperative.id}
      className="space-y-5"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
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
            <h2 className="text-foreground truncate text-lg font-semibold">
              {cooperative.name}
            </h2>
            <StatusChip {...cooperativeStatusBadge(cooperative.status)} />
          </div>
          <p className="text-muted-foreground text-[12px]">
            {routeCount} rota{routeCount === 1 ? '' : 's'} · {driverCount}{' '}
            motorista{driverCount === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 rounded-full"
          onClick={onEdit}
          aria-label="Editar cooperativa"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Editar</span>
        </Button>
      </div>

      {/* Tabs — wrapper com scroll horizontal + scrollbar oculta (evita as
          setinhas verticais nativas do GTK/Linux, causadas pelo underline
          `after:-bottom-1.25` do TabsTrigger estourando o overflow-y).
          Fade à direita indica que há conteúdo escondido no mobile. */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <div className="relative">
          <div className="overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList
              variant="line"
              className="border-border w-max min-w-full justify-start gap-1 border-b"
            >
          {tabs.map((t) => {
            const Icon = t.icon
            const isActive = activeTab === t.value
            return (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:after:bg-primary gap-1.5"
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
          </div>
          {/* Fade à direita quando há overflow — visível só no mobile (onde a
              lista de abas realmente estoura). Não bloqueia clique. */}
          <div className="from-background to-background/0 pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l md:hidden" />
        </div>

        <TabsContent value="geral" className="pt-5">
          <GeneralTab
            cooperative={cooperative}
            onViewRoutes={() => onTabChange('rotas')}
          />
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
    </motion.div>
  )
}
