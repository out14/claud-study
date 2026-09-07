import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

const router = Router()

function toInquiry(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productThumbnailUrl: row.thumbnail_url ?? undefined,
    author: row.author,
    isSecret: Boolean(row.is_secret),
    content: row.content,
    answerContent: row.answer_content,
    createdAt: row.created_at,
    answeredAt: row.answered_at,
  }
}

const SELECT_WITH_PRODUCT = `
  SELECT inquiries.*, products.name AS product_name, products.thumbnail_url
  FROM inquiries
  JOIN products ON products.id = inquiries.product_id
`

function today() {
  return new Date().toISOString().slice(0, 10)
}

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`${SELECT_WITH_PRODUCT} ORDER BY inquiries.created_at DESC`)
  res.json(rows.map(toInquiry))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_WITH_PRODUCT} WHERE inquiries.id = ?`, [req.params.id])
  if (!rows[0]) {
    return res.status(404).json({ message: '문의를 찾을 수 없습니다.' })
  }
  res.json(toInquiry(rows[0]))
}))

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { answerContent } = req.body ?? {}

  if (answerContent !== undefined) {
    const answeredAt = answerContent ? today() : null
    await pool.query(
      'UPDATE inquiries SET answer_content = ?, answered_at = ? WHERE id = ?',
      [answerContent, answeredAt, id],
    )
  }

  const [rows] = await pool.query(`${SELECT_WITH_PRODUCT} WHERE inquiries.id = ?`, [id])
  if (!rows[0]) {
    return res.status(404).json({ message: '문의를 찾을 수 없습니다.' })
  }
  res.json(toInquiry(rows[0]))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM inquiries WHERE id = ?', [req.params.id])
  res.status(204).send()
}))

export default router
