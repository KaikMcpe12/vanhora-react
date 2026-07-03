/**
 * Normaliza nome de cidade para comparação case-insensitive sem acentos.
 * Exemplos:
 *   "Juazeiro do Norte" → "juazeiro do norte"
 *   "Crateús"           → "crateus"
 *   "SÃO PAULO"         → "sao paulo"
 *   "Fortaleza"         → "fortaleza"
 */
export function normalizeCity(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '') // remove combining diacritical marks (Unicode category Mn)
    .toLowerCase()
    .trim()
}
