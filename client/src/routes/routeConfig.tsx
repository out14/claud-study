import type { ReactNode } from 'react'
import type { AuthUser } from '@src/features/auth/types'
import DashboardPage from '@src/features/dashboard/DashboardPage'
import UsersPage from '@src/features/users/UsersPage'
import UserDetailPage from '@src/features/users/UserDetailPage'
import PostsListPage from '@src/features/posts/PostsListPage'
import PostDetailPage from '@src/features/posts/PostDetailPage'
import PostFormPage from '@src/features/posts/PostFormPage'
import ProductsListPage from '@src/features/products/ProductsListPage'
import ProductDetailPage from '@src/features/products/ProductDetailPage'
import ProductFormPage from '@src/features/products/ProductFormPage'
import ReviewsPage from '@src/features/reviews/ReviewsPage'
import InquiriesListPage from '@src/features/inquiries/InquiriesListPage'
import InquiryDetailPage from '@src/features/inquiries/InquiryDetailPage'
import MyPage from '@src/features/profile/MyPage'
import SettingsPage from '@src/features/settings/SettingsPage'

export interface AppRoute {
  path: string
  element: ReactNode
}

/**
 * 로그인해야 접근 가능한 라우트 목록입니다. 새 페이지를 추가할 때는
 * 여기에 한 줄만 추가하면 되고, App.tsx는 이 배열을 map으로 렌더링합니다.
 */
export function getProtectedRoutes(user: AuthUser): AppRoute[] {
  return [
    { path: '/dashboard', element: <DashboardPage user={user} /> },
    { path: '/users', element: <UsersPage user={user} /> },
    { path: '/users/:id', element: <UserDetailPage /> },
    { path: '/posts', element: <PostsListPage /> },
    { path: '/posts/new', element: <PostFormPage /> },
    { path: '/posts/:id', element: <PostDetailPage /> },
    { path: '/posts/:id/edit', element: <PostFormPage /> },
    { path: '/products', element: <ProductsListPage /> },
    { path: '/products/new', element: <ProductFormPage /> },
    { path: '/products/:id', element: <ProductDetailPage /> },
    { path: '/products/:id/edit', element: <ProductFormPage /> },
    { path: '/reviews', element: <ReviewsPage /> },
    { path: '/inquiries', element: <InquiriesListPage /> },
    { path: '/inquiries/:id', element: <InquiryDetailPage /> },
    { path: '/mypage', element: <MyPage user={user} /> },
    { path: '/settings', element: <SettingsPage user={user} /> },
  ]
}
