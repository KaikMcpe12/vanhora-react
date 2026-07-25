export interface AdminCity {
  id: string
  name: string
  state: string
  status: 'active' | 'inactive'
  routeCount: number
  createdAt: string
}

export const MOCK_ADMIN_CITIES: AdminCity[] = [
  { id: 'city-01', name: 'Fortaleza', state: 'CE', status: 'active', routeCount: 18, createdAt: '2025-01-10T00:00:00Z' },
  { id: 'city-02', name: 'Sobral', state: 'CE', status: 'active', routeCount: 7, createdAt: '2025-01-10T00:00:00Z' },
  { id: 'city-03', name: 'Juazeiro do Norte', state: 'CE', status: 'active', routeCount: 9, createdAt: '2025-01-15T00:00:00Z' },
  { id: 'city-04', name: 'Crateús', state: 'CE', status: 'active', routeCount: 4, createdAt: '2025-01-15T00:00:00Z' },
  { id: 'city-05', name: 'Quixadá', state: 'CE', status: 'active', routeCount: 5, createdAt: '2025-01-20T00:00:00Z' },
  { id: 'city-06', name: 'Iguatu', state: 'CE', status: 'active', routeCount: 6, createdAt: '2025-01-20T00:00:00Z' },
  { id: 'city-07', name: 'Crato', state: 'CE', status: 'active', routeCount: 5, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'city-08', name: 'Caucaia', state: 'CE', status: 'active', routeCount: 3, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'city-09', name: 'Maracanaú', state: 'CE', status: 'inactive', routeCount: 0, createdAt: '2025-03-10T00:00:00Z' },
  { id: 'city-10', name: 'Tianguá', state: 'CE', status: 'inactive', routeCount: 1, createdAt: '2025-04-05T00:00:00Z' },
]
