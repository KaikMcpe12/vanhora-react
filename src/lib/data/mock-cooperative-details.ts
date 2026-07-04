// TODO: replace with GET /api/cooperatives and GET /api/cooperatives/:id
// see api-spec.md sections 2.4 and 3.5
import { MOCK_COOPERATIVES } from './mock-cooperatives'
import { CITIES_WITH_IDS } from './mock-cities'
import { COOPERATIVE_COLORS } from '@/lib/utils/schedule-status'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CooperativeCityServed = {
  id: string
  name: string
  state: string
  role: 'origin_or_destination' | 'stop'
}

export type CooperativeOperatingStats = {
  schedulesPerWeekday: Record<string, number>
  busiestDay: string
  topDestination: { cityName: string; scheduleCount: number }
  avgPrice: number
  priceRange: { min: number; max: number }
}

export type CooperativeRecentHistory = {
  delays: {
    last30DaysCount: number
    averageDelayMinutes: number
    severityDistribution: { low: number; medium: number; high: number }
  }
  cancellations: {
    last30DaysCount: number
    recent: Array<{ date: string; route: string; reason: string }>
  }
  onTimeRate: number
}

export type CooperativeRoute = {
  id: string
  displayName: string
  durationText: string
  stopsCount: number
  schedulesTodayCount: number
  priceFrom: number
  nextDeparture: { departureTime: string; minutesUntil: number } | null
  routeRating: { average: number; count: number } | null
}

export type CooperativeDetail = {
  id: string
  name: string
  brandColor: string
  rating: number
  ratingCount: number
  /** city name strings — used by the listing page and CooperativeCard */
  citiesServed: string[]
  citiesServedEnriched: CooperativeCityServed[]
  routeCount: number
  phoneNumber: string
  website: string
  routes: CooperativeRoute[]
  description: string | null
  operatingStats: CooperativeOperatingStats
  recentHistory: CooperativeRecentHistory
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
}

function makeCityServed(name: string): CooperativeCityServed {
  const found = CITIES_WITH_IDS.find((c) => c.name === name)
  return { id: found?.id ?? slugify(name), name, state: 'CE', role: 'origin_or_destination' }
}

function makeCitiesEnriched(routes: CooperativeRoute[]): CooperativeCityServed[] {
  const seen = new Set<string>()
  const result: CooperativeCityServed[] = []
  for (const route of routes) {
    for (const name of route.displayName.split(' → ')) {
      if (!seen.has(name)) {
        seen.add(name)
        result.push(makeCityServed(name))
      }
    }
  }
  return result
}

function computeStats(routes: CooperativeRoute[]): CooperativeOperatingStats {
  if (routes.length === 0) {
    return {
      schedulesPerWeekday: { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 },
      busiestDay: 'friday',
      topDestination: { cityName: '', scheduleCount: 0 },
      avgPrice: 0,
      priceRange: { min: 0, max: 0 },
    }
  }
  const totalDaily = routes.reduce((s, r) => s + r.schedulesTodayCount, 0)
  const weights: Record<string, number> = {
    monday: 0.85, tuesday: 0.85, wednesday: 0.90,
    thursday: 0.85, friday: 1.10, saturday: 0.75, sunday: 0.60,
  }
  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0)
  const schedulesPerWeekday = Object.fromEntries(
    Object.entries(weights).map(([day, w]) => [day, Math.round((totalDaily * w / totalWeight) * 7)]),
  )
  const busiestDay = Object.entries(schedulesPerWeekday).sort((a, b) => b[1] - a[1])[0][0]
  const topRoute = [...routes].sort((a, b) => b.schedulesTodayCount - a.schedulesTodayCount)[0]
  const topDestCity = topRoute.displayName.split(' → ')[1]
  const prices = routes.map((r) => r.priceFrom)
  const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length
  return {
    schedulesPerWeekday,
    busiestDay,
    topDestination: { cityName: topDestCity, scheduleCount: topRoute.schedulesTodayCount },
    avgPrice,
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
  }
}

function makeRoute(
  id: string,
  origin: string,
  dest: string,
  distance: number,
  basePrice: number,
  schedules: number,
): CooperativeRoute {
  return {
    id,
    displayName: `${origin} → ${dest}`,
    durationText: formatDuration(distance / 50),
    stopsCount: 0,
    schedulesTodayCount: schedules,
    priceFrom: basePrice,
    nextDeparture: null,
    routeRating: null,
  }
}

// ─── Route extras: next departure + per-route rating ─────────────────────────

