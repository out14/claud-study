import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const DB_NAME = process.env.DB_NAME ?? 'claude_study'
const DEFAULT_PASSWORD = 'password123'

// client/src/features/users/mockUsers.ts 의 INITIAL_USERS 를 그대로 옮긴 데이터
const USERS = [
  { id: 'usr-00', name: '테스트 사용자', email: 'test@example.com', role: 'admin', status: 'active', joinedAt: '2024-01-01' },
  { id: 'usr-01', name: '김민준', email: 'minjun.kim@example.com', role: 'admin', status: 'active', joinedAt: '2023-02-14' },
  { id: 'usr-02', name: '이서연', email: 'seoyeon.lee@example.com', role: 'member', status: 'active', joinedAt: '2023-05-03' },
  { id: 'usr-03', name: '박도윤', email: 'doyoon.park@example.com', role: 'member', status: 'inactive', joinedAt: '2024-01-22' },
  { id: 'usr-04', name: '최지우', email: 'jiwoo.choi@example.com', role: 'member', status: 'active', joinedAt: '2024-06-11' },
  { id: 'usr-05', name: '정하은', email: 'haeun.jung@example.com', role: 'admin', status: 'active', joinedAt: '2022-11-30' },
]

// client/src/features/posts/mockPosts.ts 의 INITIAL_POSTS 를 그대로 옮긴 데이터
const POSTS = [
  { id: 'post-01', category: 'news', title: '9월 서버 정기 점검 안내', content: '9월 15일 새벽 2시부터 4시까지 정기 점검이 진행됩니다. 점검 시간 동안 서비스 이용이 제한됩니다.', author: '김민준', createdAt: '2026-09-01' },
  { id: 'post-02', category: 'chat', title: '오늘 날씨 진짜 좋네요', content: '다들 점심시간에 산책 한번 다녀오세요. 날씨가 너무 좋습니다.', author: '이서연', createdAt: '2026-09-03' },
  { id: 'post-03', category: 'promo', title: '신규 가입 이벤트 - 최대 50% 할인', content: '이번 달 신규 가입자 대상으로 첫 결제 50% 할인 쿠폰을 드립니다.', author: '운영팀', createdAt: '2026-08-28' },
  { id: 'post-04', category: 'news', title: 'API v2 배포 완료', content: '새로운 API v2가 배포되었습니다. 기존 v1은 3개월 후 종료될 예정입니다.', author: '박도윤', createdAt: '2026-08-20' },
  { id: 'post-05', category: 'chat', title: '점심 메뉴 추천 받습니다', content: '회사 근처에 새로 생긴 식당 아시는 분 있나요? 추천 부탁드려요.', author: '최지우', createdAt: '2026-09-05' },
  { id: 'post-06', category: 'promo', title: '연간 구독 플랜 오픈', content: '연간 구독 시 2개월 무료 혜택을 드립니다. 지금 바로 확인해보세요.', author: '운영팀', createdAt: '2026-09-06' },
  { id: 'post-07', category: 'news', title: '장애 복구 안내', content: '오전 발생했던 로그인 지연 문제가 복구되었습니다. 이용에 불편을 드려 죄송합니다.', author: '정하은', createdAt: '2026-08-15' },
]

// client/src/features/products/mockProducts.ts 의 INITIAL_PRODUCTS 를 그대로 옮긴 데이터
const PRODUCTS = [
  {
    id: 'prod-01',
    name: '순창 재래식 된장',
    origin: '국내산 (전북 순창)',
    description: '3년간 전통 방식으로 숙성한 재래식 된장입니다. 국산 콩만 사용했습니다.',
    manufacturedAt: '2026-06-01',
    expiresAt: '2027-06-01',
    price1: 12000,
    price10: 110000,
    price50: 520000,
    price100: 980000,
  },
  {
    id: 'prod-02',
    name: '남해 멸치액젓',
    origin: '국내산 (경남 남해)',
    description: '남해 청정 바다에서 잡은 멸치로 담근 전통 액젓입니다.',
    manufacturedAt: '2026-04-15',
    expiresAt: '2027-04-15',
    price1: 15000,
    price10: 140000,
    price50: 650000,
    price100: 1200000,
  },
  {
    id: 'prod-03',
    name: '유기농 현미',
    origin: '국내산 (강원 철원)',
    description: '무농약 인증을 받은 유기농 현미입니다. 매일 도정하여 신선하게 배송합니다.',
    manufacturedAt: '2026-08-20',
    expiresAt: '2027-02-20',
    price1: 8000,
    price10: 75000,
    price50: 350000,
    price100: 650000,
  },
  {
    id: 'prod-04',
    name: '제주 감귤칩',
    origin: '국내산 (제주)',
    description: '제주산 감귤을 얇게 썰어 저온에서 건조한 과일칩입니다.',
    manufacturedAt: '2026-07-10',
    expiresAt: '2026-12-10',
    price1: 6000,
    price10: 55000,
    price50: 260000,
    price100: 480000,
    visibility: 'hidden',
  },
  {
    id: 'prod-05',
    name: '강원도 황태채',
    origin: '국내산 (강원 인제)',
    description: '자연 건조로 만든 황태를 결대로 찢은 황태채입니다. 국물 요리에 좋습니다.',
    manufacturedAt: '2026-02-01',
    expiresAt: '2027-02-01',
    price1: 18000,
    price10: 170000,
    price50: 800000,
    price100: 1500000,
  },
]

