import { MOCK_ROUTES } from '@/lib/data/mock-routes'
import {
  MOCK_COOPERATIVES,
  MOCK_USERS,
  type User,
} from '@/lib/data/mock-users'
import type {
  CreateUserInput,
  ListUsersFilter,
  UpdateUserStatusInput,
} from '@/lib/schemas/user-schema'

export interface ListUsersResponse {
  data: User[]
  total: number
  page: number
  pageSize: number
}

export interface ScheduleByRoute {
  routeId: string
  routeName: string
  origin: string
  destination: string
  schedules: Array<{
    id: string
    dayOfWeek: string
    departureTime: string
    status: 'active' | 'cancelled' | 'suspended'
  }>
}

export interface GetDriverSchedulesResponse {
  driverId: string
  driverName: string
  cooperativeName: string
  schedulesByRoute: ScheduleByRoute[]
  total: number
}

// Simulate API delay
const API_DELAY = 300

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockUsersApi = {
  async listUsers(
    filters: ListUsersFilter,
    _loggedInUserId?: string,
    loggedInRole?: 'admin' | 'cooperative',
    loggedInCooperativeId?: string,
  ): Promise<ListUsersResponse> {
    await delay(API_DELAY)

    let filtered = [...MOCK_USERS]

    // Filter by logged-in role visibility
    if (loggedInRole === 'cooperative' && loggedInCooperativeId) {
      // Cooperativa role can only see users of their own cooperative
      filtered = filtered.filter(
        (user) =>
          user.cooperativeId === loggedInCooperativeId ||
          user.role === 'cooperative',
      )
    }

    // Apply filters
    if (filters.search) {
      const query = filters.search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query),
      )
    }

    if (filters.role) {
      filtered = filtered.filter((user) => user.role === filters.role)
    }

    if (filters.cooperativeId) {
      filtered = filtered.filter(
        (user) => user.cooperativeId === filters.cooperativeId,
      )
    }

    if (filters.status) {
      filtered = filtered.filter((user) => user.status === filters.status)
    }

    // Pagination
    const total = filtered.length
    const page = filters.page ?? 1
    const pageSize = filters.pageSize ?? 10
    const start = (page - 1) * pageSize
    const data = filtered.slice(start, start + pageSize)

    return {
      data,
      total,
      page,
      pageSize,
    }
  },

  async createUser(payload: CreateUserInput): Promise<User> {
    await delay(API_DELAY)

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      cooperativeId: payload.cooperativeId || null,
      status: 'active',
      phone: undefined,
      createdAt: new Date().toISOString(),
    }

    // In a real app, this would persist to backend
    MOCK_USERS.push(newUser)

    return newUser
  },

  async toggleUserStatus(
    payload: UpdateUserStatusInput,
  ): Promise<User | null> {
    await delay(API_DELAY)

    const user = MOCK_USERS.find((u) => u.id === payload.userId)
    if (!user) return null

    user.status = payload.newStatus
    return user
  },

  async getDriverSchedules(
    driverId: string,
  ): Promise<GetDriverSchedulesResponse> {
    await delay(API_DELAY)

    const driver = MOCK_USERS.find((u) => u.id === driverId && u.role === 'driver')
    if (!driver) {
      throw new Error('Driver not found')
    }

    const cooperative = MOCK_COOPERATIVES.find(
      (c) => c.id === driver.cooperativeId,
    )
    if (!cooperative) {
      throw new Error('Cooperative not found')
    }

    // Find routes where this driver is assigned
    const driverRoutes = MOCK_ROUTES.filter(
      (route) => route.driver_id === driverId,
    )

    // Group schedules by route (mock data - simplified)
    const schedulesByRoute: ScheduleByRoute[] = driverRoutes.map((route, idx) => {
      const dayLabels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      const startHour = 6 + (idx * 2)
      const times = [
        { day: dayLabels[0], time: `${startHour}:00` },
        { day: dayLabels[2], time: `${startHour + 2}:30` },
        { day: dayLabels[4], time: `${startHour + 1}:15` },
      ]

      return {
        routeId: route.id,
        routeName: route.name,
        origin: route.origin,
        destination: route.destination,
        schedules: times.map((t, i) => ({
          id: `schedule-${route.id}-${i}`,
          dayOfWeek: t.day,
          departureTime: t.time,
          status: 'active' as const,
        })),
      }
    })

    return {
      driverId,
      driverName: driver.name,
      cooperativeName: cooperative.name,
      schedulesByRoute,
      total: schedulesByRoute.reduce((sum, r) => sum + r.schedules.length, 0),
    }
  },

  async getUser(userId: string): Promise<User | null> {
    await delay(API_DELAY)
    return MOCK_USERS.find((u) => u.id === userId) ?? null
  },
}
