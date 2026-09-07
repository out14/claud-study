import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Pagination from '@src/components/Pagination'
import type { AuthUser } from '@src/features/auth/types'
import { useUpdateUserMutation, useUsersQuery } from './queries'
import type { AppUser } from './types'

const PAGE_SIZE = 5

const ROLE_LABEL: Record<AppUser['role'], string> = {
  admin: '관리자',
  member: '멤버',
}

const STATUS_LABEL: Record<AppUser['status'], string> = {
  active: '활성',
  inactive: '비활성',
}

const STATUS_CLASSNAME: Record<AppUser['status'], string> = {
  active: 'bg-accent-bg text-accent',
  inactive: 'bg-border text-text',
}

interface UsersPageProps {
  user: AuthUser
}

function UsersPage({ user }: UsersPageProps) {
  const { data: users = [] } = useUsersQuery()
  const updateUserMutation = useUpdateUserMutation()
  const [page, setPage] = useState(1)
  const activeCount = users.filter((u) => u.status === 'active').length
  const adminCount = users.filter((u) => u.role === 'admin').length

  function handleToggleStatus(id: string) {
    const target = users.find((u) => u.id === id)
    if (!target) return
    updateUserMutation.mutate({
      id,
      updates: { status: target.status === 'active' ? 'inactive' : 'active' },
    })
  }

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const pagedUsers = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <section className="flex grow flex-col gap-8 px-5 py-8">
      <header className="border-b border-border pb-6 text-left">
        <h1 className="m-0 text-3xl font-medium tracking-[-0.5px] text-heading">
          유저 관리
        </h1>
        <p className="mt-1 text-sm text-text">{user.email}로 로그인됨</p>
      </header>

      <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">전체 사용자</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{users.length}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">활성 사용자</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{activeCount}</p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="m-0 text-sm text-text">관리자</p>
          <p className="m-0 mt-2 text-2xl font-medium text-heading">{adminCount}</p>
        </div>
      </div>

      <div className="overflow-x-auto text-left">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-text">
              <th className="px-3 py-2 font-normal">이름</th>
              <th className="px-3 py-2 font-normal">이메일</th>
              <th className="px-3 py-2 font-normal">역할</th>
              <th className="px-3 py-2 font-normal">상태</th>
              <th className="px-3 py-2 font-normal">가입일</th>
              <th className="px-3 py-2 font-normal">작업</th>
            </tr>
          </thead>
          <tbody>
            {pagedUsers.map((appUser) => (
              <tr key={appUser.id} className="border-b border-border last:border-0">
                <td className="px-3 py-3 text-heading">
                  <div className="flex items-center gap-2.5">
                    {appUser.avatarUrl ? (
                      <img
                        src={appUser.avatarUrl}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-bg text-xs text-accent">
                        {appUser.name.slice(0, 1)}
                      </span>
                    )}
                    {appUser.name}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Link
                    to={`/users/${appUser.id}`}
                    className="text-accent underline decoration-accent-border underline-offset-2 hover:decoration-accent"
                  >
                    {appUser.email}
                  </Link>
                </td>
                <td className="px-3 py-3 text-heading">{ROLE_LABEL[appUser.role]}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${STATUS_CLASSNAME[appUser.status]}`}
                  >
                    {STATUS_LABEL[appUser.status]}
                  </span>
                </td>
                <td className="px-3 py-3 text-heading">{appUser.joinedAt}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(appUser.id)}
                    className="cursor-pointer rounded-md border border-border px-2.5 py-1 text-xs text-heading transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {appUser.status === 'active' ? '비활성화' : '활성화'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  )
}

export default UsersPage