// client/src/features/reviews/mockReviews.ts 의 INITIAL_REVIEWS 를 그대로 옮긴 데이터
const REVIEWS = [
  { id: 'rev-01', productId: 'prod-01', author: '이서연', rating: 5, content: '집에서 만든 것처럼 구수하고 맛있어요.', status: 'visible', createdAt: '2026-08-01' },
  { id: 'rev-02', productId: 'prod-01', author: '박도윤', rating: 4, content: '짜지 않고 딱 좋아요. 재구매 의사 있습니다.', status: 'visible', createdAt: '2026-08-05' },
  { id: 'rev-03', productId: 'prod-01', author: '최지우', rating: 2, content: '기대보다 향이 약했어요.', status: 'hidden', createdAt: '2026-08-10' },
  { id: 'rev-04', productId: 'prod-02', author: '정하은', rating: 5, content: '액젓 향이 깊고 좋습니다.', status: 'visible', createdAt: '2026-07-20' },
  { id: 'rev-05', productId: 'prod-03', author: '김민준', rating: 5, content: '밥맛이 확실히 다르네요.', status: 'visible', createdAt: '2026-09-01' },
  { id: 'rev-06', productId: 'prod-03', author: '이서연', rating: 3, content: '배송이 조금 늦었어요.', status: 'visible', createdAt: '2026-09-03' },
  { id: 'rev-07', productId: 'prod-04', author: '박도윤', rating: 4, content: '아이 간식으로 딱이에요.', status: 'visible', createdAt: '2026-07-25' },
]

// client/src/features/inquiries/mockInquiries.ts 의 INITIAL_INQUIRIES 를 그대로 옮긴 데이터
const INQUIRIES = [
  { id: 'inq-01', productId: 'prod-01', author: '김지훈', isSecret: false, content: '된장 유통기한이 얼마나 되나요?', answerContent: '구매일로부터 1년입니다. 서늘한 곳에 보관해 주세요.', createdAt: '2026-08-02', answeredAt: '2026-08-03' },
  { id: 'inq-02', productId: 'prod-01', author: '오세훈', isSecret: true, content: '배송 중 파손된 것 같은데 환불 가능한가요?', answerContent: null, createdAt: '2026-08-15', answeredAt: null },
  { id: 'inq-03', productId: 'prod-03', author: '한지민', isSecret: false, content: '현미 도정일자를 알 수 있을까요?', answerContent: '매주 화/금요일에 도정하여 발송합니다.', createdAt: '2026-09-02', answeredAt: '2026-09-02' },
  { id: 'inq-04', productId: 'prod-04', author: '윤아름', isSecret: false, content: '알레르기 유발 성분이 포함되어 있나요?', answerContent: null, createdAt: '2026-09-10', answeredAt: null },
  { id: 'inq-05', productId: 'prod-02', author: '조현우', isSecret: true, content: '대량 구매 시 추가 할인이 가능한가요?', answerContent: null, createdAt: '2026-09-12', answeredAt: null },
]

