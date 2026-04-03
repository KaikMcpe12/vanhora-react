/**
 * Utilities de log condicionais
 * Apenas exibem logs em ambiente de desenvolvimento
 */

const isDev = import.meta.env.DEV

export function devLog(...args: unknown[]): void {
  if (isDev) console.log('[DEV]', ...args)
}

export function devWarn(...args: unknown[]): void {
  if (isDev) console.warn('[DEV]', ...args)
}

export function devError(...args: unknown[]): void {
  if (isDev) console.error('[DEV]', ...args)
}
