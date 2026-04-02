import { getMockCooperativeImage } from '@/lib/utils/mock-images'

// Cooperativas de transporte intermunicipal reais do Ceará
export const MOCK_COOPERATIVES = [
  {
    name: 'São Benedito',
    image: getMockCooperativeImage('São Benedito', { type: 'gradient' }),
    rating: 4.2,
    reviews: 1845,
    description: 'Tradicional cooperativa do interior cearense',
    routes: ['Fortaleza', 'Sobral', 'Camocim', 'Acaraú'] as const,
  },
  {
    name: 'Nordeste',
    image: getMockCooperativeImage('Nordeste', { type: 'gradient' }),
    rating: 4.0,
    reviews: 2156,
    description: 'Cooperativa com ampla cobertura no Nordeste',
    routes: ['Fortaleza', 'Juazeiro do Norte', 'Crato', 'Iguatu'] as const,
  },
  {
    name: 'Guanabara',
    image: getMockCooperativeImage('Guanabara', { type: 'gradient' }),
    rating: 4.5,
    reviews: 3241,
    description: 'Serviço premium com maior conforto',
    routes: ['Fortaleza', 'Juazeiro do Norte', 'Sobral'] as const,
  },
  {
    name: 'Real Expresso',
    image: getMockCooperativeImage('Real Expresso', { type: 'gradient' }),
    rating: 4.3,
    reviews: 1923,
    description: 'Expresso de qualidade com horários pontuais',
    routes: ['Fortaleza', 'Quixadá', 'Iguatu', 'Limoeiro do Norte'] as const,
  },
  {
    name: 'Sertão',
    image: getMockCooperativeImage('Sertão', { type: 'gradient' }),
    rating: 3.8,
    reviews: 987,
    description: 'Especialista em rotas do sertão cearense',
    routes: ['Fortaleza', 'Crateús', 'Tauá', 'Independência'] as const,
  },
  {
    name: 'Fretcar',
    image: getMockCooperativeImage('Fretcar', { type: 'gradient' }),
    rating: 4.1,
    reviews: 1456,
    description: 'Transporte confiável há mais de 30 anos',
    routes: ['Fortaleza', 'Sobral', 'Itapipoca', 'Amontada'] as const,
  },
  {
    name: 'Progresso',
    image: getMockCooperativeImage('Progresso', { type: 'gradient' }),
    rating: 3.9,
    reviews: 1234,
    description: 'Conectando cidades com segurança',
    routes: ['Caucaia', 'Maracanaú', 'Maranguape', 'Fortaleza'] as const,
  },
  {
    name: 'União Cascavel',
    image: getMockCooperativeImage('União Cascavel', { type: 'gradient' }),
    rating: 4.4,
    reviews: 876,
    description: 'Tradição em transporte intermunicipal',
    routes: [
      'Fortaleza',
      'Russas',
      'Limoeiro do Norte',
      'Morada Nova',
    ] as const,
  },
  {
    name: 'Expresso Jaguaribe',
    image: getMockCooperativeImage('Expresso Jaguaribe', { type: 'gradient' }),
    rating: 4.0,
    reviews: 654,
    description: 'Cobrindo todo o Vale do Jaguaribe',
    routes: [
      'Limoeiro do Norte',
      'Russas',
      'Morada Nova',
      'Fortaleza',
    ] as const,
  },
  {
    name: 'Via Cariri',
    image: getMockCooperativeImage('Via Cariri', { type: 'gradient' }),
    rating: 4.2,
    reviews: 1567,
    description: 'Especialista na região do Cariri',
    routes: ['Juazeiro do Norte', 'Crato', 'Barbalha', 'Nova Olinda'] as const,
  },
]

export type CooperativeName = (typeof MOCK_COOPERATIVES)[number]['name']

// Helper para buscar cooperativa por nome
export function findCooperative(name: string) {
  return MOCK_COOPERATIVES.find((coop) => coop.name === name) || null
}

// Helper para buscar cooperativas que operam uma rota
export function getCooperativesByRoute(origin: string, destination: string) {
  return MOCK_COOPERATIVES.filter((coop) => {
    const routes = coop.routes as readonly string[]
    return routes.includes(origin) && routes.includes(destination)
  })
}
