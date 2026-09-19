// id da cooperativa associada ao usuário mock de role 'cooperative'
export const MOCK_COOP_PORTAL_USER_ID = '11111111-1111-4111-8111-111111111111'

export interface CooperativePortalStats {
  activeRoutes: number
  totalDrivers: number
  schedulesToday: number
  onTimeRate: number // 0–1
  avgRating: number
  pendingDelays: number
  criticalDelays: number
}

export const MOCK_COOP_PORTAL_STATS: CooperativePortalStats = {
  activeRoutes: 12,
  totalDrivers: 8,
  schedulesToday: 47,
  onTimeRate: 0.91,
  avgRating: 4.4,
  pendingDelays: 3,
  criticalDelays: 1,
}

export interface CooperativeProfileData {
  id: string
  name: string
  phone: string
  site: string
  description: string
  brandColor: string
  status: 'active' | 'suspended' | 'inactive'
  createdAt: string
}

export const MOCK_COOP_PROFILE: CooperativeProfileData = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Metro Transportes',
  phone: '(85) 3234-5678',
  site: 'https://metrotransportes.com.br',
  description: 'Principal cooperativa da região metropolitana de Fortaleza.',
  brandColor: '#1A5FA8',
  status: 'active',
  createdAt: '2025-01-10T00:00:00Z',
}
