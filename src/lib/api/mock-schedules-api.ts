import { getCityNameById } from '@/lib/data/mock-cities'
import { generateMockSchedules } from '@/lib/data/mock-schedules'
import type { Schedule } from '@/lib/types/schedule'
import { devLog } from '@/lib/utils/dev-log'

/**
 * Parâmetros de busca (simula query params da API)
 */
export interface FetchSchedulesParams {
  // Filtro de favoritos
  ids?: string[]

  // Filtros básicos
  origin?: string
  destination?: string
  date?: string // YYYY-MM-DD (converte para dayOfWeek)

  // Filtros avançados
  cooperative?: string
  rating?: number // Rating mínimo
  priceMin?: number
  priceMax?: number
  dayOfWeek?: string[] // ['monday', 'friday']

  // Filtros de horário
  departureAfter?: string // HH:mm
  departureBefore?: string // HH:mm

  // Paginação
  page?: number // Default: 0
  limit?: number // Default: 12
}

/**
 * Resposta da API
 */
export interface FetchSchedulesResponse {
  schedules: Schedule[]
  meta: {
    pageIndex: number
    perPage: number
    totalCount: number
  }
}

/**
 * Mock da API GET /api/schedules
 * Simula lógica de filtros no backend
 *
 * @example
 * // Buscar favoritos com filtros
 * const result = await mockSchedulesAPI({
 *   ids: ['schedule-1', 'schedule-5'],
 *   origin: 'Juazeiro do Norte',
 *   date: '2026-04-01'
 * })
 *
 * @example
 * // Buscar todos com rating mínimo
 * const result = await mockSchedulesAPI({
 *   rating: 4,
 *   priceMax: 50
 * })
 */
export async function mockSchedulesAPI(
  params: FetchSchedulesParams = {},
): Promise<FetchSchedulesResponse> {
  // ===== SIMULAR LATÊNCIA DE REDE =====
  // Latência aleatória entre 100-300ms
  const delay = Math.random() * 200 + 100
  await new Promise((resolve) => setTimeout(resolve, delay))

  // ===== CARREGAR SCHEDULES BASE =====
  let schedules = generateMockSchedules()
  const totalCount = schedules.length

  devLog('[mockSchedulesAPI] Parâmetros:', params)
  devLog('[mockSchedulesAPI] Total schedules:', totalCount)

  // ===== APLICAR FILTROS =====

  // 1. Filtro por IDs (favoritos)
  if (params.ids && params.ids.length > 0) {
    schedules = schedules.filter((s) => params.ids!.includes(s.id))
    devLog(`[mockSchedulesAPI] Após filtro IDs: ${schedules.length}`)
  }

  // 2. Filtro por origem (converte ID para nome se necessário)
  if (params.origin) {
    const originName = getCityNameById(params.origin)
    schedules = schedules.filter((s) => s.origin === originName)
    devLog(
      `[mockSchedulesAPI] Após filtro origem (${params.origin} → ${originName}): ${schedules.length}`,
    )
  }

  // 3. Filtro por destino (converte ID para nome se necessário)
  if (params.destination) {
    const destinationName = getCityNameById(params.destination)
    schedules = schedules.filter((s) => s.destination === destinationName)
    devLog(
      `[mockSchedulesAPI] Após filtro destino (${params.destination} → ${destinationName}): ${schedules.length}`,
    )
  }

  // 4. Filtro por data (converte para dayOfWeek)
  if (params.date) {
    const targetDate = new Date(params.date)
    const dayOfWeek = targetDate
      .toLocaleDateString('en-US', {
        weekday: 'long',
      })
      .toLowerCase()

    // NOTA: Por enquanto não temos campo dayOfWeek nos schedules
    // Este filtro será implementado quando adicionar o campo
    devLog(
      `[mockSchedulesAPI] Filtro data (${params.date} → ${dayOfWeek}): ignorado (campo dayOfWeek não implementado)`,
    )
  }

  // 5. Filtro por cooperativa
  if (params.cooperative) {
    schedules = schedules.filter(
      (s) => s.cooperativeName === params.cooperative,
    )
    devLog(`[mockSchedulesAPI] Após filtro cooperativa: ${schedules.length}`)
  }

  // 6. Filtro por rating mínimo
  if (params.rating !== undefined && params.rating > 0) {
    schedules = schedules.filter(
      (s) => s.cooperativeRating && s.cooperativeRating >= params.rating!,
    )
    devLog(`[mockSchedulesAPI] Após filtro rating: ${schedules.length}`)
  }

  // 7. Filtro por preço mínimo
  if (params.priceMin !== undefined && params.priceMin > 0) {
    schedules = schedules.filter((s) => s.price >= params.priceMin!)
    devLog(`[mockSchedulesAPI] Após filtro priceMin: ${schedules.length}`)
  }

  // 8. Filtro por preço máximo
  if (params.priceMax !== undefined && params.priceMax > 0) {
    schedules = schedules.filter((s) => s.price <= params.priceMax!)
    devLog(`[mockSchedulesAPI] Após filtro priceMax: ${schedules.length}`)
  }

  // 9. Filtro por dias da semana (array)
  // NOTA: Por enquanto não temos campo dayOfWeek nos schedules
  if (params.dayOfWeek && params.dayOfWeek.length > 0) {
    devLog(
      `[mockSchedulesAPI] Filtro dayOfWeek: ignorado (campo dayOfWeek não implementado)`,
    )
  }

  // 10. Filtro por horário de partida (após)
  if (params.departureAfter) {
    schedules = schedules.filter(
      (s) => s.departureTime >= params.departureAfter!,
    )
    devLog(`[mockSchedulesAPI] Após filtro departureAfter: ${schedules.length}`)
  }

  // 11. Filtro por horário de partida (antes)
  if (params.departureBefore) {
    schedules = schedules.filter(
      (s) => s.departureTime <= params.departureBefore!,
    )
    devLog(
      `[mockSchedulesAPI] Após filtro departureBefore: ${schedules.length}`,
    )
  }

  // ===== ORDENAÇÃO =====
  // Ordenar por horário de partida (crescente)
  schedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime))

  // ===== PAGINAÇÃO =====
  const page = params.page ?? 0
  const limit = params.limit ?? 12
  const startIndex = page * limit
  const endIndex = startIndex + limit

  const totalFiltered = schedules.length
  const paginatedSchedules = schedules.slice(startIndex, endIndex)

  devLog(
    `[mockSchedulesAPI] Página ${page}, ${paginatedSchedules.length} de ${totalFiltered}`,
  )

  // ===== RETORNO =====
  return {
    schedules: paginatedSchedules,
    meta: {
      pageIndex: page,
      perPage: limit,
      totalCount: totalFiltered,
    },
  }
}
