// TODO: replace with GET /api/cooperatives and GET /api/cooperatives/:id
// see api-spec.md sections 2.4 and 3.5
import { MOCK_COOPERATIVES } from './mock-cooperatives'
import { COOPERATIVE_COLORS } from '@/lib/utils/schedule-status'

export type CooperativeRoute = {
  id: string
  displayName: string
  durationText: string
  stopsCount: number
  schedulesTodayCount: number
  priceFrom: number
}

export type CooperativeDetail = {
  id: string
  name: string
  brandColor: string
  rating: number
  ratingCount: number
  citiesServed: string[]
  routeCount: number
  phoneNumber: string
  website: string
  routes: CooperativeRoute[]
}

function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
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
  }
}

// Slugify helper (used for IDs)
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
}

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

export const MOCK_COOPERATIVE_DETAILS: CooperativeDetail[] = MOCK_COOPERATIVES.map((coop) => {
  const contact = CONTACT_DATA[coop.name] ?? { phone: '(85) 3000-0000', website: 'vanhora.com.br' }
  const routes = ROUTES_DATA[coop.name] ?? []
  return {
    id: slugify(coop.name),
    name: coop.name,
    brandColor: COOPERATIVE_COLORS[coop.name] ?? '#185FA5',
    rating: coop.rating,
    ratingCount: coop.reviews,
    citiesServed: [...coop.routes],
    routeCount: routes.length,
    phoneNumber: contact.phone,
    website: contact.website,
    routes,
  }
})

export function getMockCooperativeById(id: string): CooperativeDetail | null {
  return MOCK_COOPERATIVE_DETAILS.find((c) => c.id === id) ?? null
}
