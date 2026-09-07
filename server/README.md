# server

Express + MySQL 백엔드. `client`의 mock 데이터(유저, 게시물)를 그대로 DB로 옮겨 API로 제공합니다.

## 준비

```bash
cp .env.example .env
# .env에서 DB 접속 정보를 실제 환경에 맞게 수정하세요.

npm install
npm run db:init   # DB/테이블 생성 + mock 데이터 시드 (여러 번 실행해도 안전합니다)
npm run dev        # http://localhost:4000 에서 서버 실행
```

## 시드 계정

`db:init` 실행 시 모든 유저 계정의 비밀번호는 `password123` 으로 설정됩니다.
로그인 테스트: `test@example.com` / `password123`

## API

- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET /api/users`
- `PATCH /api/users/:id`
- `GET /api/posts`
- `GET /api/posts/:id`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
