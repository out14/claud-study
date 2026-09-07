import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

const router = Router()

function toAppUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    avatarUrl: row.avatar_url ?? undefined,
  }
}

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY joined_at ASC')
  res.json(rows.map(toAppUser))
}))

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, email, role, status, avatarUrl } = req.body ?? {}

  const fields = []
  const values = []
  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (email !== undefined) { fields.push('email = ?'); values.push(email) }
  if (role !== undefined) { fields.push('role = ?'); values.push(role) }
  if (status !== undefined) { fields.push('status = ?'); values.push(status) }
  if (avatarUrl !== undefined) { fields.push('avatar_url = ?'); values.push(avatarUrl) }

  if (fields.length > 0) {
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...values, id])
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
  if (!rows[0]) {
    return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
  }
  res.json(toAppUser(rows[0]))
}))

export default router
