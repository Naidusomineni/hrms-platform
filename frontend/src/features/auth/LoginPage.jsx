import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../../store/slices/authSlice'
import { Input, Button, Alert } from '../../components/common/index.jsx'
import { Eye, EyeOff, Briefcase, ShieldCheck } from 'lucide-react'

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6).required('Password is required'),
})

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { loading, error } = useSelector(s => s.auth)
  const [showPassword, setShowPassword] = useState(false)
  const from = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data))
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload?.role
      const home = role === 'ROLE_EMPLOYEE' ? '/profile' : '/dashboard'
      navigate(from === '/login' || from === '/register' ? home : from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize:'40px 40px'}} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Briefcase size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">HRMS Platform</h1>
              <p className="text-blue-200 text-sm">Enterprise Edition</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-white leading-tight">
              Manage your workforce<br/>with confidence
            </h2>
            <p className="text-blue-200 text-lg leading-relaxed max-w-md">
              A complete HR platform for modern enterprises — attendance, payroll, recruitment, and more in one place.
            </p>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {[['500+','Companies'],['50K+','Employees'],['99.9%','Uptime']].map(([n,l]) => (
            <div key={l} className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20">
              <p className="text-2xl font-black text-white">{n}</p>
              <p className="text-blue-200 text-sm">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <Briefcase size={20} className="text-white" />
            </div>
            <span className="font-black text-xl text-slate-900">HRMS Platform</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          {error && <Alert type="error" className="mb-6">{error}</Alert>}

          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-blue-700 mb-2 flex items-center gap-1.5"><ShieldCheck size={13}/>Demo Credentials</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>Admin: <code className="bg-blue-100 px-1 rounded">admin@hrms.com</code> / <code className="bg-blue-100 px-1 rounded">Admin@123</code></p>
              <p>HR: <code className="bg-blue-100 px-1 rounded">hr@hrms.com</code> / <code className="bg-blue-100 px-1 rounded">Hr@123</code></p>
              <p>Employee: <code className="bg-blue-100 px-1 rounded">emp@hrms.com</code> / <code className="bg-blue-100 px-1 rounded">Emp@123</code></p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              {...register('email')} label="Email Address" type="email"
              placeholder="you@company.com" error={errors.email?.message} required autoFocus
            />
            <div className="relative">
              <Input
                {...register('password')} label="Password"
                type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                error={errors.password?.message} required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" {...register('rememberMe')} className="rounded border-slate-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-semibold">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default LoginPage
