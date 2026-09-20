export interface AdminCity {
  id: string
  name: string
  state: string
  status: 'active' | 'inactive'
  routeCount: number
  createdAt: string
}

// UUIDs fixos (contrato api-spec.md §1.2). Nenhuma FK cruzada — as rotas
// atuais guardam o nome da cidade como string. Os ids ficam prontos para
// quando `routes.origin_city_id` / `routes.destination_city_id` existirem.
export const MOCK_ADMIN_CITIES: AdminCity[] = [
  { id: 'c1111111-1111-4111-8111-000000000001', name: 'Fortaleza', state: 'CE', status: 'active', routeCount: 18, createdAt: '2025-01-10T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000002', name: 'Sobral', state: 'CE', status: 'active', routeCount: 7, createdAt: '2025-01-10T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000003', name: 'Juazeiro do Norte', state: 'CE', status: 'active', routeCount: 9, createdAt: '2025-01-15T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000004', name: 'Crateús', state: 'CE', status: 'active', routeCount: 4, createdAt: '2025-01-15T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000005', name: 'Quixadá', state: 'CE', status: 'active', routeCount: 5, createdAt: '2025-01-20T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000006', name: 'Iguatu', state: 'CE', status: 'active', routeCount: 6, createdAt: '2025-01-20T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000007', name: 'Crato', state: 'CE', status: 'active', routeCount: 5, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000008', name: 'Caucaia', state: 'CE', status: 'active', routeCount: 3, createdAt: '2025-02-01T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000009', name: 'Maracanaú', state: 'CE', status: 'inactive', routeCount: 0, createdAt: '2025-03-10T00:00:00Z' },
  { id: 'c1111111-1111-4111-8111-000000000010', name: 'Tianguá', state: 'CE', status: 'inactive', routeCount: 1, createdAt: '2025-04-05T00:00:00Z' },
]
