/**
 * http-client.ts
 *
 * Singleton axios instance for all authenticated API calls.
 *
 * Request interceptor  — injects `Authorization: Bearer <access_token>`
 * Response interceptor — on 401, attempts one silent token refresh then
 *                        retries the original request. If refresh fails,
 *                        clears all tokens and reloads to /sign-in.
 *
 * Usage:
 *   import { apiClient } from '@/lib/api/http-client'
 *   const { data } = await apiClient.get('/api/admin/routes')
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

import { env } from '@/env'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth/token-store'

import { refreshRequest } from './auth-api'

// ─── Base instance ────────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ─── Request interceptor — attach Bearer token ────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor — silent refresh on 401 ────────────────────────────

/** Tracks whether a refresh is already in-flight to avoid cascading retries. */
let isRefreshing = false
/** Queue of callbacks waiting for the new token. */
let pendingQueue: Array<(token: string) => void> = []

function drainQueue(token: string): void {
  pendingQueue.forEach((cb) => cb(token))
  pendingQueue = []
}

function flushQueue(): void {
  pendingQueue = []
}

/** Extended config that marks a request as already retried. */
interface RetryConfig extends AxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config as RetryConfig | undefined

    // Only attempt refresh for 401 errors on requests that haven't been retried yet.
    if (error.response?.status !== 401 || !originalConfig || originalConfig._retried) {
      return Promise.reject(error)
    }

    originalConfig._retried = true

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      window.location.replace('/sign-in')
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Another refresh is in-flight — queue this request until it resolves.
      return new Promise<unknown>((resolve, _reject) => {
        pendingQueue.push((newToken) => {
          if (originalConfig.headers) {
            originalConfig.headers['Authorization'] = `Bearer ${newToken}`
          }
          resolve(apiClient(originalConfig))
        })
      })
    }

    isRefreshing = true

    try {
      // Use a plain axios call (not apiClient) to avoid interceptor loops.
      const data = await refreshRequest(
        axios.create({ baseURL: env.VITE_API_URL ?? '', timeout: 10_000 }),
        refreshToken,
      )
      setTokens(data.access_token, data.refresh_token)
      drainQueue(data.access_token)

      if (originalConfig.headers) {
        originalConfig.headers['Authorization'] = `Bearer ${data.access_token}`
      }
      return apiClient(originalConfig)
    } catch (refreshError) {
      flushQueue()
      clearTokens()
      window.location.replace('/sign-in')
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
