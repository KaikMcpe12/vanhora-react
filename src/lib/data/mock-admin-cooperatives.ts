export interface AdminCooperative {
  id: string
  name: string
  phone: string
  site?: string
  logoUrl?: string
  brandColor: string
  description?: string
  status: 'active' | 'suspended' | 'inactive'
  routeCount: number
  driverCount: number
  rating: number
  reviewCount: number
  createdAt: string
}

export const MOCK_ADMIN_COOPERATIVES: AdminCooperative[] = [
  {
    id: 'coop-metro',
    name: 'Metro Transportes',
    phone: '(85) 3234-5678',
    site: 'https://metrotransportes.com.br',
    brandColor: '#1A5FA8',
    description: 'Principal cooperativa da região metropolitana de Fortaleza.',
    status: 'active',
    routeCount: 12,
    driverCount: 8,
    rating: 4.4,
    reviewCount: 1923,
    createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'coop-expresso',
    name: 'Expresso São Francisco',
    phone: '(88) 3511-2233',
    site: 'https://expressosfco.com.br',
    brandColor: '#B85A00',
    description: 'Especialista em rotas do interior cearense.',
    status: 'active',
    routeCount: 8,
    driverCount: 5,
    rating: 4.1,
    reviewCount: 1456,
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    id: 'coop-vale',
    name: 'Cooperativa Vale',
    phone: '(88) 3411-9900',
    brandColor: '#2E7D32',
    description: 'Conectando o Vale do Cariri ao litoral.',
    status: 'active',
    routeCount: 6,
    driverCount: 4,
    rating: 3.9,
    reviewCount: 987,
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'coop-nordeste',
    name: 'Cooperativa Nordeste',
    phone: '(85) 3456-7890',
    site: 'https://coop-nordeste.com.br',
    brandColor: '#6A1B9A',
    description: 'Ampla cobertura no Nordeste cearense.',
    status: 'active',
    routeCount: 10,
    driverCount: 7,
    rating: 4.0,
    reviewCount: 2156,
    createdAt: '2025-02-15T00:00:00Z',
  },
  {
    id: 'coop-sertao',
    name: 'Sertão Transportes',
    phone: '(88) 3680-4321',
    brandColor: '#C62828',
    description: 'Especialista em rotas do sertão.',
    status: 'suspended',
    routeCount: 3,
    driverCount: 2,
    rating: 3.8,
    reviewCount: 654,
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'coop-progresso',
    name: 'Progresso',
    phone: '(85) 3255-0011',
    brandColor: '#00695C',
    description: 'Conectando cidades com segurança.',
    status: 'active',
    routeCount: 4,
    driverCount: 3,
    rating: 3.9,
    reviewCount: 1234,
    createdAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 'coop-fretcar',
    name: 'Fretcar',
    phone: '(85) 3099-7654',
    brandColor: '#1565C0',
    description: 'Transporte confiável há mais de 30 anos.',
    status: 'inactive',
    routeCount: 0,
    driverCount: 0,
    rating: 4.1,
    reviewCount: 1456,
    createdAt: '2025-04-01T00:00:00Z',
  },
]
