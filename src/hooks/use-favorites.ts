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

// ===== STORE DE FAVORITOS (SINGLETON) =====
// Única fonte de verdade compartilhada entre todos os componentes

let listeners: Array<() => void> = []
let currentFavorites: string[] = []

/**
 * Carrega favoritos do localStorage (com migração)
 */
function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)

    // Migração automática do schema antigo
    if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      const ids = parsed.ids || []
      // Salvar no novo formato
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
      return ids
    }

    // Schema novo (array simples)
    if (Array.isArray(parsed)) {
      return parsed
    }

    return []
  } catch (error) {
    devError('[FavoritesStore] Erro ao carregar:', error)
    return []
  }
}

/**
 * Salva favoritos no localStorage
 */
function saveFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))

    // Notifica todos os listeners (componentes)
    listeners.forEach((listener) => listener())
  } catch (error) {
    devError('[FavoritesStore] Erro ao salvar:', error)
  }
}

/**
 * Obtém snapshot atual dos favoritos
 */
function getSnapshot(): string[] {
  return currentFavorites
}

/**
 * Subscribe para mudanças
 */
function subscribe(listener: () => void): () => void {
  listeners.push(listener)

  // Unsubscribe
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

// Inicializa ao carregar o módulo (apenas uma vez)
currentFavorites = loadFavorites()

// ===== HOOK =====

/**
 * Hook para gerenciar favoritos via localStorage
 * Compartilha estado entre todos os componentes usando useSyncExternalStore
 *
 * @example
 * const { isFavorite, toggleFavorite, count } = useFavorites()
 */
export function useFavorites(): UseFavoritesReturn {
  // Sincroniza com store externo (localStorage)
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  /**
   * Adiciona ou remove um schedule dos favoritos
   */
  const toggleFavorite = useCallback((scheduleId: string) => {
    const isCurrentlyFavorite = currentFavorites.includes(scheduleId)

    // Se tentando adicionar e já está no limite
    if (!isCurrentlyFavorite && currentFavorites.length >= MAX_FAVORITES) {
      toast.error(`Limite de ${MAX_FAVORITES} favoritos atingido!`, {
        description: 'Remova alguns favoritos para adicionar novos.',
      })
      return // Impede execução
    }

    currentFavorites = isCurrentlyFavorite
      ? currentFavorites.filter((id) => id !== scheduleId)
      : [...currentFavorites, scheduleId]

    saveFavorites(currentFavorites)
  }, [])

  /**
   * Verifica se um schedule é favorito
   */
  const isFavorite = useCallback(
    (scheduleId: string): boolean => {
      return favoriteIds.includes(scheduleId)
    },
    [favoriteIds],
  )

  /**
   * Limpa todos os favoritos
   */
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
