import React, { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import type { Role } from '../types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: (Role | string)[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, user } = useAppSelector(s => s.auth)
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  if (user?.mustChangePassword && location.pathname !== '/first-login-change-password') {
    return <Navigate to="/first-login-change-password" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-center max-w-md mb-6">You don't have permission to view this page.</p>
        <button onClick={() => window.history.back()} className="btn-primary">Go Back</button>
      </div>
    )
  }
  return <>{children}</>
}

export default ProtectedRoute

