import { Link, NavLink } from 'react-router-dom'
import type { AuthUser } from '@src/features/auth/types'
import { useUsersQuery } from '@src/features/users/queries'

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/users', label: '유저 관리' },
  { to: '/posts', label: '게시물 관리' },
  { to: '/products', label: '상품 관리' },
  { to: '/reviews', label: '리뷰 관리' },
  { to: '/inquiries', label: '상품문의 관리' },
  { to: '/settings', label: '설정' },
]

const NAV_LINK_CLASSNAME =
  'rounded-md px-3 py-1.5 text-sm transition-colors duration-300'

interface HeaderProps {
  user: AuthUser
  onLogout: () => void
}

function Header({ user, onLogout }: HeaderProps) {
  const { data: users } = useUsersQuery()
  const appUser = users?.find((u) => u.email === user.email)

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `${NAV_LINK_CLASSNAME} ${
                isActive ? 'bg-accent-bg text-accent' : 'text-text hover:text-heading'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Link
          to="/mypage"
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-text transition-colors duration-300 hover:text-heading"
        >
          {appUser?.avatarUrl ? (
            <img
              src={appUser.avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-bg text-xs text-accent">
              {(appUser?.name ?? user.email).slice(0, 1)}
            </span>
          )}
          <span>{appUser?.name ?? user.email}</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="cursor-pointer rounded-md border-2 border-transparent bg-accent-bg px-4 py-2 text-sm text-accent transition-colors duration-300 hover:border-accent-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          로그아웃
        </button>
      </div>
    </header>
  )
}

export default Header