type RouteExtra = { departureTime: string; minutesUntil: number; average: number; count: number }

const ROUTE_EXTRAS: Record<string, RouteExtra> = {
  'sb-for-sob': { departureTime: '14:30', minutesUntil: 32,  average: 4.3, count: 1842 },
  'sb-for-cam': { departureTime: '16:00', minutesUntil: 122, average: 4.0, count: 523  },
  'sb-sob-cam': { departureTime: '15:20', minutesUntil: 82,  average: 4.2, count: 731  },
  'sb-sob-aca': { departureTime: '13:45', minutesUntil: -13, average: 4.1, count: 418  },

  'ne-for-jua': { departureTime: '15:00', minutesUntil: 62,  average: 4.6, count: 2341 },
  'ne-for-cra': { departureTime: '16:30', minutesUntil: 152, average: 4.5, count: 1893 },
  'ne-for-igu': { departureTime: '14:00', minutesUntil: 2,   average: 4.3, count: 1124 },
  'ne-jua-cra': { departureTime: '14:15', minutesUntil: 17,  average: 4.4, count: 3211 },
  'ne-igu-cra': { departureTime: '16:00', minutesUntil: 122, average: 4.0, count: 512  },

  'gu-for-jua': { departureTime: '15:00', minutesUntil: 62,  average: 4.7, count: 3241 },
  'gu-for-sob': { departureTime: '14:15', minutesUntil: 17,  average: 4.6, count: 2108 },
  'gu-sob-for': { departureTime: '16:15', minutesUntil: 137, average: 4.5, count: 1834 },

  're-for-qui': { departureTime: '14:30', minutesUntil: 32,  average: 4.5, count: 2143 },
  're-for-igu': { departureTime: '16:00', minutesUntil: 122, average: 4.3, count: 987  },
  're-igu-qui': { departureTime: '15:00', minutesUntil: 62,  average: 4.1, count: 412  },
  're-for-lim': { departureTime: '13:30', minutesUntil: -28, average: 4.4, count: 1231 },

  'se-for-crt': { departureTime: '15:00', minutesUntil: 62,  average: 4.2, count: 834  },

  'fr-for-sob': { departureTime: '14:45', minutesUntil: 47,  average: 4.1, count: 1023 },
  'fr-for-ita': { departureTime: '15:15', minutesUntil: 77,  average: 4.3, count: 1456 },
  'fr-sob-for': { departureTime: '16:30', minutesUntil: 152, average: 4.0, count: 934  },

  'pr-cau-for': { departureTime: '14:05', minutesUntil: 7,   average: 3.9, count: 4123 },
  'pr-mar-for': { departureTime: '14:20', minutesUntil: 22,  average: 3.8, count: 3654 },

  'uc-for-rus': { departureTime: '15:30', minutesUntil: 92,  average: 4.2, count: 734  },
  'uc-for-lim': { departureTime: '14:00', minutesUntil: 2,   average: 4.3, count: 892  },
  'uc-qui-lim': { departureTime: '16:00', minutesUntil: 122, average: 4.1, count: 523  },

  'ej-for-lim': { departureTime: '15:00', minutesUntil: 62,  average: 4.4, count: 1124 },
  'ej-qui-lim': { departureTime: '16:30', minutesUntil: 152, average: 4.2, count: 634  },

  'vc-jua-cra': { departureTime: '14:00', minutesUntil: 2,   average: 4.5, count: 5234 },
  'vc-jua-bar': { departureTime: '15:00', minutesUntil: 62,  average: 4.3, count: 2981 },
  'vc-cra-nol': { departureTime: '16:00', minutesUntil: 122, average: 4.1, count: 1234 },
}

function applyExtras(routes: CooperativeRoute[]): CooperativeRoute[] {
  return routes.map((r) => {
    const extra = ROUTE_EXTRAS[r.id]
    if (!extra) return r
    return {
      ...r,
      nextDeparture: { departureTime: extra.departureTime, minutesUntil: extra.minutesUntil },
      routeRating: { average: extra.average, count: extra.count },
    }
  })
}

// ─── Descriptions ─────────────────────────────────────────────────────────────

