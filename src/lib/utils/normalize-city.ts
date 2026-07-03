export function normalizeCity(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '') // remove combining diacritical marks
    .toLowerCase()
    .trim()
}
