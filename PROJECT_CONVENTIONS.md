# PROJECT_CONVENTIONS.md

서버 관리용 어드민 대시보드 프로토타입. `client`(React SPA)와 `server`(Express API)로 이루어진 두 개의 독립적인 npm 프로젝트입니다 (npm workspaces 아님 — 각자 `npm install` 필요).

```
.
├── API_CONVENTIONS.md      # client 데이터 레이어(api.ts/queries.ts) 작성 규칙
├── PROJECT_CONVENTIONS.md  # 이 문서
├── client/                 # React 19 + Vite SPA
└── server/                 # Express + MySQL API 서버
```

## client

### 기술 스택

- React 19 + TypeScript + Vite 8
- `react-router-dom` v7 — SPA 라우팅
- `@tanstack/react-query` v5 — 서버 상태 관리 (작성 규칙은 [API_CONVENTIONS.md](./API_CONVENTIONS.md) 참고)
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) — 유틸리티 클래스 위주, 별도 CSS 컴포넌트/라이브러리 없음
- path alias `@src/*` → `client/src/*` (`vite.config.ts` + `tsconfig.app.json` 양쪽에 정의됨)

### 폴더 구조

```
client/src/
├── api/
│   ├── client.ts          # 공통 fetch 래퍼 (apiFetch, mockDelay, USE_MOCK_API, ApiError, refreshAccessToken)
│   ├── authToken.ts       # access token 메모리 저장소 (getAccessToken/setAccessToken/clearAccessToken)
│   └── authEvents.ts      # refresh까지 실패했을 때(세션 만료) 구독하는 이벤트 버스 (onSessionExpired)
├── components/            # 여러 feature가 공유하는 순수 UI 컴포넌트
│   ├── ConfirmDialog.tsx  # 확인/취소 모달 (Esc·배경 클릭 = 취소)
│   ├── Header.tsx         # 로그인 후 상단 내비게이션 바
│   └── Pagination.tsx     # 이전/번호/다음 페이지네이션 (totalPages <= 1이면 자동 숨김)
├── features/<feature>/    # 도메인 단위 폴더: auth, users, posts, dashboard, settings, profile
│   ├── types.ts           # 도메인 타입
│   ├── api.ts             # mock/real fetch 함수 (자세한 규칙은 API_CONVENTIONS.md)
│   ├── queries.ts         # useQuery / useMutation 훅
│   └── *Page.tsx          # 라우트에 매핑되는 페이지 컴포넌트
├── App.tsx                # 라우트 정의 + 로그인 상태(user) 보관
├── main.tsx               # QueryClientProvider + BrowserRouter로 앱 마운트
└── index.css              # Tailwind 진입점 + 라이트/다크 테마 CSS 변수
```

새 도메인을 추가할 때는 `features/` 아래에 같은 4파일 구성(`types.ts`/`api.ts`/`queries.ts`/`*Page.tsx`)으로 폴더를 만듭니다.

### 라우팅 (`App.tsx`)

- 로그인 여부는 `App.tsx`의 `user` state 하나로 관리하고, `features/auth/authStorage.ts`로 `localStorage`(`auth.user` 키)에 영속화해 새로고침에도 유지됩니다. `user`는 표시용 정보(email)일 뿐이며 실제 인증은 access/refresh 토큰이 담당합니다(아래 인증 섹션 참고).
- 보호된 라우트는 별도 `ProtectedRoute` 컴포넌트 없이, 각 `<Route element={...}>`에 `user ? <Page /> : <Navigate to="/login" replace />` 패턴을 그대로 반복합니다. 새 라우트를 추가할 때도 이 패턴을 따르세요.
- 현재 라우트: `/login`, `/dashboard`, `/users`, `/users/:id`, `/posts`, `/posts/new`, `/posts/:id`, `/posts/:id/edit`, `/mypage`, `/settings`. `/`와 `*`는 로그인 여부에 따라 `/dashboard` 또는 `/login`으로 리다이렉트됩니다.
- 로그인 성공/로그아웃 시 `navigate(path, { replace: true })`로 히스토리에 흔적을 남기지 않습니다.
- 로그아웃 시 `queryClient.clear()`로 react-query 캐시를 전부 비웁니다 (계정 전환 시 이전 데이터가 남지 않도록).
- `localStorage`에 로그인 흔적(`user`)이 있는데 mock 모드가 아니면, 첫 렌더에서 `isRestoringSession`이 true가 되어 `refreshAccessToken()`으로 refresh 쿠키를 이용한 세션 복구를 한 번 시도한 뒤에만 라우트를 렌더링합니다(그동안 "세션 확인 중..." 표시). 실패하면 로그인 화면으로 돌아갑니다.

### 인증 (access token 메모리 + refresh token httpOnly 쿠키)

