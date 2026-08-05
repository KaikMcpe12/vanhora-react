import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { env } from '@/env'
import {
  getMeRequest,
  mapAuthUser,
  signInRequest,
  signOutRequest,
} from '@/lib/api/auth-api'
import { apiClient } from '@/lib/api/http-client'
import {
  clearTokens,
  getRefreshToken,
  hasTokens,
  setTokens,
} from '@/lib/auth/token-store'
import {
  APP_PORTAL_MOCK_USERS,
  type AppPortalRole,
  type AppPortalUser,
} from '@/pages/app-portal/app-portal-navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface SessionContextValue {
  status: SessionStatus
  user: AppPortalUser | null
  signIn: (email: string, password: string) => Promise<AppPortalUser>
  signOut: () => void
}

interface StoredSession {
  user: AppPortalUser
  expiresAt: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SESSION_KEY = 'vanhora-session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 h

/**
 * When VITE_API_URL is set the real backend is used.
 * When it is absent (local dev without backend) the mock path runs instead.
 */
const USE_REAL_API = Boolean(env.VITE_API_URL)

// ─── Mock credentials (dev only) ─────────────────────────────────────────────

/**
 * Mock credentials — only used when VITE_API_URL is not configured.
 * Remove this block once the backend is permanently available.
 */
const MOCK_CREDENTIALS: Record<string, AppPortalUser> = {
  'admin@vanhora.dev': APP_PORTAL_MOCK_USERS.admin,
  'coop@vanhora.dev': APP_PORTAL_MOCK_USERS.cooperative,
  'driver@vanhora.dev': APP_PORTAL_MOCK_USERS.driver,
}

// ─── localStorage helpers (mock session) ─────────────────────────────────────

function readStoredSession(): AppPortalUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed.user
  } catch {
    return null
  }
}

function writeStoredSession(user: AppPortalUser): void {
  const session: StoredSession = { user, expiresAt: Date.now() + SESSION_TTL_MS }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function deleteStoredSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

// ─── Context ─────────────────────────────────────────────────────────────────

const SessionContext = createContext<SessionContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUser] = useState<AppPortalUser | null>(null)

  // Hydrate session on mount
  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      if (USE_REAL_API) {
        // Real path: if a refresh token exists, fetch current user from /api/auth/me.
        // The http-client interceptor will use the in-memory access token (or refresh it).
        if (!hasTokens()) {
          if (!cancelled) setStatus('unauthenticated')
          return
        }
        try {
          const me = await getMeRequest(apiClient)
          if (!cancelled) {
            setUser(me)
            setStatus('authenticated')
          }
        } catch {
          clearTokens()
          if (!cancelled) setStatus('unauthenticated')
        }
      } else {
        // Mock path: read user from localStorage
        const stored = readStoredSession()
        if (!cancelled) {
          setUser(stored)
          setStatus(stored ? 'authenticated' : 'unauthenticated')
        }
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AppPortalUser> => {
      if (USE_REAL_API) {
        // Real path: POST /api/auth/sign-in
        const data = await signInRequest(apiClient, email, password)
        setTokens(data.access_token, data.refresh_token)
        const resolved = mapAuthUser(data.user)
        setUser(resolved)
        setStatus('authenticated')
        return resolved
      }

      // Mock path (dev without backend)
      const resolved = MOCK_CREDENTIALS[email.toLowerCase().trim()]
      if (!resolved) {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.')
      }
      writeStoredSession(resolved)
      setUser(resolved)
      setStatus('authenticated')
      return resolved
    },
    [],
  )

  const signOut = useCallback((): void => {
    if (USE_REAL_API) {
      // Fire-and-forget — don't block the UI on network
      const rt = getRefreshToken()
      if (rt) {
        void signOutRequest(apiClient, rt).catch(() => {
          // server-side invalidation is best-effort
        })
      }
      clearTokens()
    } else {
      deleteStoredSession()
    }
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession() precisa estar dentro de <SessionProvider />')
  }
  return ctx
}

// ─── Helpers role ↔ path ─────────────────────────────────────────────────────

export function getBasePathByRole(role: AppPortalRole): string {
  const map: Record<AppPortalRole, string> = {
    admin: '/admin',
    cooperative: '/cooperative',
    driver: '/driver',
  }
  return map[role]
}

export function getRoleFromPath(pathname: string): AppPortalRole | null {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/cooperative')) return 'cooperative'
  if (pathname.startsWith('/driver')) return 'driver'
  return null
}
