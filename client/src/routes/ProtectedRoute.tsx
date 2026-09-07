import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { AuthUser } from '@src/features/auth/types'

interface ProtectedRouteProps {
  user: AuthUser | null
  children: ReactNode
}

function ProtectedRoute({ user, children }: ProtectedRouteProps) {
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default ProtectedRoute
