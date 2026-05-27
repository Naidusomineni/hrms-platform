import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

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
  return children
}
export default ProtectedRoute
