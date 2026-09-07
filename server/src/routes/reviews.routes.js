import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

const router = Router()

function toReview(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    author: row.author,
    rating: row.rating,
    content: row.content,
    status: row.status,
    createdAt: row.created_at,
  }
}

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT reviews.*, products.name AS product_name
     FROM reviews
     JOIN products ON products.id = reviews.product_id
     ORDER BY reviews.created_at DESC`,
  )
  res.json(rows.map(toReview))
}))

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body ?? {}

  if (status !== undefined) {
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id])
  }

  const [rows] = await pool.query(
    `SELECT reviews.*, products.name AS product_name
     FROM reviews
     JOIN products ON products.id = reviews.product_id
     WHERE reviews.id = ?`,
    [id],
  )
  if (!rows[0]) {
    return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' })
  }
  res.json(toReview(rows[0]))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id])
  res.status(204).send()
}))

export default router
