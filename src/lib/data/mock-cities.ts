// Cidades principais do Ceará para sistema de vans intermunicipais
export const MOCK_CITIES = [
  // Região Metropolitana de Fortaleza
  'Fortaleza',
  'Caucaia',
  'Maracanaú',
  'Maranguape',
  'Aquiraz',
  'Pacatuba',
  'Eusébio',

  // Norte do Estado
  'Sobral',
  'Camocim',
  'Acaraú',
  'Itapipoca',
  'Amontada',

  // Sul do Estado (Cariri)
  'Juazeiro do Norte',
  'Crato',
  'Barbalha',
  'Nova Olinda',
  'Santana do Cariri',

  // Centro-Sul
  'Iguatu',
  'Quixadá',
  'Limoeiro do Norte',
  'Russas',
  'Morada Nova',

  // Oeste/Sertão
  'Crateús',
  'Tauá',
  'Independência',
  'Canindé',
  'Santa Quitéria',
] as const

export type CityName = (typeof MOCK_CITIES)[number]

/**
 * Lista de cidades disponíveis no sistema com IDs únicos
 * Usado pelo CityPicker e API para mapeamento consistente
 */
export const CITIES_WITH_IDS = [
  { id: '1', name: 'Fortaleza' },
  { id: '2', name: 'Sobral' },
  { id: '3', name: 'Juazeiro do Norte' },
  { id: '4', name: 'Crateús' },
  { id: '5', name: 'Quixadá' },
  { id: '6', name: 'Iguatu' },
  { id: '7', name: 'Crato' },
  { id: '8', name: 'Caucaia' },
] as const

/**
 * Mapeamento ID → Nome de cidade
 * @example CITY_ID_TO_NAME['1'] // 'Fortaleza'
 */
export const CITY_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  CITIES_WITH_IDS.map((city) => [city.id, city.name]),
)

/**
 * Mapeamento Nome → ID de cidade
 * @example CITY_NAME_TO_ID['Fortaleza'] // '1'
 */
export const CITY_NAME_TO_ID: Record<string, string> = Object.fromEntries(
  CITIES_WITH_IDS.map((city) => [city.name, city.id]),
)

/**
 * Converte ID para nome da cidade (ou retorna o valor original se não encontrado)
 */
export function getCityNameById(idOrName: string): string {
  return CITY_ID_TO_NAME[idOrName] || idOrName
}

/**
 * Converte nome para ID da cidade (ou retorna o valor original se não encontrado)
 */
export function getCityIdByName(nameOrId: string): string {
  return CITY_NAME_TO_ID[nameOrId] || nameOrId
}

// Rotas principais com distâncias e preços realistas
export const MOCK_ROUTES = [
  // Hub Fortaleza - principais destinos
  { origin: 'Fortaleza', destination: 'Sobral', distance: 240, basePrice: 30 },
  {
    origin: 'Fortaleza',
    destination: 'Juazeiro do Norte',
    distance: 550,
    basePrice: 55,
  },
  { origin: 'Fortaleza', destination: 'Crato', distance: 560, basePrice: 55 },
  { origin: 'Fortaleza', destination: 'Iguatu', distance: 390, basePrice: 40 },
  { origin: 'Fortaleza', destination: 'Quixadá', distance: 170, basePrice: 25 },
  {
    origin: 'Fortaleza',
    destination: 'Limoeiro do Norte',
    distance: 200,
    basePrice: 28,
  },
  { origin: 'Fortaleza', destination: 'Crateús', distance: 350, basePrice: 38 },
  { origin: 'Fortaleza', destination: 'Camocim', distance: 360, basePrice: 38 },
  {
    origin: 'Fortaleza',
    destination: 'Itapipoca',
    distance: 130,
    basePrice: 22,
  },

  // Região Norte/Sobral
  { origin: 'Sobral', destination: 'Camocim', distance: 110, basePrice: 20 },
  { origin: 'Sobral', destination: 'Acaraú', distance: 85, basePrice: 18 },
  { origin: 'Sobral', destination: 'Fortaleza', distance: 240, basePrice: 30 },

  // Região Sul/Cariri
  {
    origin: 'Juazeiro do Norte',
    destination: 'Crato',
    distance: 11,
    basePrice: 12,
  },
  {
    origin: 'Juazeiro do Norte',
    destination: 'Barbalha',
    distance: 15,
    basePrice: 12,
  },
  { origin: 'Crato', destination: 'Nova Olinda', distance: 35, basePrice: 15 },
  { origin: 'Crato', destination: 'Fortaleza', distance: 560, basePrice: 55 },

  // Centro-Sul
  { origin: 'Iguatu', destination: 'Crato', distance: 180, basePrice: 30 },
  { origin: 'Iguatu', destination: 'Quixadá', distance: 220, basePrice: 32 },
  {
    origin: 'Quixadá',
    destination: 'Limoeiro do Norte',
    distance: 140,
    basePrice: 25,
  },

  // Rotas regionais menores
  { origin: 'Caucaia', destination: 'Fortaleza', distance: 25, basePrice: 8 },
  { origin: 'Maracanaú', destination: 'Fortaleza', distance: 22, basePrice: 8 },
  { origin: 'Aquiraz', destination: 'Fortaleza', distance: 35, basePrice: 10 },
] as const

export interface MockRoute {
  origin: CityName
  destination: CityName
  distance: number
  basePrice: number
}

// Helper para buscar rotas
export function findRoute(
  origin: string,
  destination: string,
): MockRoute | null {
  return (
    MOCK_ROUTES.find(
      (route) =>
        (route.origin === origin && route.destination === destination) ||
        (route.origin === destination && route.destination === origin),
    ) || null
  )
}

// Helper para calcular preço com variação
export function calculatePrice(basePrice: number, cooperative: string): number {
  // Cooperativas premium cobram um pouco mais
  const premiumCooperatives = ['Real Expresso', 'Guanabara']
  const multiplier = premiumCooperatives.includes(cooperative) ? 1.15 : 1.0

  // Adiciona variação de ±15%
  const variation = (Math.random() - 0.5) * 0.3
  const finalPrice = basePrice * multiplier * (1 + variation)

  return Math.round(finalPrice * 2) / 2 // Arredonda para .00 ou .50
}
