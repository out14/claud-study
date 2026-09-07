# API 작성 컨벤션 (client)

`client/src/features/**` 에서 서버 데이터를 다룰 때 따르는 공통 패턴입니다. 새 기능을 추가할 때 이 구조를 그대로 따라주세요.

## 레이어 구조

기능 하나당 아래 3개 파일로 나눕니다 (`client/src/features/<feature>/`).

```
features/<feature>/
  types.ts     도메인 타입
  api.ts       실제 fetch 호출 (mock ↔ real 전환)
  queries.ts   useQuery / useMutation 훅
```

페이지 컴포넌트는 `api.ts`를 직접 호출하지 않고, 항상 `queries.ts`가 내보내는 훅을 통해서만 데이터에 접근합니다.

## 1. `api.ts` — mock / real 전환

각 동작마다 `xxxMock` / `xxxRequest` 두 버전을 만들고, `VITE_USE_MOCK_API` 값에 따라 분기하는 함수 하나를 export 합니다. 백엔드가 준비되기 전에도 화면을 만들 수 있고, 나중엔 `.env`의 `VITE_USE_MOCK_API=false` + `VITE_API_BASE_URL` 값만 바꾸면 실제 서버로 전환됩니다.

```ts
// features/users/api.ts
import { apiFetch, mockDelay, USE_MOCK_API } from '@src/api/client'
import { INITIAL_USERS } from './mockUsers'
import type { AppUser } from './types'

let mockUsers = INITIAL_USERS.map((user) => ({ ...user }))

async function getUsersMock(): Promise<AppUser[]> {
  await mockDelay()
  return mockUsers.map((user) => ({ ...user }))
}

function getUsersRequest(): Promise<AppUser[]> {
  return apiFetch<AppUser[]>('/users')
}

export function getUsers(): Promise<AppUser[]> {
  return USE_MOCK_API ? getUsersMock() : getUsersRequest()
}
```

공통 fetch 래퍼는 `client/src/api/client.ts`에 있습니다.

- `apiFetch<T>(path, options)` — `VITE_API_BASE_URL` 기준으로 요청, JSON 헤더 자동 세팅, 실패 시 `ApiError` throw.
- `USE_MOCK_API` — `VITE_USE_MOCK_API` 환경변수 (기본 mock).
- `mockDelay(ms?)` — mock 함수에서 실제 네트워크처럼 지연을 흉내낼 때 사용.

새 리소스를 추가할 때 이 세 가지를 그대로 재사용하세요. `fetch`를 여기저기서 직접 호출하지 않습니다.

## 2. `queries.ts` — useQuery / useMutation 훅

- 목록/단건 조회는 `useXxxQuery()`로, 생성·수정·삭제는 `useXxxMutation()`으로 감쌉니다.
- `queryKey`는 파일 상단에 상수로 export 해서 재사용합니다.
- 수정 성공 시엔 refetch 대신 `queryClient.setQueryData`로 캐시를 직접 갱신합니다 (같은 데이터를 보는 다른 화면에도 즉시 반영됨).

```ts
// features/users/queries.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUsers, updateUser } from './api'
import type { AppUser } from './types'

export const usersQueryKey = ['users'] as const

export function useUsersQuery() {
  return useQuery({ queryKey: usersQueryKey, queryFn: getUsers })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AppUser> }) =>
      updateUser(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData<AppUser[]>(usersQueryKey, (prev) =>
        prev?.map((user) => (user.id === updated.id ? updated : user)),
      )
    },
  })
}
```

수정 mutation의 인자는 `{ id, updates }` 형태로 통일합니다. 생성/삭제처럼 `id`가 필요 없는 mutation은 입력값 하나만 받습니다 (`features/posts/queries.ts`의 `useCreatePostMutation`, `useDeletePostMutation` 참고).

## 3. 컴포넌트에서 사용

각 페이지·컴포넌트가 필요할 때 직접 훅을 호출합니다. `App.tsx`에서 데이터를 미리 받아 props로 내려주지 않습니다. 같은 `queryKey`를 쓰는 여러 컴포넌트는 캐시를 공유하므로 요청이 중복되지 않습니다.

```tsx
function UsersPage({ user }: { user: AuthUser }) {
  const { data: users = [] } = useUsersQuery()
  const updateUserMutation = useUpdateUserMutation()
  // ...
}
```

## 4. 로그인 등 단발성 요청

목록 조회가 없는 단발성 요청(로그인 등)도 `useMutation`으로 감쌉니다. `isPending` / `isError` / `error`를 그대로 쓰고, 별도의 `isSubmitting` / `error` state를 직접 만들지 않습니다.

```ts
// features/auth/queries.ts
export function useLoginMutation() {
  return useMutation({ mutationFn: login })
}
```

## 5. import 경로

기능 폴더를 넘나드는 import는 상대경로(`../../`) 대신 `@src/...` alias를 씁니다. 같은 폴더 안(`./types`, `./api`)은 그대로 상대경로 사용.

```ts
import { apiFetch } from '@src/api/client'
import type { AppUser } from '@src/features/users/types'
```

## 체크리스트 (새 기능 추가 시)

- [ ] `types.ts`에 도메인 타입 정의
- [ ] `api.ts`에 mock/real 버전 + 환경변수 분기 함수 작성 (공통 `apiFetch`/`mockDelay`/`USE_MOCK_API` 재사용)
- [ ] `queries.ts`에 `useXxxQuery` / `useXxxMutation` 작성, mutation 성공 시 `setQueryData`로 캐시 갱신
- [ ] 페이지 컴포넌트에서 `queries.ts` 훅을 직접 호출 (props로 데이터 내려받지 않기)
- [ ] 폴더 간 import는 `@src/...` alias 사용
