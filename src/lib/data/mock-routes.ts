export interface Route {
  id: string
  name: string
  origin: string
  destination: string
  driver_id?: string
  status: 'active' | 'suspended' | 'inactive'
  code?: string
  cooperative_id?: string
  price?: number
  active_days?: string[]
  created_at?: string
}

export const MOCK_ROUTES: Route[] = [
  {
    id: 'route-1',
    name: 'Expresso Norte',
    code: 'R-204',
    origin: 'Terminal Central',
    destination: 'Zona Industrial',
    driver_id: 'user-driver-1',
    cooperative_id: 'coop-metro',
    status: 'active',
    price: 30,
    active_days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    created_at: '2025-09-01T08:00:00Z',
  },
  {
    id: 'route-2',
    name: 'Linha Sul Express',
    code: 'R-319',
    origin: 'Praca da Se',
    destination: 'Aeroporto Int.',
    driver_id: undefined,
    cooperative_id: 'coop-expresso',
    status: 'suspended',
    price: 45,
    active_days: ['seg', 'ter', 'qua', 'qui', 'sex'],
    created_at: '2025-08-15T10:30:00Z',
  },
  {
    id: 'route-3',
    name: 'Trans Leste',
    code: 'R-402',
    origin: 'Vila Maria',
    destination: 'Centro Empresarial',
    driver_id: 'user-driver-2',
    cooperative_id: 'coop-metro',
    status: 'active',
    price: 35,
    active_days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab'],
    created_at: '2025-10-01T09:00:00Z',
  },
  {
    id: 'route-4',
    name: 'Rota Noturna A',
    code: 'N-07',
    origin: 'Campus Univ.',
    destination: 'Estacao Metro',
    driver_id: 'user-driver-3',
    cooperative_id: 'coop-vale',
    status: 'inactive',
    price: 25,
    active_days: ['seg', 'ter', 'qua', 'qui', 'sex'],
    created_at: '2025-07-20T16:45:00Z',
  },
  {
    id: 'route-5',
    name: 'Expresso Centro-Sul',
    code: 'R-305',
    origin: 'Centro',
    destination: 'Bairro Sul',
    driver_id: 'user-driver-4',
    cooperative_id: 'coop-expresso',
    status: 'active',
    price: 20,
    active_days: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'],
    created_at: '2025-09-10T08:30:00Z',
  },
]
