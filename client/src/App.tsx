import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import LoginPage from './features/auth/LoginPage'
import { clearStoredUser, loadStoredUser, saveStoredUser } from './features/auth/authStorage'
import { useLogoutMutation } from './features/auth/queries'
import type { AuthUser, LoginResult } from './features/auth/types'
import DashboardPage from './features/dashboard/DashboardPage'
import UsersPage from './features/users/UsersPage'
import UserDetailPage from './features/users/UserDetailPage'
import MyPage from './features/profile/MyPage'
import SettingsPage from './features/settings/SettingsPage'
import PostsListPage from './features/posts/PostsListPage'
import PostDetailPage from './features/posts/PostDetailPage'
import PostFormPage from './features/posts/PostFormPage'
import ProductsListPage from './features/products/ProductsListPage'
import ProductDetailPage from './features/products/ProductDetailPage'
import ProductFormPage from './features/products/ProductFormPage'
import ReviewsPage from './features/reviews/ReviewsPage'
import InquiriesListPage from './features/inquiries/InquiriesListPage'
import InquiryDetailPage from './features/inquiries/InquiryDetailPage'
import { USE_MOCK_API, refreshAccessToken } from '@src/api/client'
import { setAccessToken, clearAccessToken } from '@src/api/authToken'
import { onSessionExpired } from '@src/api/authEvents'

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser())
  // access token은 메모리에만 있으므로 새로고침 직후엔 refresh 쿠키로 세션을 복구해야 합니다.
  const [isRestoringSession, setIsRestoringSession] = useState(
    () => Boolean(loadStoredUser()) && !USE_MOCK_API,
  )
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logoutMutation = useLogoutMutation()

  const handleLogout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // refresh 쿠키가 이미 만료/무효화된 경우에도 로컬 상태는 정리합니다.
    }
    clearAccessToken()
    setUser(null)
    clearStoredUser()
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [logoutMutation, queryClient, navigate])

  useEffect(() => {
    if (!isRestoringSession) return
    refreshAccessToken().then((ok) => {
      if (!ok) {
        clearStoredUser()
        setUser(null)
      }
      setIsRestoringSession(false)
    })
    // 앱이 처음 뜰 때 한 번만 refresh 쿠키로 세션 복구를 시도합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return onSessionExpired(() => {
      void handleLogout()
    })
  }, [handleLogout])

  function handleLoginSuccess(result: LoginResult) {
    setAccessToken(result.accessToken)
    setUser(result.user)
    saveStoredUser(result.user)
    navigate('/dashboard', { replace: true })
  }

  if (isRestoringSession) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-text">세션 확인 중...</p>
      </section>
    )
  }

  return (
    <>
      {user && <Header user={user} onLogout={handleLogout} />}
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users"
          element={user ? <UsersPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/users/:id"
          element={user ? <UserDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/posts"
          element={user ? <PostsListPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/posts/new"
          element={user ? <PostFormPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/posts/:id"
          element={user ? <PostDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/posts/:id/edit"
          element={user ? <PostFormPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/products"
          element={user ? <ProductsListPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/products/new"
          element={user ? <ProductFormPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/products/:id"
          element={user ? <ProductDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/products/:id/edit"
          element={user ? <ProductFormPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/reviews"
          element={user ? <ReviewsPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/inquiries"
          element={user ? <InquiriesListPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/inquiries/:id"
          element={user ? <InquiryDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/mypage"
          element={user ? <MyPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={user ? <SettingsPage user={user} /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  )
}

export default App