- **access token**: 로그인/refresh 응답 바디로만 내려오고, `api/authToken.ts` 모듈 변수(메모리)에만 저장됩니다. `localStorage`/`sessionStorage`에는 절대 저장하지 않습니다(새로고침하면 사라지는 게 의도된 동작).
- **refresh token**: 서버가 `httpOnly + SameSite=Lax` 쿠키(`refreshToken`, path `/api/auth`)로만 내려주고 클라이언트 JS는 값을 읽을 수 없습니다. `secure`는 프로덕션(HTTPS)에서만 켜집니다(`server/src/auth/tokens.js`).
- **자동 refresh + 재시도**: `api/client.ts`의 `apiFetch`가 401을 받으면(단, `/auth/*` 요청 자체는 제외) `refreshAccessToken()`을 호출해 새 access token을 받아온 뒤 원래 요청을 한 번만 재시도합니다. 동시에 여러 요청이 401을 받아도 refresh 요청은 하나로 합쳐집니다(in-flight promise 재사용).
- **세션 만료 처리**: refresh까지 실패하면 `api/authEvents.ts`의 `emitSessionExpired()`가 호출되고, `App.tsx`가 이를 구독해 로그아웃 처리(로컬 상태 정리 + `/login` 이동)를 합니다.
- **로그아웃**: `features/auth/queries.ts`의 `useLogoutMutation`(→ `POST /api/auth/logout`)으로 서버의 refresh token을 무효화한 뒤, 메모리 access token(`clearAccessToken()`)과 `localStorage`를 정리합니다.
- 서버의 `users`/`posts` 라우트는 `requireAuth` 미들웨어로 보호되어 있어 access token(`Authorization: Bearer ...`) 없이는 401을 반환합니다. 새 보호 라우트를 추가할 때도 `app.js`에서 `requireAuth`를 앞에 붙이세요.

### 데이터 레이어

- `features/<name>/{types,api,queries}.ts` 3파일 구조를 그대로 따릅니다 — 작성 규칙과 예시는 [API_CONVENTIONS.md](./API_CONVENTIONS.md)에 정리되어 있습니다.
- 페이지 컴포넌트는 `queries.ts`가 내보내는 훅을 직접 호출합니다. `App.tsx`가 데이터를 미리 받아 props로 내려주지 않습니다.
- `client/.env`의 `VITE_USE_MOCK_API` 값으로 mock ↔ 실제 서버를 전환합니다 (`true`: mock, `false`: `VITE_API_BASE_URL` 실제 호출).

### UI / 스타일 컨벤션

- Tailwind 유틸리티 클래스만 사용하고, 색상은 반드시 `index.css`에 정의된 테마 토큰(`bg`, `text`, `heading`, `border`, `accent`, `accent-bg`, `accent-border`, `danger`)만 씁니다. 라이트/다크 모드가 `prefers-color-scheme`로 자동 전환되므로 하드코딩된 hex 색상은 쓰지 않습니다.
- 반복되는 레이아웃 패턴:
  - **통계 카드**: `rounded-md border border-border p-4` 안에 라벨(`text-sm text-text`) + 값(`text-2xl font-medium text-heading`)
  - **목록 테이블**: `overflow-x-auto` 컨테이너 + `min-w-[...]` + `border-collapse text-sm`, 헤더 행은 `border-b border-border text-text`. 상태/카테고리 배지는 `rounded-full px-2.5 py-1 text-xs` + 값별 색상을 `Record<Status, string>` 상수로 매핑
  - **폼 입력**: 파일 상단에 공통 `INPUT_CLASSNAME` 문자열 상수를 만들어 재사용 (`rounded-md border border-border bg-bg px-3 py-2.5 text-heading ... focus-visible:outline-2 ...`)
  - **버튼**: 주요 액션 `bg-accent-bg text-accent`, 보조/취소 액션 `border border-border text-heading`, 위험 액션(삭제 등) `text-danger` + `hover:border-danger`
- 저장/삭제처럼 확인이 필요한 액션은 `window.confirm` 대신 공용 `<ConfirmDialog />`를 재사용합니다 (title/description/confirmLabel/cancelLabel을 상황에 맞게 props로 전달). 현재 유저 상세 수정, 마이페이지 수정, 게시물 작성/수정/삭제(단건·다건)에서 쓰입니다.
- 목록이 길어질 수 있는 화면은 공용 `<Pagination />`을 재사용합니다 (페이지당 5건 고정). 현재 유저 목록, 게시물 목록에서 쓰입니다.
- 모든 문구는 한국어이며, 라벨/상태값은 `Record<T, string>` 형태의 매핑 상수로 관리합니다.

## server

### 기술 스택

- Express 4 + `mysql2/promise`(커넥션 풀) + `bcryptjs`(비밀번호 해시) + `jsonwebtoken`(access/refresh 토큰 발급) + `cookie-parser`(refresh 쿠키 파싱)
- 라우트를 리소스별 파일로 분리(`src/routes/*.routes.js`), 비동기 에러는 `asyncHandler.js`로 감싸 `app.js`의 전역 에러 미들웨어로 전달

