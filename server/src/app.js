import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import postsRoutes from './routes/posts.routes.js'
import productsRoutes from './routes/products.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'
import inquiriesRoutes from './routes/inquiries.routes.js'
import { requireAuth } from './middleware/requireAuth.js'

const app = express()

const allowedOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:5000')
  .split(',')
  .map((origin) => origin.trim())

app.use(
  cors({
    origin(origin, callback) {
      // origin이 없는 요청(curl, 서버 간 통신 등)은 허용합니다.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      callback(new Error(`CORS: origin '${origin}'은(는) 허용되지 않았습니다.`))
    },
    // refresh token 쿠키를 주고받으려면 자격 증명 포함 요청을 허용해야 합니다.
    credentials: true,
  }),
)
// 상품 썸네일/상세 이미지를 base64 data URL로 JSON body에 실어 보내므로 기본 100kb 제한을 늘립니다.
app.use(express.json({ limit: '15mb' }))
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/users', requireAuth, usersRoutes)
app.use('/api/posts', requireAuth, postsRoutes)
app.use('/api/products', requireAuth, productsRoutes)
app.use('/api/reviews', requireAuth, reviewsRoutes)
app.use('/api/inquiries', requireAuth, inquiriesRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

export default app