const DESCRIPTION_DATA: Record<string, string> = {
  'São Benedito':
    'Cooperativa com sede em São Benedito, atua nas rotas do litoral noroeste do Ceará há mais de três décadas. Referência em transporte no eixo Sobral–Camocim.',
  'Nordeste':
    'Especializada em rotas para o Cariri cearense, conecta Fortaleza a Juazeiro do Norte, Crato e Iguatu com frota moderna e viagens frequentes.',
  'Guanabara':
    'Uma das cooperativas mais tradicionais do estado, reconhecida pela pontualidade e pelo atendimento no eixo Fortaleza–Sobral–Juazeiro do Norte.',
  'Real Expresso':
    'Atua no corredor leste do Ceará com ênfase em conforto, atendendo Quixadá, Iguatu e Limoeiro do Norte com partidas regulares de Fortaleza.',
  'Sertão':
    'Conecta Fortaleza ao sertão central do Ceará, com foco na rota para Crateús e municípios do sertão dos Inhamuns.',
  'Fretcar':
    'Opera no corredor Fortaleza–Sobral e litoral norte do Ceará, com linha diária para Itapipoca, cidade histórica do litoral cearense.',
  'Progresso':
    'Especializada em transporte metropolitano, oferece as rotas mais frequentes da Grande Fortaleza, atendendo Caucaia e Maracanaú.',
  'União Cascavel':
    'Cobre o corredor leste do Ceará com destaque para as rotas para Russas e Limoeiro do Norte, servindo o agreste e o vale do Jaguaribe.',
  'Expresso Jaguaribe':
    'Opera no vale do Jaguaribe, atendendo Limoeiro do Norte e municípios de Quixadá com partidas regulares de Fortaleza.',
  'Via Cariri':
    'Cooperativa especializada no Cariri cearense, com alta frequência nas rotas intraregionais entre Juazeiro do Norte, Crato, Barbalha e Nova Olinda.',
}

// ─── Recent history ───────────────────────────────────────────────────────────

const HISTORY_DATA: Record<string, CooperativeRecentHistory> = {
  'São Benedito': {
    delays: { last30DaysCount: 8, averageDelayMinutes: 9, severityDistribution: { low: 6, medium: 2, high: 0 } },
    cancellations: {
      last30DaysCount: 2,
      recent: [
        { date: '2026-06-28', route: 'Fortaleza → Sobral', reason: 'veículo em manutenção' },
        { date: '2026-06-14', route: 'Sobral → Camocim', reason: 'chuva forte na rota' },
      ],
    },
    onTimeRate: 0.91,
  },
  'Nordeste': {
    delays: { last30DaysCount: 14, averageDelayMinutes: 12, severityDistribution: { low: 9, medium: 4, high: 1 } },
    cancellations: {
      last30DaysCount: 4,
      recent: [
        { date: '2026-06-29', route: 'Fortaleza → Juazeiro do Norte', reason: 'problema mecânico' },
        { date: '2026-06-21', route: 'Juazeiro do Norte → Crato', reason: 'motorista indisponível' },
        { date: '2026-06-10', route: 'Fortaleza → Crato', reason: 'interdição na BR-116' },
      ],
    },
    onTimeRate: 0.88,
  },
  'Guanabara': {
    delays: { last30DaysCount: 11, averageDelayMinutes: 10, severityDistribution: { low: 7, medium: 3, high: 1 } },
    cancellations: {
      last30DaysCount: 3,
      recent: [
        { date: '2026-06-25', route: 'Fortaleza → Sobral', reason: 'pneu furado' },
        { date: '2026-06-17', route: 'Sobral → Fortaleza', reason: 'veículo em manutenção' },
        { date: '2026-06-05', route: 'Fortaleza → Juazeiro do Norte', reason: 'feriado municipal' },
      ],
    },
    onTimeRate: 0.85,
  },
  'Real Expresso': {
    delays: { last30DaysCount: 6, averageDelayMinutes: 7, severityDistribution: { low: 5, medium: 1, high: 0 } },
    cancellations: {
      last30DaysCount: 1,
      recent: [{ date: '2026-06-20', route: 'Fortaleza → Iguatu', reason: 'veículo em manutenção' }],
    },
    onTimeRate: 0.93,
  },
  'Sertão': {
    delays: { last30DaysCount: 3, averageDelayMinutes: 8, severityDistribution: { low: 3, medium: 0, high: 0 } },
    cancellations: { last30DaysCount: 0, recent: [] },
    onTimeRate: 0.94,
  },
  'Fretcar': {
    delays: { last30DaysCount: 10, averageDelayMinutes: 11, severityDistribution: { low: 7, medium: 2, high: 1 } },
    cancellations: {
      last30DaysCount: 3,
      recent: [
        { date: '2026-06-27', route: 'Fortaleza → Itapipoca', reason: 'acidente na rodovia' },
        { date: '2026-06-19', route: 'Sobral → Fortaleza', reason: 'chuva forte na rota' },
        { date: '2026-06-08', route: 'Fortaleza → Sobral', reason: 'problema mecânico' },
      ],
    },
    onTimeRate: 0.87,
  },
  'Progresso': {
    delays: { last30DaysCount: 18, averageDelayMinutes: 7, severityDistribution: { low: 14, medium: 4, high: 0 } },
    cancellations: {
      last30DaysCount: 5,
      recent: [
        { date: '2026-06-30', route: 'Caucaia → Fortaleza', reason: 'congestionamento na BR-020' },
        { date: '2026-06-24', route: 'Maracanaú → Fortaleza', reason: 'veículo em manutenção' },
        { date: '2026-06-15', route: 'Caucaia → Fortaleza', reason: 'motorista indisponível' },
      ],
    },
    onTimeRate: 0.82,
  },
  'União Cascavel': {
    delays: { last30DaysCount: 9, averageDelayMinutes: 9, severityDistribution: { low: 7, medium: 2, high: 0 } },
    cancellations: {
      last30DaysCount: 2,
      recent: [
        { date: '2026-06-22', route: 'Fortaleza → Russas', reason: 'pneu furado' },
        { date: '2026-06-11', route: 'Quixadá → Limoeiro do Norte', reason: 'veículo em manutenção' },
      ],
    },
    onTimeRate: 0.89,
  },
  'Expresso Jaguaribe': {
    delays: { last30DaysCount: 5, averageDelayMinutes: 8, severityDistribution: { low: 4, medium: 1, high: 0 } },
    cancellations: {
      last30DaysCount: 1,
      recent: [{ date: '2026-06-16', route: 'Fortaleza → Limoeiro do Norte', reason: 'chuva forte na rota' }],
    },
    onTimeRate: 0.92,
  },
  'Via Cariri': {
    delays: { last30DaysCount: 16, averageDelayMinutes: 6, severityDistribution: { low: 12, medium: 4, high: 0 } },
    cancellations: {
      last30DaysCount: 4,
      recent: [
        { date: '2026-06-29', route: 'Juazeiro do Norte → Crato', reason: 'feriado municipal' },
        { date: '2026-06-23', route: 'Juazeiro do Norte → Barbalha', reason: 'veículo em manutenção' },
        { date: '2026-06-12', route: 'Crato → Nova Olinda', reason: 'motorista indisponível' },
      ],
    },
    onTimeRate: 0.86,
  },
}

