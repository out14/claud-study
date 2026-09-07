import mysql from 'mysql2/promise'
import 'dotenv/config'

const DB_NAME = process.env.DB_NAME ?? 'claude_study'

const DUMMY_POSTS = [
  { id: 'post-d01', category: 'news', title: '10월 신규 기능 업데이트 안내', content: '10월 중 대시보드 UI 개편과 알림 기능이 추가될 예정입니다.', author: '박도윤', createdAt: '2026-09-08' },
  { id: 'post-d02', category: 'chat', title: '사내 동호회 모집합니다', content: '주 1회 저녁에 모이는 러닝 동호회원을 모집하고 있어요. 관심 있으신 분은 댓글 남겨주세요.', author: '최지우', createdAt: '2026-09-09' },
  { id: 'post-d03', category: 'promo', title: '블랙프라이데이 사전 알림 신청', content: '11월 블랙프라이데이 특가 알림을 미리 신청하시면 추가 쿠폰을 드립니다.', author: '운영팀', createdAt: '2026-09-10' },
  { id: 'post-d04', category: 'news', title: '보안 정책 변경 공지', content: '다음 주부터 2단계 인증이 의무화됩니다. 사전에 인증 앱을 등록해 주세요.', author: '정하은', createdAt: '2026-09-11' },
  { id: 'post-d05', category: 'chat', title: '사무실 커피머신 고장', content: '3층 커피머신이 고장났습니다. 수리 기사님이 내일 방문 예정입니다.', author: '이서연', createdAt: '2026-09-12' },
  { id: 'post-d06', category: 'promo', title: '추천인 이벤트 안내', content: '친구를 추천하면 추천인과 신규 가입자 모두에게 1만 포인트를 드립니다.', author: '운영팀', createdAt: '2026-09-13' },
  { id: 'post-d07', category: 'news', title: '모바일 앱 v3.2 출시', content: '다크 모드와 오프라인 캐싱을 지원하는 v3.2가 출시되었습니다.', author: '김민준', createdAt: '2026-09-14' },
  { id: 'post-d08', category: 'chat', title: '주차장 공사 안내', content: '이번 주말 지하 주차장 도색 공사로 일부 구역 이용이 제한됩니다.', author: '박도윤', createdAt: '2026-09-15' },
  { id: 'post-d09', category: 'promo', title: '연말 감사 이벤트', content: '연말을 맞아 전 상품 최대 30% 할인 이벤트를 진행합니다.', author: '운영팀', createdAt: '2026-09-16' },
  { id: 'post-d10', category: 'news', title: '고객센터 운영시간 변경', content: '다음 달부터 고객센터 운영시간이 평일 오전 9시~오후 7시로 변경됩니다.', author: '정하은', createdAt: '2026-09-17' },
]

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: DB_NAME,
  })

  console.log(`Inserting ${DUMMY_POSTS.length} dummy posts into \`${DB_NAME}\`.posts...`)
  for (const post of DUMMY_POSTS) {
    await connection.query(
      `INSERT INTO posts (id, category, title, content, author, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         category = VALUES(category), title = VALUES(title), content = VALUES(content),
         author = VALUES(author), created_at = VALUES(created_at)`,
      [post.id, post.category, post.title, post.content, post.author, post.createdAt],
    )
  }

  await connection.end()
  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
