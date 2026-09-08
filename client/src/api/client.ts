import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken, clearAccessToken } from './authToken'
import { emitSessionExpired } from './authEvents'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

/** 새 리소스를 추가할 때 이 인스턴스로 `apiClient.get/post/patch/delete`를 그대로 사용하세요. */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  // refresh token(httpOnly 쿠키)을 주고받으려면 항상 자격 증명을 포함해야 합니다.
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshInFlight: Promise<boolean> | null = null

/**
 * access token(메모리)이 만료됐을 때 refresh 쿠키로 새 access token을 발급받습니다.
 * 동시에 여러 요청이 401을 받아도 실제 refresh 요청은 한 번만 나갑니다.
 */
export function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function performRefresh(): Promise<boolean> {
  try {
    const response = await apiClient.post<{ accessToken: string }>('/auth/refresh')
    setAccessToken(response.data.accessToken)
    return true
  } catch {
    return false
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const config = error.config as RetryableConfig | undefined

    // access token 만료(401)면 refresh 후 한 번만 원래 요청을 재시도합니다.
    // /auth/* 요청 자체는 재시도 대상에서 제외해 무한 루프를 막습니다.
    if (
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !config.url?.startsWith('/auth/')
    ) {
      config._retry = true
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return apiClient(config)
      }

      clearAccessToken()
      emitSessionExpired()
      throw new ApiError('세션이 만료되었습니다. 다시 로그인해 주세요.', 401)
    }

    const message = error.response?.data?.message ?? '요청을 처리하지 못했습니다.'
    throw new ApiError(message, error.response?.status ?? 0)
  },
)

export function mockDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
