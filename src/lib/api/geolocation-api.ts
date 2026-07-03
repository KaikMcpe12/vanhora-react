const TIMEOUT_MS = 5_000

export async function fetchUserCity(): Promise<string | null> {
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
