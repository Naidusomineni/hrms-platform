import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../../../store/slices/authSlice'
import { attendanceAPI } from '../../../api/attendanceAPI'
import { Button, Alert } from '../../../components/common'
import {
  Eye, EyeOff, ShieldCheck, Lock, Building2, Laptop
} from 'lucide-react'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const schema = yup.object({
  email: yup.string().email('Enter a valid work email address').required('Work email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
})

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@hrms.com', password: 'Admin@123', label: 'Admin', subtitle: 'System Admin' },
  { role: 'HR', email: 'hr@hrms.com', password: 'Hr@123', label: 'HR Ops', subtitle: 'People Operations' },
  { role: 'Manager', email: 'manager@hrms.com', password: 'Manager@123', label: 'Manager', subtitle: 'Approver' },
  { role: 'Employee', email: 'emp@hrms.com', password: 'Emp@123', label: 'Employee', subtitle: 'Staff Portal' },
]

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector(s => s.auth)
  const { tenant } = useSelector(s => s.tenant)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [workMode, setWorkMode] = useState('OFFICE') // 'OFFICE' | 'REMOTE_WFH'
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' }
  })

  const handleSelectDemo = (demo) => {
    setSelectedRole(demo.role)
    setValue('email', demo.email, { shouldValidate: true })
    setValue('password', demo.password, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data))
    if (loginUser.fulfilled.match(result)) {
      if (result.payload?.mustChangePassword) {
        navigate('/first-login-change-password', { replace: true })
        return
      }

      // Enterprise Auto-Attendance on Login (Option A)
      if (result.payload?.employeeId) {
        try {
          await attendanceAPI.autoLoginPunch(result.payload.employeeId, workMode)
        } catch {
          // silently proceed
        }
      }

      const role = result.payload?.role
      const home = role === 'ROLE_EMPLOYEE' ? '/profile' : '/dashboard'
      navigate(from === '/login' || from === '/register' ? home : from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center px-4 py-8 sm:py-12 text-slate-800 antialiased">
      {/* Top Corporate Header / Brand Navigation */}
      <header className="w-full max-w-md flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name || 'Company Logo'}
              className="h-10 max-w-[130px] object-contain rounded bg-white p-1 border border-slate-200"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Building2 size={22} className="text-white" />
            </div>
          )}
          <div>
            <span className="font-bold text-base text-slate-900 tracking-tight block leading-tight">
              {tenant?.name || 'Enterprise HRMS'}
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              {tenant?.domain ? `${tenant.domain} Portal` : 'Workforce Operations Platform'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-600 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium">Tenant: <strong className="text-slate-800 font-semibold">{tenant?.code || 'default'}</strong></span>
        </div>
      </header>

      {/* Main Corporate Login Card */}
      <main className="w-full max-w-md my-auto">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-7 sm:p-9">
          {/* Card Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter your corporate credentials to access your workspace.
            </p>
          </div>

          {error && (
            <Alert type="error" className="mb-5">
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Work Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="name@company.com"
                className={clsx(
                  'w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all',
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-300 hover:border-slate-400 focus:border-primary-600 focus:ring-primary-600/10'
                )}
                autoFocus
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  className={clsx(
                    'w-full pl-3.5 pr-10 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all',
                    errors.password
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-slate-300 hover:border-slate-400 focus:border-primary-600 focus:ring-primary-600/10'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Work Mode Context (Clean Corporate Segment - Zero Emojis) */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Attendance Check-In Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setWorkMode('OFFICE')}
                  className={clsx(
                    'py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all',
                    workMode === 'OFFICE'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Building2 size={14} className={workMode === 'OFFICE' ? 'text-primary-600' : 'text-slate-400'} />
                  Office (Campus)
                </button>

                <button
                  type="button"
                  onClick={() => setWorkMode('REMOTE_WFH')}
                  className={clsx(
                    'py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all',
                    workMode === 'REMOTE_WFH'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800'
                  )}
                >
                  <Laptop size={14} className={workMode === 'REMOTE_WFH' ? 'text-primary-600' : 'text-slate-400'} />
                  Remote / WFH
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none hover:text-slate-900">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full py-2.5 text-sm font-semibold mt-2"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Quick Access Switcher (Discreet Corporate Utility) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Switcher
            </p>
            <div className="grid grid-cols-4 gap-2">
              {DEMO_ACCOUNTS.map((demo) => {
                const isSelected = selectedRole === demo.role
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={clsx(
                      'py-1.5 px-2 rounded-lg text-xs font-medium border transition-all text-center',
                      isSelected
                        ? 'bg-primary-50 border-primary-300 text-primary-700 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    {demo.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Enterprise Compliance & Security Footer */}
      <footer className="w-full max-w-md text-center text-xs text-slate-400 mt-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-600" /> SOC-2 Type II
          </span>
          <span>â€¢</span>
          <span>256-Bit TLS</span>
          <span>â€¢</span>
          <span>ISO 27001 Certified</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Enterprise Human Resource Management System &copy; 2026
        </p>
      </footer>
    </div>
  )
}

export default LoginPage