// ─── Contact + routes source data ────────────────────────────────────────────

const CONTACT_DATA: Record<string, { phone: string; website: string }> = {
  'São Benedito':       { phone: '(88) 3621-1234', website: 'saobenedito.coop.br' },
  'Nordeste':           { phone: '(85) 3234-5678', website: 'coopnordeste.com.br' },
  'Guanabara':          { phone: '(85) 3322-9000', website: 'guanabara.coop.br' },
  'Real Expresso':      { phone: '(85) 3111-4567', website: 'realexpresso.com.br' },
  'Sertão':             { phone: '(88) 3691-2222', website: 'coopertao.com.br' },
  'Fretcar':            { phone: '(88) 3614-8888', website: 'fretcar.com.br' },
  'Progresso':          { phone: '(85) 3299-3333', website: 'cooperprogresso.com.br' },
  'União Cascavel':     { phone: '(88) 3421-5555', website: 'uniaocascavel.com.br' },
  'Expresso Jaguaribe': { phone: '(88) 3423-7777', website: 'expressojaguaribe.com.br' },
  'Via Cariri':         { phone: '(88) 3102-6666', website: 'viacariri.coop.br' },
}

const ROUTES_DATA: Record<string, CooperativeRoute[]> = {
  'São Benedito': [
    makeRoute('sb-for-sob', 'Fortaleza', 'Sobral', 240, 30, 8),
    makeRoute('sb-for-cam', 'Fortaleza', 'Camocim', 360, 38, 4),
    makeRoute('sb-sob-cam', 'Sobral', 'Camocim', 110, 20, 5),
    makeRoute('sb-sob-aca', 'Sobral', 'Acaraú', 85, 18, 6),
  ],
  'Nordeste': [
    makeRoute('ne-for-jua', 'Fortaleza', 'Juazeiro do Norte', 550, 55, 6),
    makeRoute('ne-for-cra', 'Fortaleza', 'Crato', 560, 55, 4),
    makeRoute('ne-for-igu', 'Fortaleza', 'Iguatu', 390, 40, 5),
    makeRoute('ne-jua-cra', 'Juazeiro do Norte', 'Crato', 11, 12, 12),
    makeRoute('ne-igu-cra', 'Iguatu', 'Crato', 180, 30, 3),
  ],
  'Guanabara': [
    makeRoute('gu-for-jua', 'Fortaleza', 'Juazeiro do Norte', 550, 55, 5),
    makeRoute('gu-for-sob', 'Fortaleza', 'Sobral', 240, 30, 7),
    makeRoute('gu-sob-for', 'Sobral', 'Fortaleza', 240, 30, 6),
  ],
  'Real Expresso': [
    makeRoute('re-for-qui', 'Fortaleza', 'Quixadá', 170, 25, 9),
    makeRoute('re-for-igu', 'Fortaleza', 'Iguatu', 390, 40, 4),
    makeRoute('re-igu-qui', 'Iguatu', 'Quixadá', 220, 32, 3),
    makeRoute('re-for-lim', 'Fortaleza', 'Limoeiro do Norte', 200, 28, 5),
  ],
  'Sertão': [
    makeRoute('se-for-crt', 'Fortaleza', 'Crateús', 350, 38, 5),
  ],
  'Fretcar': [
    makeRoute('fr-for-sob', 'Fortaleza', 'Sobral', 240, 30, 6),
    makeRoute('fr-for-ita', 'Fortaleza', 'Itapipoca', 130, 22, 8),
    makeRoute('fr-sob-for', 'Sobral', 'Fortaleza', 240, 30, 5),
  ],
  'Progresso': [
    makeRoute('pr-cau-for', 'Caucaia', 'Fortaleza', 25, 8, 15),
    makeRoute('pr-mar-for', 'Maracanaú', 'Fortaleza', 22, 8, 12),
  ],
  'União Cascavel': [
    makeRoute('uc-for-rus', 'Fortaleza', 'Russas', 168, 28, 4),
    makeRoute('uc-for-lim', 'Fortaleza', 'Limoeiro do Norte', 200, 28, 5),
    makeRoute('uc-qui-lim', 'Quixadá', 'Limoeiro do Norte', 140, 25, 3),
  ],
  'Expresso Jaguaribe': [
    makeRoute('ej-for-lim', 'Fortaleza', 'Limoeiro do Norte', 200, 28, 6),
    makeRoute('ej-qui-lim', 'Quixadá', 'Limoeiro do Norte', 140, 25, 4),
  ],
  'Via Cariri': [
    makeRoute('vc-jua-cra', 'Juazeiro do Norte', 'Crato', 11, 12, 14),
    makeRoute('vc-jua-bar', 'Juazeiro do Norte', 'Barbalha', 15, 12, 10),
    makeRoute('vc-cra-nol', 'Crato', 'Nova Olinda', 35, 15, 6),
  ],
}

