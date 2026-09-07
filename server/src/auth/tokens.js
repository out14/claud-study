import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET ?? 'change-me-in-production'
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ?? 'change-me-refresh-in-production'

const ACCESS_TOKEN_TTL_SEC = Number(process.env.ACCESS_TOKEN_TTL_SEC ?? 15 * 60)
const REFRESH_TOKEN_TTL_MS = Number(process.env.REFRESH_TOKEN_TTL_MS ?? 7 * 24 * 60 * 60 * 1000)

export const REFRESH_TOKEN_COOKIE = 'refreshToken'
export const REFRESH_TOKEN_COOKIE_PATH = '/api/auth'

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL_SEC,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET)
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_TOKEN_SECRET, {
    expiresIn: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
  })
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET)
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function refreshTokenCookieOptions() {
  return {
    httpOnly: true,
    // 로컬 개발(http://localhost)은 HTTPS가 아니므로 secure는 프로덕션에서만 켭니다.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: REFRESH_TOKEN_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_MS,
  }
}
