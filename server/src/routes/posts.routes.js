import { Router } from 'express'
import { pool } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

const router = Router()

function toPost(row) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    content: row.content,
    author: row.author,
    createdAt: row.created_at,
  }
}

function createPostId() {
  return `post-${Date.now()}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM posts ORDER BY created_at DESC')
  res.json(rows.map(toPost))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id])
  if (!rows[0]) {
    return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' })
  }
  res.json(toPost(rows[0]))
}))

router.post('/', asyncHandler(async (req, res) => {
  const { category, title, author, content } = req.body ?? {}
  if (!category || !title || !author || !content) {
    return res.status(400).json({ message: '카테고리, 제목, 작성자, 내용을 모두 입력해 주세요.' })
  }

  const post = { id: createPostId(), category, title, author, content, createdAt: today() }
  await pool.query(
    'INSERT INTO posts (id, category, title, content, author, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [post.id, post.category, post.title, post.content, post.author, post.createdAt],
  )
  res.status(201).json(post)
}))

router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const { category, title, author, content } = req.body ?? {}

  const fields = []
  const values = []
  if (category !== undefined) { fields.push('category = ?'); values.push(category) }
  if (title !== undefined) { fields.push('title = ?'); values.push(title) }
  if (author !== undefined) { fields.push('author = ?'); values.push(author) }
  if (content !== undefined) { fields.push('content = ?'); values.push(content) }

  if (fields.length > 0) {
    await pool.query(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`, [...values, id])
  }

  const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [id])
  if (!rows[0]) {
    return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' })
  }
  res.json(toPost(rows[0]))
}))

router.delete('/:id', asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id])
  res.status(204).send()
}))

export default router
