import type {
  CheckRatingResponse,
  Rating,
  RatingStats,
  SubmitRatingResponse,
} from '@/lib/types/schedule'

// Gera ratings mockados para schedules
function generateMockRatings(): Rating[] {
  const ratings: Rating[] = []

  // IDs mockados de schedules (baseados no padrão do mock-schedules.ts)
  // Estes IDs seguem o formato: origin-destination-time-cooperative
  const sampleScheduleIds = [
    'nova-russas-crateús-08:00-topvans',
    'crateús-fortaleza-14:30-cooptrans',
    'fortaleza-nova-russas-06:00-topvans',
    'ipueiras-crateús-07:30-expresso-nordeste',
    'crateús-nova-russas-15:00-cooptrans-regional',
  ]

  sampleScheduleIds.forEach((scheduleId) => {
    // Gera entre 5 a 150 avaliações por schedule
    const numRatings = Math.floor(Math.random() * 145) + 5

    for (let i = 0; i < numRatings; i++) {
      // Distribuição realista: mais 4-5 estrelas
      const randomValue = Math.random()
      let stars: number

      if (randomValue < 0.45)
        stars = 5 // 45%
      else if (randomValue < 0.75)
        stars = 4 // 30%
      else if (randomValue < 0.9)
        stars = 3 // 15%
      else if (randomValue < 0.97)
        stars = 2 // 7%
      else stars = 1 // 3%

      ratings.push({
        id: `rating_${scheduleId}_${i}`,
        scheduleId,
        stars,
        createdAt: new Date(
          Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000, // últimos 90 dias
        ).toISOString(),
      })
    }
  })

  return ratings
}

// Cache para performance (mesmo padrão do mock-schedules.ts)
let cachedRatings: Rating[] | null = null

function getMockRatings(): Rating[] {
  if (!cachedRatings) {
    cachedRatings = generateMockRatings()
  }
  return cachedRatings
}

// Calcula estatísticas agregadas
export function getRatingStats(scheduleId: string): RatingStats {
  const ratings = getMockRatings().filter((r) => r.scheduleId === scheduleId)

  if (ratings.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  ratings.forEach((rating) => {
    distribution[rating.stars as keyof typeof distribution]++
    sum += rating.stars
  })

  return {
    average: parseFloat((sum / ratings.length).toFixed(1)),
    total: ratings.length,
    distribution,
  }
}

// Simula verificação de avaliação do usuário
export async function mockCheckUserRating(
  scheduleId: string,
): Promise<CheckRatingResponse> {
  // Simula delay de rede (mesmo padrão do schedule-dialog.tsx)
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Verifica localStorage
  const stored = localStorage.getItem(`vanhora_rating_${scheduleId}`)

  if (stored) {
    const { stars, id, createdAt } = JSON.parse(stored)
    return {
      hasRated: true,
      rating: { id, stars, createdAt },
    }
  }

  return { hasRated: false }
}

// Simula submissão de avaliação
export async function mockSubmitRating(
  scheduleId: string,
  stars: number,
): Promise<SubmitRatingResponse> {
  // Validação
  if (stars < 1 || stars > 5) {
    throw new Error('Rating deve estar entre 1 e 5 estrelas')
  }

  // Simula delay de rede
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Simula 5% de chance de erro (para testar error handling)
  if (Math.random() < 0.05) {
    throw new Error('Erro ao enviar avaliação. Tente novamente.')
  }

  const stored = localStorage.getItem(`vanhora_rating_${scheduleId}`)

  if (stored) {
    // Atualização de avaliação existente
    const parsed = JSON.parse(stored)
    const updated = {
      id: parsed.id,
      stars,
      createdAt: parsed.createdAt,
      updatedAt: new Date().toISOString(),
    }

    localStorage.setItem(
      `vanhora_rating_${scheduleId}`,
      JSON.stringify(updated),
    )

    return {
      success: true,
      action: 'updated',
      rating: { id: updated.id, stars },
    }
  } else {
    // Criação de nova avaliação
    const id = `rating_${scheduleId}_${Date.now()}`
    const rating = {
      id,
      stars,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(`vanhora_rating_${scheduleId}`, JSON.stringify(rating))

    return {
      success: true,
      action: 'created',
      rating: { id, stars },
    }
  }
}
