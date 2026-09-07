import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_PATH,
  refreshTokenCookieOptions,
} from '../auth/tokens.js'

const router = Router()

async function issueTokens(user) {
  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)
  await pool.query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [
    hashRefreshToken(refreshToken),
    user.id,
  ])
  return { accessToken, refreshToken }
}

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {}

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해 주세요.' })
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  const user = rows[0]

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
  }

  const { accessToken, refreshToken } = await issueTokens(user)
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions())
  res.json({ accessToken, user: { email: user.email } })
}))

// access token(메모리 보관, 수명 짧음)이 만료되면 클라이언트가 이 엔드포인트를 호출합니다.
// refresh token은 httpOnly 쿠키로만 전달되므로 여기서는 요청 바디가 필요 없습니다.
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE]

  if (!token) {
    return res.status(401).json({ message: 'refresh 토큰이 없습니다.' })
  }

  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_TOKEN_COOKIE_PATH })
    return res.status(401).json({ message: 'refresh 토큰이 만료되었거나 유효하지 않습니다.' })
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [payload.sub])
  const user = rows[0]

  // DB에 저장된 해시와 다르면 이미 로그아웃되었거나 탈취된 토큰이 재사용된 경우입니다.
  if (!user || user.refresh_token_hash !== hashRefreshToken(token)) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_TOKEN_COOKIE_PATH })
    return res.status(401).json({ message: 'refresh 토큰이 유효하지 않습니다.' })
  }

  // 재사용 공격을 막기 위해 refresh 시마다 refresh token도 새로 발급합니다(rotation).
  const { accessToken, refreshToken } = await issueTokens(user)
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshTokenCookieOptions())
  res.json({ accessToken })
}))

router.post('/logout', asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_TOKEN_COOKIE]

  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await pool.query('UPDATE users SET refresh_token_hash = NULL WHERE id = ?', [payload.sub])
    } catch {
      // 토큰이 이미 만료/변조된 경우에도 쿠키만 지우면 됩니다.
    }
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: REFRESH_TOKEN_COOKIE_PATH })
  res.status(204).send()
}))

export default router
