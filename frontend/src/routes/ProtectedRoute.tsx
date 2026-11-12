import React, { useState, useEffect, type ReactNode } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { tenantModuleAPI } from '../api/tenantModuleAPI'
import { Sliders, ArrowLeft, LayoutDashboard } from 'lucide-react'
import type { Role } from '../types'

interface ProtectedRouteProps {
  children: ReactNode
  roles?: (Role | string)[]
  moduleKey?: string
}

let cachedEnabledModules: string[] | null = null

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles, moduleKey }) => {
  const { isAuthenticated, user } = useAppSelector(s => s.auth)
  const { tenant } = useAppSelector(s => s.tenant)
  const location = useLocation()

  const [enabledModules, setEnabledModules] = useState<string[] | null>(cachedEnabledModules)

  useEffect(() => {
    if (!moduleKey) return

    const fetchModules = () => {
      tenantModuleAPI.getEnabledModuleKeys()
        .then(res => {
          const list = res.data?.data || []
          cachedEnabledModules = list
          setEnabledModules(list)
        })
        .catch(() => {})
    }

    if (!cachedEnabledModules) {
      fetchModules()
    }

    const onModulesUpdated = () => {
      fetchModules()
    }
    window.addEventListener('tenant-modules-updated', onModulesUpdated)
    return () => window.removeEventListener('tenant-modules-updated', onModulesUpdated)
  }, [moduleKey])

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  if (user?.mustChangePassword && location.pathname !== '/first-login-change-password') {
    return <Navigate to="/first-login-change-password" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-xs text-2xl font-bold">
          🚫
        </div>
        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider mb-2">
          Unauthorized Access
        </span>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-center max-w-md mb-6 text-sm">
          Your account role (<code className="font-mono text-slate-700">{user.role}</code>) does not have permission to view this resource.
        </p>
        <button onClick={() => window.history.back()} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer">
          Go Back
        </button>
      </div>
    )
  }

  // Check if Module is Deactivated for this Organization
  if (moduleKey && enabledModules && !enabledModules.includes(moduleKey)) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
          <Sliders size={30} />
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider mb-2.5">
          Module Subscription Deactivated
        </span>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {moduleKey} Module Is Disabled
        </h2>
        <p className="text-slate-500 max-w-lg mb-6 text-sm leading-relaxed">
          The <strong>{moduleKey}</strong> module is currently turned off for <strong>{tenant?.name || 'your company'}</strong> in the Policy Hub module manifest.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <LayoutDashboard size={14} /> Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