### 폴더 구조

```
server/src/
├── app.js               # express 앱 조립 (cors, json, cookie-parser, 라우트 마운트, 에러 핸들러)
├── index.js             # 서버 기동 (PORT 환경변수)
├── db.js                # mysql2 커넥션 풀
├── asyncHandler.js      # 비동기 라우트 핸들러의 에러를 next()로 넘기는 래퍼
├── auth/
│   └── tokens.js        # access/refresh 토큰 서명·검증, refresh 토큰 해시, 쿠키 옵션
├── middleware/
│   └── requireAuth.js   # Authorization: Bearer 헤더의 access token을 검증하는 미들웨어
├── routes/
│   ├── auth.routes.js   # POST /api/auth/{login,refresh,logout}
│   ├── users.routes.js  # GET /api/users, PATCH /api/users/:id (requireAuth로 보호)
│   └── posts.routes.js  # GET/POST /api/posts, GET/PATCH/DELETE /api/posts/:id (requireAuth로 보호)
├── schema.sql           # users/posts 테이블 정의
├── seed.js              # DB/테이블 생성 + 기본 유저·게시물 시드 + 컬럼 마이그레이션(ensureColumn)
└── seedDummyPosts.js    # 페이지네이션 테스트용 게시물 10건 추가 시드
```

### API 규칙

- 모든 라우트 핸들러는 DB row(snake_case) → 클라이언트 타입(camelCase)으로 변환하는 `toXxx()` 헬퍼(`toAppUser`, `toPost`)를 거쳐 응답합니다. 새 리소스를 추가할 때도 이 변환 헬퍼 패턴을 따르세요.
- 실패 응답은 `{ message: string }` + 적절한 status(400/401/404), 예상 못한 에러는 `app.js`의 전역 에러 미들웨어가 500으로 처리합니다.
- CORS는 `CLIENT_ORIGIN` 환경변수(콤마로 여러 origin 구분 가능)로 제한되고, refresh 쿠키를 주고받기 위해 `credentials: true`가 켜져 있습니다(와일드카드 origin과 함께 쓸 수 없음).
- `/api/users`, `/api/posts`는 `app.js`에서 `requireAuth` 미들웨어로 보호됩니다. 새 보호 리소스를 추가할 때도 `app.use('/api/xxx', requireAuth, xxxRoutes)` 패턴을 따르세요.
- **인증 방식**: 로그인 시 access token(짧은 수명, JSON 응답 바디)과 refresh token(긴 수명, `httpOnly` 쿠키)을 함께 발급합니다.
  - access token: `Authorization: Bearer <token>` 헤더로 검증(`requireAuth`), 수명은 `ACCESS_TOKEN_TTL_SEC`(기본 900초).
  - refresh token: `refreshToken` 쿠키(`httpOnly`, `path=/api/auth`, 프로덕션에서만 `secure`)로만 전달되고, DB의 `users.refresh_token_hash`(sha256 해시)와 대조해 검증합니다. `POST /api/auth/refresh` 호출 때마다 회전(rotation)되어 재사용 공격을 방지합니다.
  - `POST /api/auth/logout`은 쿠키의 refresh token을 검증해 해당 유저의 `refresh_token_hash`를 `NULL`로 지우고 쿠키를 clear합니다.

### DB

- 데이터베이스명: `claude_study` (`users`, `posts` 테이블, `server/src/schema.sql` 참고)
- `users.refresh_token_hash` — 현재 유효한 refresh token의 sha256 해시(로그아웃/미로그인 시 `NULL`). 로그인·refresh마다 갱신됩니다.
- `npm run db:init` — 테이블 생성 + 기본 시드 + 컬럼 마이그레이션(`ensureColumn`, 여러 번 실행해도 안전, `ON DUPLICATE KEY UPDATE` 사용)
- `npm run db:seed:dummy-posts` — 페이지네이션 테스트용 게시물 10건 추가 시드
- 기본 로그인 계정: `test@example.com` / `password123` (모든 시드 계정 공통 비밀번호)

## 개발 환경 실행

- client: `cd client && npm run dev` → http://localhost:5173
- server: `cd server && npm run dev` → http://localhost:4000 (MySQL 필요, 최초 1회 `npm run db:init`)
- client가 실제 server와 연동되려면 `client/.env`를 `VITE_USE_MOCK_API=false` + `VITE_API_BASE_URL=http://localhost:4000/api`로 설정해야 합니다 (`true`면 서버 없이 mock 데이터로 동작).

## 관련 문서

- [API_CONVENTIONS.md](./API_CONVENTIONS.md) — client 데이터 레이어(`api.ts`/`queries.ts`) 작성 규칙 상세
