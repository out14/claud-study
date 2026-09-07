import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

const router = Router()

function toProduct(row) {
  return {
    id: row.id,
    name: row.name,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    detailImageUrls: row.detail_image_urls ? JSON.parse(row.detail_image_urls) : [],
    origin: row.origin,
    description: row.description,
    manufacturedAt: row.manufactured_at,
    expiresAt: row.expires_at,
    price1: row.price_1,
    price10: row.price_10,
    price50: row.price_50,
    price100: row.price_100,
    visibility: row.visibility,
    createdAt: row.created_at,
  }
}

function createProductId() {
  return `prod-${Date.now()}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
  res.json(rows.map(toProduct))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!rows[0]) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' })
  }
  res.json(toProduct(rows[0]))
}))

router.post('/', asyncHandler(async (req, res) => {
  const {
    name, thumbnailUrl, detailImageUrls, origin, description,
    manufacturedAt, expiresAt, price1, price10, price50, price100, visibility,
  } = req.body ?? {}

  if (!name || !origin || !description || !manufacturedAt || !expiresAt) {
    return res.status(400).json({ message: '필수 항목을 모두 입력해 주세요.' })
  }

  const product = {
    id: createProductId(),
    name,
    thumbnailUrl: thumbnailUrl ?? null,
    detailImageUrls: detailImageUrls ?? [],
    origin,
    description,
    manufacturedAt,
    expiresAt,
    price1: Number(price1) || 0,
    price10: Number(price10) || 0,
    price50: Number(price50) || 0,
    price100: Number(price100) || 0,
    visibility: visibility === 'hidden' ? 'hidden' : 'visible',
    createdAt: today(),
  }

  await pool.query(
    `INSERT INTO products
       (id, name, thumbnail_url, detail_image_urls, origin, description, manufactured_at, expires_at, price_1, price_10, price_50, price_100, visibility, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.id, product.name, product.thumbnailUrl, JSON.stringify(product.detailImageUrls),
      product.origin, product.description, product.manufacturedAt, product.expiresAt,
      product.price1, product.price10, product.price50, product.price100,
      product.visibility, product.createdAt,
    ],
  )
  res.status(201).json(product)
}))

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    name, thumbnailUrl, detailImageUrls, origin, description,
    manufacturedAt, expiresAt, price1, price10, price50, price100, visibility,
  } = req.body ?? {}

  const fields = []
  const values = []
  if (name !== undefined) { fields.push('name = ?'); values.push(name) }
  if (thumbnailUrl !== undefined) { fields.push('thumbnail_url = ?'); values.push(thumbnailUrl) }
  if (detailImageUrls !== undefined) { fields.push('detail_image_urls = ?'); values.push(JSON.stringify(detailImageUrls)) }
  if (origin !== undefined) { fields.push('origin = ?'); values.push(origin) }
  if (description !== undefined) { fields.push('description = ?'); values.push(description) }
  if (manufacturedAt !== undefined) { fields.push('manufactured_at = ?'); values.push(manufacturedAt) }
  if (expiresAt !== undefined) { fields.push('expires_at = ?'); values.push(expiresAt) }
  if (price1 !== undefined) { fields.push('price_1 = ?'); values.push(Number(price1) || 0) }
  if (price10 !== undefined) { fields.push('price_10 = ?'); values.push(Number(price10) || 0) }
  if (price50 !== undefined) { fields.push('price_50 = ?'); values.push(Number(price50) || 0) }
  if (price100 !== undefined) { fields.push('price_100 = ?'); values.push(Number(price100) || 0) }
  if (visibility !== undefined) { fields.push('visibility = ?'); values.push(visibility === 'hidden' ? 'hidden' : 'visible') }

  if (fields.length > 0) {
    await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, [...values, id])
  }

  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id])
  if (!rows[0]) {
    return res.status(404).json({ message: '상품을 찾을 수 없습니다.' })
  }
  res.json(toProduct(rows[0]))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id])
  res.status(204).send()
}))

export default router
