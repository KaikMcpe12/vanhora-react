/**
 * Utilitário para gerenciar ranges de tempo para categorização de horários
 *
 * Categorias:
 * - Partindo Agora: agora → +60min
 * - Próximos: +60min → fim do dia
 * - Decorridos: início do dia → agora
 */

export interface TimeRange {
  departureAfter?: string
  departureBefore?: string
}

export interface TimeRanges {
  leavingNow: TimeRange
  upcoming: TimeRange
  past: TimeRange
}

/**
 * Calcula os ranges de tempo baseado no horário atual
 */
export function getTimeRanges(): TimeRanges {
  const now = new Date()

  // Horário atual em formato HH:MM
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // +60 minutos do horário atual
  const in60Minutes = new Date(now.getTime() + 60 * 60 * 1000)
  const in60MinutesTime = `${in60Minutes.getHours().toString().padStart(2, '0')}:${in60Minutes.getMinutes().toString().padStart(2, '0')}`

  // Início do dia atual
  const startOfDay = '05:00' // Primeiro horário de vans

  // Fim do dia atual
  const endOfDay = '22:30' // Último horário de vans

  return {
    // ⚡ Partindo Agora: próximos 60 minutos
    leavingNow: {
      departureAfter: currentTime,
      departureBefore: in60MinutesTime,
    },

    // 📅 Próximos: de +60min até fim do dia
    upcoming: {
      departureAfter: in60MinutesTime,
      departureBefore: endOfDay,
    },

    // ✓ Decorridos: início do dia até agora
    past: {
      departureAfter: startOfDay,
      departureBefore: currentTime,
    },
  }
}

/**
 * Helper para verificar se um horário está dentro de um range
 */
export function isTimeInRange(time: string, range: TimeRange): boolean {
  const timeInMinutes = timeToMinutes(time)

  const afterMinutes = range.departureAfter
    ? timeToMinutes(range.departureAfter)
    : 0
  const beforeMinutes = range.departureBefore
    ? timeToMinutes(range.departureBefore)
    : 24 * 60

  return timeInMinutes >= afterMinutes && timeInMinutes <= beforeMinutes
}

/**
 * Converte horário HH:MM para minutos totais
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Helper para obter informações sobre um range específico
 */
export function getTimeRangeInfo(rangeType: keyof TimeRanges) {
  const ranges = getTimeRanges()
  const range = ranges[rangeType]

  const formatTime = (time?: string) => {
    if (!time) return null
    const [hours, minutes] = time.split(':').map(Number)
    return new Date(0, 0, 0, hours, minutes).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return {
    after: formatTime(range.departureAfter),
    before: formatTime(range.departureBefore),
    description: getRangeDescription(rangeType),
  }
}

/**
 * Descrições amigáveis para cada range
 */
function getRangeDescription(rangeType: keyof TimeRanges): string {
  switch (rangeType) {
    case 'leavingNow':
      return 'Horários partindo nos próximos 60 minutos'
    case 'upcoming':
      return 'Horários de hoje após os próximos 60 minutos'
    case 'past':
      return 'Horários já partidos hoje'
    default:
      return 'Todos os horários'
  }
}

/**
 * Helper para determinar o range ativo baseado no horário atual
 */
export function getCurrentActiveRange(): keyof TimeRanges {
  const now = new Date()
  const currentHour = now.getHours()

  // Se for muito cedo (antes das 5h) ou muito tarde (depois das 22h30)
  if (currentHour < 5 || currentHour >= 23) {
    return 'upcoming' // Mostra próximos como padrão
  }

  // Durante o dia operacional, prioriza "partindo agora"
  return 'leavingNow'
}

/**
 * Validação para ranges de tempo customizados
 */
export function validateTimeRange(range: TimeRange): boolean {
  if (!range.departureAfter && !range.departureBefore) {
    return true // Range vazio é válido
  }

  if (range.departureAfter && range.departureBefore) {
    const afterMinutes = timeToMinutes(range.departureAfter)
    const beforeMinutes = timeToMinutes(range.departureBefore)

    return afterMinutes <= beforeMinutes
  }

  return true
}
