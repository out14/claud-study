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

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  json?: unknown
}

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
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) return false

    const data = (await response.json()) as { accessToken: string }
    setAccessToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
  _isRetry = false,
): Promise<T> {
  const { json, headers, ...rest } = options
  const accessToken = getAccessToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    // refresh token(httpOnly 쿠키)을 주고받으려면 항상 자격 증명을 포함해야 합니다.
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })

  // access token 만료(401)면 refresh 후 한 번만 원래 요청을 재시도합니다.
  // /auth/* 요청 자체는 재시도 대상에서 제외해 무한 루프를 막습니다.
  if (response.status === 401 && !_isRetry && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return apiFetch<T>(path, options, true)
    }

    clearAccessToken()
    emitSessionExpired()
    throw new ApiError('세션이 만료되었습니다. 다시 로그인해 주세요.', 401)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(body?.message ?? '요청을 처리하지 못했습니다.', response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function mockDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
