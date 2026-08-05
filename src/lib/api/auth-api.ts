/**
 * auth-api.ts
 *
 * Pure API functions for authentication endpoints.
 * These functions receive an axios instance as a parameter so they remain
 * decoupled from the singleton http-client (avoids circular imports and
 * makes them trivially testable).
 *
 * Endpoints (api-spec.md):
 *   POST /api/auth/sign-in   → { access_token, refresh_token, user }
 *   POST /api/auth/refresh   → { access_token, refresh_token }
 *   POST /api/auth/sign-out  → 204
 *   GET  /api/auth/me        → { user }
 */

import type { AxiosInstance } from 'axios'

import type { AppPortalRole, AppPortalUser } from '@/pages/app-portal/app-portal-navigation'

// ─── Response shapes (mirror api-spec.md) ────────────────────────────────────

export interface AuthUserPayload {
  id: string
  name: string
  email: string
  role: AppPortalRole
  cooperative_id?: string
}

export interface SignInResponse {
  access_token: string
  refresh_token: string
  user: AuthUserPayload
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

/**
 * Converts the API user payload to the frontend AppPortalUser shape.
 * Centralise here so session.tsx stays clean.
 */
export function mapAuthUser(payload: AuthUserPayload): AppPortalUser {
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    ...(payload.cooperative_id ? { cooperativeId: payload.cooperative_id } : {}),
  }
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function signInRequest(
  client: AxiosInstance,
  email: string,
  password: string,
): Promise<SignInResponse> {
  const { data } = await client.post<SignInResponse>('/api/auth/sign-in', { email, password })
  return data
}

export async function refreshRequest(
  client: AxiosInstance,
  refreshToken: string,
): Promise<RefreshResponse> {
  const { data } = await client.post<RefreshResponse>('/api/auth/refresh', {
    refresh_token: refreshToken,
  })
  return data
}

export async function signOutRequest(
  client: AxiosInstance,
  refreshToken: string,
): Promise<void> {
  await client.post('/api/auth/sign-out', { refresh_token: refreshToken })
}

export async function getMeRequest(client: AxiosInstance): Promise<AppPortalUser> {
  const { data } = await client.get<{ user: AuthUserPayload }>('/api/auth/me')
  return mapAuthUser(data.user)
}
