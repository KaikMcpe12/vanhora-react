export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'cooperative' | 'driver'
  cooperativeId?: string | null
  status: 'active' | 'inactive'
  phone?: string
  createdAt: string
  deletedAt?: string | null
}

export const MOCK_COOPERATIVES = [
  { id: 'coop-metro', name: 'Metro Transportes' },
  { id: 'coop-expresso', name: 'Expresso São Francisco' },
  { id: 'coop-vale', name: 'Cooperativa Vale' },
]

export const MOCK_USERS: User[] = [
  // Admin users
  {
    id: 'user-admin-1',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@vanhora.com',
    role: 'admin',
    cooperativeId: null,
    status: 'active',
    phone: '(85) 98765-4321',
    createdAt: '2025-10-15T10:30:00Z',
  },
  {
    id: 'user-admin-2',
    name: 'Andrea Oliveira',
    email: 'andrea@vanhora.com',
    role: 'admin',
    cooperativeId: null,
    status: 'active',
    phone: '(85) 98765-4322',
    createdAt: '2025-11-20T14:45:00Z',
  },
  {
    id: 'user-admin-3',
    name: 'Ricardo Souza',
    email: 'ricardo@vanhora.com',
    role: 'admin',
    cooperativeId: null,
    status: 'inactive',
    phone: '(85) 98765-4323',
    createdAt: '2025-08-10T09:15:00Z',
  },

  // Cooperative users
  {
    id: 'user-coop-1',
    name: 'Fabio Oliveira',
    email: 'fabio@metro.com.br',
    role: 'cooperative',
    cooperativeId: 'coop-metro',
    status: 'active',
    phone: '(85) 98765-1001',
    createdAt: '2025-09-01T08:00:00Z',
  },
  {
    id: 'user-coop-2',
    name: 'Mariana Silva',
    email: 'mariana@expresso.com.br',
    role: 'cooperative',
    cooperativeId: 'coop-expresso',
    status: 'active',
    phone: '(85) 98765-1002',
    createdAt: '2025-10-05T10:30:00Z',
  },
  {
    id: 'user-coop-3',
    name: 'Lucas Ferreira',
    email: 'lucas@vale.com.br',
    role: 'cooperative',
    cooperativeId: 'coop-vale',
    status: 'inactive',
    phone: '(85) 98765-1003',
    createdAt: '2025-07-20T11:00:00Z',
  },

  // Driver users
  {
    id: 'user-driver-1',
    name: 'João Silva',
    email: 'joao.silva@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-metro',
    status: 'active',
    phone: '(85) 99876-5401',
    createdAt: '2025-10-15T07:00:00Z',
  },
  {
    id: 'user-driver-2',
    name: 'Marcus Antônio',
    email: 'marcus@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-metro',
    status: 'active',
    phone: '(85) 99876-5402',
    createdAt: '2025-10-16T07:30:00Z',
  },
  {
    id: 'user-driver-3',
    name: 'Henrique Alves',
    email: 'henrique@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-expresso',
    status: 'active',
    phone: '(85) 99876-5403',
    createdAt: '2025-10-17T08:00:00Z',
  },
  {
    id: 'user-driver-4',
    name: 'Felipe Santos',
    email: 'felipe@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-vale',
    status: 'active',
    phone: '(85) 99876-5404',
    createdAt: '2025-10-18T08:30:00Z',
  },
  {
    id: 'user-driver-5',
    name: 'Roberto Costa',
    email: 'roberto@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-metro',
    status: 'inactive',
    phone: '(85) 99876-5405',
    createdAt: '2025-09-10T09:00:00Z',
  },
  {
    id: 'user-driver-6',
    name: 'Paulo Gomes',
    email: 'paulo@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-expresso',
    status: 'inactive',
    phone: '(85) 99876-5406',
    createdAt: '2025-08-15T09:30:00Z',
  },
  {
    id: 'user-driver-7',
    name: 'André Vieira',
    email: 'andre@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-vale',
    status: 'inactive',
    phone: '(85) 99876-5407',
    createdAt: '2025-07-20T10:00:00Z',
  },
  {
    id: 'user-driver-8',
    name: 'Julio Mendes',
    email: 'julio@drivers.vanhora.com',
    role: 'driver',
    cooperativeId: 'coop-metro',
    status: 'active',
    phone: '(85) 99876-5408',
    createdAt: '2025-10-19T10:30:00Z',
  },
]
