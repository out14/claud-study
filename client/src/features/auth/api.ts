import { apiClient, mockDelay, USE_MOCK_API } from '@src/api/client'
import type { LoginCredentials, LoginResult } from './types'

const MOCK_USER: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123',
}

async function loginMock(credentials: LoginCredentials): Promise<LoginResult> {
  await mockDelay(600)

  if (
    credentials.email !== MOCK_USER.email ||
    credentials.password !== MOCK_USER.password
  ) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.')
  }

  return {
    accessToken: 'mock-access-token',
    user: { email: credentials.email },
  }
}

async function loginRequest(credentials: LoginCredentials): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginResult>('/auth/login', credentials)
  return data
}

export function login(credentials: LoginCredentials): Promise<LoginResult> {
  return USE_MOCK_API ? loginMock(credentials) : loginRequest(credentials)
}

async function logoutMock(): Promise<void> {
  await mockDelay(200)
}

async function logoutRequest(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export function logout(): Promise<void> {
  return USE_MOCK_API ? logoutMock() : logoutRequest()
}