// ─── Assembled mock data ──────────────────────────────────────────────────────

export const MOCK_COOPERATIVE_DETAILS: CooperativeDetail[] = MOCK_COOPERATIVES.map((coop) => {
  const contact = CONTACT_DATA[coop.name] ?? { phone: '(85) 3000-0000', website: 'vanhora.com.br' }
  const routes = applyExtras(ROUTES_DATA[coop.name] ?? [])
  const citiesServedEnriched = makeCitiesEnriched(routes)
  return {
    id: slugify(coop.name),
    name: coop.name,
    brandColor: COOPERATIVE_COLORS[coop.name] ?? '#185FA5',
    rating: coop.rating,
    ratingCount: coop.reviews,
    citiesServed: citiesServedEnriched.map((c) => c.name),
    citiesServedEnriched,
    routeCount: routes.length,
    phoneNumber: contact.phone,
    website: contact.website,
    routes,
    description: DESCRIPTION_DATA[coop.name] ?? null,
    operatingStats: computeStats(routes),
    recentHistory: HISTORY_DATA[coop.name] ?? {
      delays: { last30DaysCount: 0, averageDelayMinutes: 0, severityDistribution: { low: 0, medium: 0, high: 0 } },
      cancellations: { last30DaysCount: 0, recent: [] },
      onTimeRate: 1,
    },
  }
})

export function getMockCooperativeById(id: string): CooperativeDetail | null {
  return MOCK_COOPERATIVE_DETAILS.find((c) => c.id === id) ?? null
}
