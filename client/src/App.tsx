import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import LoginPage from './features/auth/LoginPage'
import { clearStoredUser, loadStoredUser, saveStoredUser } from './features/auth/authStorage'
import { useLogoutMutation } from './features/auth/queries'
import type { AuthUser, LoginResult } from './features/auth/types'
import ProtectedRoute from './routes/ProtectedRoute'
import { getProtectedRoutes } from './routes/routeConfig'
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

  const protectedRoutes = user ? getProtectedRoutes(user) : []

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
        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<ProtectedRoute user={user}>{element}</ProtectedRoute>}
          />
        ))}
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  )
}

export default App
