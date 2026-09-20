import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  type ParserBuilder,
  useQueryState,
  useQueryStates,
} from 'nuqs'
import { useCallback, useMemo } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyParser = ParserBuilder<any>

export interface UseTableFiltersConfig<F extends Record<string, unknown>> {
  defaults: F
  /**
   * Override de parser por chave — para contratos de URL específicos
   * (string-literal, array). As chaves não informadas são inferidas do default.
   */
  parsers?: Partial<Record<keyof F, AnyParser>>
  /**
   * Informativo: o debounce da busca é aplicado no consumo (no input), o hook
   * em si é síncrono — os filtros refletem imediatamente.
   */
  debounceMs?: number
  /**
   * Prefixo aplicado às keys de URL (`<namespace>_search`, `<namespace>_page`, …).
   * Use quando houver ≥2 tabelas na mesma página para evitar colisão de `?page=`.
   * Ausente = comportamento legado (chaves cruas, retrocompat com PR7/PR9).
   */
  namespace?: string
}

export interface UseTableFiltersReturn<F> {
  filters: F
  setFilter: <K extends keyof F>(key: K, value: F[K]) => void
  setFilters: (partial: Partial<F>) => void
  reset: () => void
  page: number
  setPage: (n: number) => void
}

/** Infere o parser nuqs a partir do tipo em runtime do valor default. */
function inferParser(value: unknown): AnyParser {
  if (typeof value === 'number') return parseAsInteger.withDefault(value)
  if (typeof value === 'boolean') return parseAsBoolean.withDefault(value)
  if (Array.isArray(value))
    return parseAsArrayOf(parseAsString).withDefault(value as string[])
  return parseAsString.withDefault(String(value ?? ''))
}

/**
 * Estado de filtros de tabela sincronizado com a URL (nuqs). Paginação
 * 0-indexed via `?page=` (ou `?<namespace>_page=` quando `namespace` é passado).
 * Qualquer mudança de filtro volta para a página 0. Refresh do browser preserva
 * tudo. Padroniza o que `delays.tsx` já fazia inline.
 */
export function useTableFilters<F extends Record<string, unknown>>({
  defaults,
  parsers,
  namespace,
}: UseTableFiltersConfig<F>): UseTableFiltersReturn<F> {
  const prefix = namespace ? `${namespace}_` : ''
  const pageKey = `${prefix}page`

  // parser map estável — defaults/parsers/namespace não mudam entre renders.
  // Aplica o prefixo às chaves de URL mas mantém o objeto de saída com chaves
  // originais (via mapa de tradução `keyMap`).
  const { parserMap, keyMap, reverseKeyMap } = useMemo(() => {
    const p: Record<string, AnyParser> = {}
    const k: Record<string, string> = {}
    const r: Record<string, string> = {}
    for (const key of Object.keys(defaults)) {
      const urlKey = `${prefix}${key}`
      p[urlKey] = parsers?.[key as keyof F] ?? inferParser(defaults[key])
      k[key] = urlKey
      r[urlKey] = key
    }
    return { parserMap: p, keyMap: k, reverseKeyMap: r }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [rawFilters, setRawFilters] = useQueryStates(parserMap)
  const [page, setPageState] = useQueryState(
    pageKey,
    parseAsInteger.withDefault(0),
  )

  // Traduz chaves cruas (com prefixo) para as do consumidor.
  const filters = useMemo(() => {
    const out: Record<string, unknown> = {}
    for (const [urlKey, value] of Object.entries(rawFilters)) {
      out[reverseKeyMap[urlKey] ?? urlKey] = value
    }
    return out as F
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawFilters])

  const setFilters = useCallback(
    (partial: Partial<F>) => {
      const prefixed: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(partial)) {
        prefixed[keyMap[k] ?? k] = v
      }
      setRawFilters(prefixed)
      setPageState(0) // qualquer mudança de filtro volta à primeira página
    },
    [setRawFilters, setPageState, keyMap],
  )

  const setFilter = useCallback(
    <K extends keyof F>(key: K, value: F[K]) => {
      setFilters({ [key]: value } as unknown as Partial<F>)
    },
    [setFilters],
  )

  const reset = useCallback(() => {
    const prefixedDefaults: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(defaults)) {
      prefixedDefaults[keyMap[k] ?? k] = v
    }
    setRawFilters(prefixedDefaults)
    setPageState(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRawFilters, setPageState, keyMap])

  const setPage = useCallback(
    (n: number) => {
      setPageState(n)
    },
    [setPageState],
  )

  return {
    filters,
    setFilter,
    setFilters,
    reset,
    page,
    setPage,
  }
}
