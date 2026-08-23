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
 * 0-indexed via `?page=`. Qualquer mudança de filtro volta para a página 0.
 * Refresh do browser preserva tudo. Padroniza o que `delays.tsx` já fazia inline.
 */
export function useTableFilters<F extends Record<string, unknown>>({
  defaults,
  parsers,
}: UseTableFiltersConfig<F>): UseTableFiltersReturn<F> {
  // parser map estável — defaults/parsers não mudam entre renders
  const parserMap = useMemo(() => {
    const map: Record<string, AnyParser> = {}
    for (const key of Object.keys(defaults)) {
      map[key] = parsers?.[key as keyof F] ?? inferParser(defaults[key])
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [rawFilters, setRawFilters] = useQueryStates(parserMap)
  const [page, setPageState] = useQueryState(
    'page',
    parseAsInteger.withDefault(0),
  )

  const setFilters = useCallback(
    (partial: Partial<F>) => {
      setRawFilters(partial as Record<string, unknown>)
      setPageState(0) // qualquer mudança de filtro volta à primeira página
    },
    [setRawFilters, setPageState],
  )

  const setFilter = useCallback(
    <K extends keyof F>(key: K, value: F[K]) => {
      setFilters({ [key]: value } as unknown as Partial<F>)
    },
    [setFilters],
  )

  const reset = useCallback(() => {
    setRawFilters(defaults as Record<string, unknown>)
    setPageState(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRawFilters, setPageState])

  const setPage = useCallback(
    (n: number) => {
      setPageState(n)
    },
    [setPageState],
  )

  return {
    filters: rawFilters as F,
    setFilter,
    setFilters,
    reset,
    page,
    setPage,
  }
}
