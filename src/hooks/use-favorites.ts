import { useCallback, useSyncExternalStore } from 'react'
import { toast } from 'sonner'

import { devError } from '@/lib/utils/dev-log'

const STORAGE_KEY = 'vanhora_favorites'
const MAX_FAVORITES = 100

interface UseFavoritesReturn {
  favoriteIds: string[]
  toggleFavorite: (scheduleId: string) => void
  isFavorite: (scheduleId: string) => boolean
  count: number
  maxFavorites: number
  isAtLimit: boolean
  clearFavorites: () => void
}

// store de favoritos (singleton)
let listeners: Array<() => void> = []
let currentFavorites: string[] = []

/** carrega favoritos do localstorage (com migração) */
function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)

    // migração automática do schema antigo
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      const ids = parsed.ids || []
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
      return ids
    }

    if (Array.isArray(parsed)) {
      return parsed
    }

    return []
  } catch (error) {
    devError('[FavoritesStore] Erro ao carregar:', error)
    return []
  }
}

/** salva favoritos no localstorage */
function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    listeners.forEach((listener) => listener())
  } catch (error) {
    devError('[FavoritesStore] Erro ao salvar:', error)
  }
}

function getSnapshot(): string[] {
  return currentFavorites
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// inicializa ao carregar o módulo
currentFavorites = loadFavorites()

/** hook para gerenciar favoritos via localstorage */
export function useFavorites(): UseFavoritesReturn {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const toggleFavorite = useCallback((scheduleId: string) => {
    const isCurrentlyFavorite = currentFavorites.includes(scheduleId)

    if (!isCurrentlyFavorite && currentFavorites.length >= MAX_FAVORITES) {
      toast.error(`Limite de ${MAX_FAVORITES} favoritos atingido!`, {
        description: 'Remova alguns favoritos para adicionar novos.',
      })
      return
    }

    currentFavorites = isCurrentlyFavorite
      ? currentFavorites.filter((id) => id !== scheduleId)
      : [...currentFavorites, scheduleId]

    saveFavorites(currentFavorites)
  }, [])

  const isFavorite = useCallback(
    (scheduleId: string): boolean => {
      return favoriteIds.includes(scheduleId)
    },
    [favoriteIds],
  )

  const clearFavorites = useCallback(() => {
    currentFavorites = []
    saveFavorites([])
  }, [])

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    count: favoriteIds.length,
    maxFavorites: MAX_FAVORITES,
    isAtLimit: favoriteIds.length >= MAX_FAVORITES,
    clearFavorites,
  }
}
