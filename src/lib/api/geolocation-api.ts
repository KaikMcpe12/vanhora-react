/**
 * Camada de geolocalização agnóstica à origem dos dados.
 *
 * - Em dev: se VITE_MOCK_USER_CITY estiver definida, retorna esse valor
 *   sem chamar a rede (útil para testar cidades específicas).
 * - Em qualquer ambiente: chama https://ipinfo.io/json com o token
 *   VITE_IPINFO_TOKEN (opcional — sem token usa o tier gratuito).
 *
 * Quando o backend próprio disponibilizar um endpoint de geolocalização,
 * basta alterar `fetchUserCity` aqui. Hooks e componentes não mudam.
 */

const TIMEOUT_MS = 5_000

export async function fetchUserCity(): Promise<string | null> {
  // Mock determinístico para testes/desenvolvimento offline
  const mockCity = import.meta.env.VITE_MOCK_USER_CITY as string | undefined
  if (mockCity) {
    await new Promise((r) => setTimeout(r, 200)) // simula latência de rede
    return mockCity
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const token = import.meta.env.VITE_IPINFO_TOKEN as string | undefined
    const url = token
      ? `https://ipinfo.io/json?token=${token}`
      : 'https://ipinfo.io/json'

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) return null

    const data = (await res.json()) as { city?: string }
    return data.city ?? null
  } catch {
    clearTimeout(timer)
    return null
  }
}
