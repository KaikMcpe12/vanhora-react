export interface DashboardAlert {
  id: string
  severity: 'attention' | 'critical'
  title: string
  description: string
  actionPath: string
}

export interface KpiMetric {
  value: string | number
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
    contextLabel?: string
  }
  severity?: 'default' | 'attention' | 'critical'
}

export interface DelayRecord {
  id: string
  routeCode: string
  routeName: string
  cooperativeName: string
  delayMinutes: number
  reason: string
  severity: 'low' | 'medium' | 'high'
}

export interface DepartureRecord {
  id: string
  routeCode: string
  routeName: string
  cooperativeName: string
  departureTime: string
  destination: string
  status: 'on_time' | 'delayed' | 'cancelled'
  delayMinutes?: number
}

export interface AdminDashboardStats {
  criticalAlerts: DashboardAlert[]
  operationKpis: {
    activeCooperatives: KpiMetric
    activeRoutes: KpiMetric
    todaySchedules: KpiMetric
  }
  qualityKpis: {
    delays24h: KpiMetric
    averageRating: KpiMetric
    criticalDelays24h: KpiMetric
  }
  recentDelays: DelayRecord[]
  upcomingDepartures: DepartureRecord[]
}

export const MOCK_ADMIN_DASHBOARD: AdminDashboardStats = {
  criticalAlerts: [
    {
      id: 'alert-001',
      severity: 'critical',
      title: 'Atenção: 6 atrasos críticos nas últimas 24h',
      description:
        'Priorize investigação nas rotas com severidade alta.',
      actionPath: '/admin/delays',
    },
  ],

  operationKpis: {
    activeCooperatives: {
      value: '48',
      trend: { value: '+3.2%', direction: 'up', contextLabel: 'com operação ativa' },
    },
    activeRoutes: {
      value: '892',
      trend: { value: '+18', direction: 'up', contextLabel: 'novas nos últimos 30 dias' },
    },
    todaySchedules: {
      value: '3.405',
      trend: { value: '+5%', direction: 'up', contextLabel: 'considerando todas as cooperativas' },
    },
  },

  qualityKpis: {
    delays24h: {
      value: '14',
      severity: 'attention',
      trend: { value: '+5', direction: 'up', contextLabel: 'vs período anterior' },
    },
    averageRating: {
      value: '4.6',
      severity: 'default',
      trend: { value: '+0.2', direction: 'up', contextLabel: 'com base nas avaliações recentes' },
    },
    criticalDelays24h: {
      value: '6',
      severity: 'critical',
      trend: { value: 'Alta', direction: 'up', contextLabel: 'severidade alta' },
    },
  },

  recentDelays: [
    {
      id: 'delay-001',
      routeCode: 'R-402',
      routeName: 'Centro - Norte',
      cooperativeName: 'Metro Transporters',
      delayMinutes: 32,
      reason: 'Fluxo intenso no centro',
      severity: 'high',
    },
    {
      id: 'delay-002',
      routeCode: 'L-12',
      routeName: 'Vila Nova - Shopping',
      cooperativeName: 'Cooperativa Vale',
      delayMinutes: 8,
      reason: 'Parada prolongada',
      severity: 'medium',
    },
    {
      id: 'delay-003',
      routeCode: 'X-09',
      routeName: 'Express Aeroporto',
      cooperativeName: 'Swift Bus Co.',
      delayMinutes: 5,
      reason: 'Embarque acima do previsto',
      severity: 'low',
    },
    {
      id: 'delay-004',
      routeCode: 'R-101',
      routeName: 'Distrito Industrial',
      cooperativeName: 'Metro Transporters',
      delayMinutes: 22,
      reason: 'Manutenção emergencial',
      severity: 'high',
    },
  ],

  upcomingDepartures: [
    {
      id: 'dep-001',
      routeCode: 'R-402',
      routeName: 'Centro - Norte',
      cooperativeName: 'Metro Transporters',
      departureTime: '14:30',
      destination: 'Terminal Central',
      status: 'on_time',
    },
    {
      id: 'dep-002',
      routeCode: 'L-12',
      routeName: 'Vila Nova - Shopping',
      cooperativeName: 'Cooperativa Vale',
      departureTime: '14:45',
      destination: 'Ponto Final Sul',
      status: 'delayed',
      delayMinutes: 5,
    },
    {
      id: 'dep-003',
      routeCode: 'X-09',
      routeName: 'Express Aeroporto',
      cooperativeName: 'Swift Bus Co.',
      departureTime: '15:00',
      destination: 'Aeroporto Int.',
      status: 'on_time',
    },
    {
      id: 'dep-004',
      routeCode: 'R-101',
      routeName: 'Distrito Industrial',
      cooperativeName: 'Metro Transporters',
      departureTime: '15:15',
      destination: 'Plataforma 4',
      status: 'delayed',
      delayMinutes: 10,
    },
  ],
}