async function ensureColumn(connection, dbName, table, column, definition) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [dbName, table, column],
  )
  if (rows[0].cnt === 0) {
    console.log(`Adding column ${table}.${column}...`)
    await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
  }
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    multipleStatements: true,
  })

  console.log(`Creating database \`${DB_NAME}\` if it does not exist...`)
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  )
  await connection.query(`USE \`${DB_NAME}\``)

  console.log('Creating tables...')
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(20) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      joined_at DATE NOT NULL,
      avatar_url LONGTEXT NULL,
      refresh_token_hash VARCHAR(255) NULL
    ) ENGINE=InnoDB
  `)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(30) PRIMARY KEY,
      category ENUM('news', 'chat', 'promo') NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(100) NOT NULL,
      created_at DATE NOT NULL
    ) ENGINE=InnoDB
  `)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(30) PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      thumbnail_url LONGTEXT NULL,
      detail_image_urls LONGTEXT NULL,
      origin VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      manufactured_at DATE NOT NULL,
      expires_at DATE NOT NULL,
      price_1 INT UNSIGNED NOT NULL,
      price_10 INT UNSIGNED NOT NULL,
      price_50 INT UNSIGNED NOT NULL,
      price_100 INT UNSIGNED NOT NULL,
      visibility ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
      created_at DATE NOT NULL
    ) ENGINE=InnoDB
  `)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(30) PRIMARY KEY,
      product_id VARCHAR(30) NOT NULL,
      author VARCHAR(100) NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      status ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
      created_at DATE NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id VARCHAR(30) PRIMARY KEY,
      product_id VARCHAR(30) NOT NULL,
      author VARCHAR(100) NOT NULL,
      is_secret TINYINT(1) NOT NULL DEFAULT 0,
      content TEXT NOT NULL,
      answer_content TEXT NULL,
      created_at DATE NOT NULL,
      answered_at DATE NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `)

  // 기존에 만들어둔 DB(위 CREATE TABLE이 스킵됨)에는 컬럼이 없을 수 있으므로 별도로 보강합니다.
  await ensureColumn(connection, DB_NAME, 'users', 'refresh_token_hash', 'VARCHAR(255) NULL')
  await ensureColumn(
    connection, DB_NAME, 'products', 'visibility',
    "ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible'",
  )
  // avatar_url이 TEXT(약 64KB 한도)로 만들어진 기존 DB는 프로필 사진(base64) 저장 시 500 에러가 나므로
  // products.thumbnail_url과 동일하게 LONGTEXT로 넓혀줍니다. 이미 LONGTEXT면 아무 효과 없이 안전합니다.
  await connection.query('ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT NULL')

  console.log(`Seeding users (default password: "${DEFAULT_PASSWORD}")...`)
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  for (const user of USERS) {
    await connection.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, joined_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), email = VALUES(email), role = VALUES(role),
         status = VALUES(status), joined_at = VALUES(joined_at)`,
      [user.id, user.name, user.email, passwordHash, user.role, user.status, user.joinedAt],
    )
  }

  console.log('Seeding posts...')
  for (const post of POSTS) {
    await connection.query(
      `INSERT INTO posts (id, category, title, content, author, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         category = VALUES(category), title = VALUES(title), content = VALUES(content),
         author = VALUES(author), created_at = VALUES(created_at)`,
      [post.id, post.category, post.title, post.content, post.author, post.createdAt],
    )
  }

  console.log('Seeding products...')
  for (const product of PRODUCTS) {
    await connection.query(
      `INSERT INTO products
         (id, name, origin, description, manufactured_at, expires_at, price_1, price_10, price_50, price_100, visibility, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), origin = VALUES(origin), description = VALUES(description),
         manufactured_at = VALUES(manufactured_at), expires_at = VALUES(expires_at),
         price_1 = VALUES(price_1), price_10 = VALUES(price_10),
         price_50 = VALUES(price_50), price_100 = VALUES(price_100),
         visibility = VALUES(visibility)`,
      [
        product.id, product.name, product.origin, product.description,
        product.manufacturedAt, product.expiresAt,
        product.price1, product.price10, product.price50, product.price100,
        product.visibility ?? 'visible',
        product.manufacturedAt,
      ],
    )
  }

  console.log('Seeding reviews...')
  for (const review of REVIEWS) {
    await connection.query(
      `INSERT INTO reviews (id, product_id, author, rating, content, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         author = VALUES(author), rating = VALUES(rating), content = VALUES(content),
         status = VALUES(status), created_at = VALUES(created_at)`,
      [review.id, review.productId, review.author, review.rating, review.content, review.status, review.createdAt],
    )
  }

  console.log('Seeding inquiries...')
  for (const inquiry of INQUIRIES) {
    await connection.query(
      `INSERT INTO inquiries (id, product_id, author, is_secret, content, answer_content, created_at, answered_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         author = VALUES(author), is_secret = VALUES(is_secret), content = VALUES(content),
         answer_content = VALUES(answer_content), created_at = VALUES(created_at), answered_at = VALUES(answered_at)`,
      [
        inquiry.id, inquiry.productId, inquiry.author, inquiry.isSecret ? 1 : 0,
        inquiry.content, inquiry.answerContent, inquiry.createdAt, inquiry.answeredAt,
      ],
    )
  }

  await connection.end()
  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
