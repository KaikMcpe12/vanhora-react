// cidades do ceará para sistema de vans intermunicipais

/**
 * lista de cidades disponíveis no sistema com ids únicos
 * usado pelo citypicker e api para mapeamento consistente
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

/** mapeamento id -> nome de cidade */
export const CITY_ID_TO_NAME: Record<string, string> = Object.fromEntries(
  CITIES_WITH_IDS.map((city) => [city.id, city.name]),
)

/** converte id para nome da cidade (ou retorna o valor original se não encontrado) */
export function getCityNameById(idOrName: string): string {
  return CITY_ID_TO_NAME[idOrName] || idOrName
}

// rotas principais com distâncias e preços realistas
export const MOCK_ROUTES = [
  // hub fortaleza
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

  // região norte/sobral
  { origin: 'Sobral', destination: 'Camocim', distance: 110, basePrice: 20 },
  { origin: 'Sobral', destination: 'Acaraú', distance: 85, basePrice: 18 },
  { origin: 'Sobral', destination: 'Fortaleza', distance: 240, basePrice: 30 },

  // região sul/cariri
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

  // centro-sul
  { origin: 'Iguatu', destination: 'Crato', distance: 180, basePrice: 30 },
  { origin: 'Iguatu', destination: 'Quixadá', distance: 220, basePrice: 32 },
  {
    origin: 'Quixadá',
    destination: 'Limoeiro do Norte',
    distance: 140,
    basePrice: 25,
  },

  // rotas regionais menores
  { origin: 'Caucaia', destination: 'Fortaleza', distance: 25, basePrice: 8 },
  { origin: 'Maracanaú', destination: 'Fortaleza', distance: 22, basePrice: 8 },
  { origin: 'Aquiraz', destination: 'Fortaleza', distance: 35, basePrice: 10 },
] as const

/** calcula preço com variação por cooperativa */
export function calculatePrice(basePrice: number, cooperative: string): number {
  // cooperativas premium cobram um pouco mais
  const premiumCooperatives = ['Real Expresso', 'Guanabara']
  const multiplier = premiumCooperatives.includes(cooperative) ? 1.15 : 1.0

  // adiciona variação de ±15%
  const variation = (Math.random() - 0.5) * 0.3
  const finalPrice = basePrice * multiplier * (1 + variation)

  return Math.round(finalPrice * 2) / 2 // arredonda para .00 ou .50
}
