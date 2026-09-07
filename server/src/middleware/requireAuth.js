import { verifyAccessToken } from '../auth/tokens.js'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) {
    return res.status(401).json({ message: '인증이 필요합니다.' })
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    res.status(401).json({ message: '토큰이 만료되었거나 유효하지 않습니다.' })
  }
}
