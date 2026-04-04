import { getCityNameById } from '@/lib/data/mock-cities'
import { generateMockSchedules } from '@/lib/data/mock-schedules'
import type { Schedule } from '@/lib/types/schedule'
import { devLog } from '@/lib/utils/dev-log'

/** parâmetros de busca (simula query params da api) */
export interface FetchSchedulesParams {
  ids?: string[]
  origin?: string
  destination?: string
  date?: string // yyyy-mm-dd
  cooperative?: string
  rating?: number // rating mínimo
  priceMin?: number
  priceMax?: number
  dayOfWeek?: string[] // ['monday', 'friday']
  departureAfter?: string // hh:mm
  departureBefore?: string // hh:mm
  page?: number // default: 0
  limit?: number // default: 12
}

/** resposta da api */
export interface FetchSchedulesResponse {
  schedules: Schedule[]
  meta: {
    pageIndex: number
    perPage: number
    totalCount: number
  }
}

/** mock da api get /api/schedules */
export async function mockSchedulesAPI(
  params: FetchSchedulesParams = {},
): Promise<FetchSchedulesResponse> {
  // simula latência de rede (100-300ms)
  const delay = Math.random() * 200 + 100
  await new Promise((resolve) => setTimeout(resolve, delay))

  let schedules = generateMockSchedules()
  const totalCount = schedules.length

  devLog('[mockSchedulesAPI] Parâmetros:', params)
  devLog('[mockSchedulesAPI] Total schedules:', totalCount)

  // filtro por ids (favoritos)
  if (params.ids && params.ids.length > 0) {
    schedules = schedules.filter((s) => params.ids!.includes(s.id))
    devLog(`[mockSchedulesAPI] Após filtro IDs: ${schedules.length}`)
  }

  // filtro por origem (converte id para nome se necessário)
  if (params.origin) {
    const originName = getCityNameById(params.origin)
    schedules = schedules.filter((s) => s.origin === originName)
    devLog(
      `[mockSchedulesAPI] Após filtro origem (${params.origin} → ${originName}): ${schedules.length}`,
    )
  }

  // filtro por destino
  if (params.destination) {
    const destinationName = getCityNameById(params.destination)
    schedules = schedules.filter((s) => s.destination === destinationName)
    devLog(
      `[mockSchedulesAPI] Após filtro destino (${params.destination} → ${destinationName}): ${schedules.length}`,
    )
  }

  // TODO: filtro por data (campo dayofweek não implementado)
  if (params.date) {
    const targetDate = new Date(params.date)
    const dayOfWeek = targetDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()

    devLog(
      `[mockSchedulesAPI] Filtro data (${params.date} → ${dayOfWeek}): ignorado`,
    )
  }

  // filtro por cooperativa
  if (params.cooperative) {
    schedules = schedules.filter(
      (s) => s.cooperativeName === params.cooperative,
    )
    devLog(`[mockSchedulesAPI] Após filtro cooperativa: ${schedules.length}`)
  }

  // filtro por rating mínimo
  if (params.rating !== undefined && params.rating > 0) {
    schedules = schedules.filter(
      (s) => s.cooperativeRating && s.cooperativeRating >= params.rating!,
    )
    devLog(`[mockSchedulesAPI] Após filtro rating: ${schedules.length}`)
  }

  // filtro por preço mínimo
  if (params.priceMin !== undefined && params.priceMin > 0) {
    schedules = schedules.filter((s) => s.price >= params.priceMin!)
    devLog(`[mockSchedulesAPI] Após filtro priceMin: ${schedules.length}`)
  }

  // filtro por preço máximo
  if (params.priceMax !== undefined && params.priceMax > 0) {
    schedules = schedules.filter((s) => s.price <= params.priceMax!)
    devLog(`[mockSchedulesAPI] Após filtro priceMax: ${schedules.length}`)
  }

  // TODO: filtro por dias da semana (campo dayofweek não implementado)
  if (params.dayOfWeek && params.dayOfWeek.length > 0) {
    devLog(`[mockSchedulesAPI] Filtro dayOfWeek: ignorado`)
  }

  // filtro por horário de partida (após)
  if (params.departureAfter) {
    schedules = schedules.filter(
      (s) => s.departureTime >= params.departureAfter!,
    )
    devLog(`[mockSchedulesAPI] Após filtro departureAfter: ${schedules.length}`)
  }

  // filtro por horário de partida (antes)
  if (params.departureBefore) {
    schedules = schedules.filter(
      (s) => s.departureTime <= params.departureBefore!,
    )
    devLog(
      `[mockSchedulesAPI] Após filtro departureBefore: ${schedules.length}`,
    )
  }

  // ordenar por horário de partida
  schedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime))

  // paginação
  const page = params.page ?? 0
  const limit = params.limit ?? 12
  const startIndex = page * limit
  const endIndex = startIndex + limit

  const totalFiltered = schedules.length
  const paginatedSchedules = schedules.slice(startIndex, endIndex)

  devLog(
    `[mockSchedulesAPI] Página ${page}, ${paginatedSchedules.length} de ${totalFiltered}`,
  )

  return {
    schedules: paginatedSchedules,
    meta: {
      pageIndex: page,
      perPage: limit,
      totalCount: totalFiltered,
    },
  }
}
