import { useEffect } from 'react'

/**
 * Sincroniza os campos de um form quando o dialog/drawer abre (e quando `source`
 * muda), cobrindo aberturas programáticas que não disparam onOpenChange.
 *
 * @example useFormDialogState(open, city, (c) => setName(c?.name ?? ''))
 * @example useFormDialogState(open, cooperative, (c) => reset(toDefaults(c)))
 */
export function useFormDialogState<T>(
  open: boolean,
  source: T,
  sync: (source: T) => void,
): void {
  useEffect(() => {
    if (open) sync(source)
    // `sync` é recriado a cada render; sincronizar só em open/source é intencional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, source])
}
