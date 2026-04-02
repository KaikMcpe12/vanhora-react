const STORAGE_KEY = 'vanhora:favorites'
const STORAGE_VERSION = 1

export interface FavoriteData {
  version: number
  ids: string[]
  updatedAt: string
}

/**
 * Cria objeto de favoritos vazio
 */
function createEmptyFavorites(): FavoriteData {
  return {
    version: STORAGE_VERSION,
    ids: [],
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Migra favoritos de versões antigas (para futuras atualizações)
 */
function migrateFavorites(oldData: FavoriteData): FavoriteData {
  console.log(
    'Migrating favorites from version',
    oldData.version,
    'to',
    STORAGE_VERSION,
  )

  // Por enquanto, só atualiza versão
  return {
    ...oldData,
    version: STORAGE_VERSION,
  }
}

/**
 * Lê favoritos do localStorage
 */
export function getFavorites(): FavoriteData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      // Primeira vez: retorna vazio
      return createEmptyFavorites()
    }

    const data = JSON.parse(stored) as FavoriteData

    // Migração de versão (se necessário no futuro)
    if (data.version < STORAGE_VERSION) {
      return migrateFavorites(data)
    }

    return data
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error)
    return createEmptyFavorites()
  }
}

/**
 * Salva favoritos no localStorage
 */
function saveFavorites(data: FavoriteData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error)

    // Quota exceeded? Tentar limpar dados antigos
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded')
    }

    throw new Error('Falha ao salvar favoritos')
  }
}

/**
 * Toggle favorito (adiciona se não existe, remove se existe)
 */
export function toggleFavorite(scheduleId: string): {
  added: boolean
  data: FavoriteData
} {
  const current = getFavorites()
  const isCurrentlyFavorite = current.ids.includes(scheduleId)

  const newData: FavoriteData = {
    version: STORAGE_VERSION,
    ids: isCurrentlyFavorite
      ? current.ids.filter((id) => id !== scheduleId) // Remove
      : [...current.ids, scheduleId], // Adiciona
    updatedAt: new Date().toISOString(),
  }

  saveFavorites(newData)

  return {
    added: !isCurrentlyFavorite,
    data: newData,
  }
}

/**
 * Limpa todos os favoritos (útil para debug/testes)
 */
export function clearFavorites(): void {
  localStorage.removeItem(STORAGE_KEY)
}
