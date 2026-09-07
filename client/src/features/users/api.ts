import { apiFetch, mockDelay, USE_MOCK_API } from '@src/api/client'
import { INITIAL_USERS } from './mockUsers'
import type { AppUser } from './types'

let mockUsers = INITIAL_USERS.map((user) => ({ ...user }))

async function getUsersMock(): Promise<AppUser[]> {
  await mockDelay()
  return mockUsers.map((user) => ({ ...user }))
}

async function updateUserMock(id: string, updates: Partial<AppUser>): Promise<AppUser> {
  await mockDelay()
  mockUsers = mockUsers.map((user) => (user.id === id ? { ...user, ...updates } : user))

  const updated = mockUsers.find((user) => user.id === id)
  if (!updated) throw new Error('사용자를 찾을 수 없습니다.')
  return updated
}

function getUsersRequest(): Promise<AppUser[]> {
  return apiFetch<AppUser[]>('/users')
}

function updateUserRequest(id: string, updates: Partial<AppUser>): Promise<AppUser> {
  return apiFetch<AppUser>(`/users/${id}`, { method: 'PATCH', json: updates })
}

export function getUsers(): Promise<AppUser[]> {
  return USE_MOCK_API ? getUsersMock() : getUsersRequest()
}

export function updateUser(id: string, updates: Partial<AppUser>): Promise<AppUser> {
  return USE_MOCK_API ? updateUserMock(id, updates) : updateUserRequest(id, updates)
}
