/**
 * token-store.ts
 *
 * Typed storage for JWT tokens (access + refresh).
 * Access token is kept only in memory to reduce XSS exposure;
 * refresh token is persisted to localStorage so sessions survive page reloads.
 *
 * When integrating with the real backend swap nothing here — just call
 * setTokens() on sign-in and clearTokens() on sign-out.
 */

// ─── Keys ────────────────────────────────────────────────────────────────────

const REFRESH_TOKEN_KEY = 'vanhora-refresh-token'

// ─── In-memory access token ───────────────────────────────────────────────────

let _accessToken: string | null = null

export function getAccessToken(): string | null {
  return _accessToken
}

export function setAccessToken(token: string): void {
  _accessToken = token
}

export function clearAccessToken(): void {
  _accessToken = null
}

// ─── Persisted refresh token ─────────────────────────────────────────────────

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setRefreshToken(token: string): void {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } catch {
    // storage quota or private browsing — degrade gracefully
  }
}

export function clearRefreshToken(): void {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  } catch {
    // ignore
  }
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export function setTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
}

export function clearTokens(): void {
  clearAccessToken()
  clearRefreshToken()
}

export function hasTokens(): boolean {
  return _accessToken !== null || getRefreshToken() !== null
}
