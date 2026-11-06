import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authAPI } from '../../../api/authAPI'
import { Input, Button } from '../../../components/common'
import { KeyRound, CheckCircle, RefreshCw, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = yup.object({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  otp: yup.string().length(6, 'OTP must be exactly 6 digits').required('OTP is required'),
  newPassword: yup.string().min(8, 'Minimum 8 characters').required('New password is required'),
})

const ResetPasswordPage = () => {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const initialEmail = location.state?.email || ''

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: initialEmail, otp: '', newPassword: '' }
  })

  const currentEmail = watch('email')

  // 60-second Resend Timer
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  const handleResendOtp = async () => {
    if (!currentEmail) {
      toast.error('Please enter your email address first')
      return
    }
    setResending(true)
    try {
      await authAPI.forgotPassword({ email: currentEmail })
      toast.success('A new 6-digit OTP has been sent to your email!')
      setCountdown(60)
      setCanResend(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.resetPassword(data)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Password Reset Successfully!</h2>
              <p className="text-slate-500 mb-6">Your password has been updated and all active sessions have been refreshed. Redirecting to login...</p>
              <Link to="/login" className="btn-primary w-full justify-center">Go to Login Now</Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-6">
                <KeyRound size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Enter Verification Code</h2>
              <p className="text-slate-500 text-sm mb-6">Enter the 6-digit OTP received in your inbox and establish your new password.</p>

              {initialEmail && (
                <div className="flex items-center gap-2 p-2.5 bg-blue-50/80 border border-blue-200/60 rounded-xl mb-5 text-xs text-blue-800">
                  <Mail size={14} className="text-blue-600 shrink-0" />
                  <span>Code dispatched to: <strong>{initialEmail}</strong></span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Input
                  {...register('email')}
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  error={errors.email?.message}
                  required
                />

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">6-Digit OTP <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      disabled={!canResend || resending}
                      onClick={handleResendOtp}
                      className="text-xs text-primary-600 hover:text-primary-700 disabled:text-slate-400 font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                      {canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
                    </button>
                  </div>
                  <input
                    {...register('otp')}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="input text-center text-2xl tracking-[0.6em] font-mono font-bold"
                    autoFocus
                  />
                  {errors.otp && <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>}
                </div>

                <Input
                  {...register('newPassword')}
                  label="New Permanent Password"
                  type="password"
                  placeholder="Min 8 characters"
                  error={errors.newPassword?.message}
                  required
                />

                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">
                  Verify OTP & Reset Password
                </Button>
              </form>

              <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-primary-600 mt-5 font-medium">
                â† Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
