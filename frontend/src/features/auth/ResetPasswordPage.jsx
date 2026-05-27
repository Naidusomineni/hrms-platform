import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/authAPI'
import { Input, Button, Alert } from '../../components/common/index.jsx'
import { KeyRound, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = yup.object({
  email: yup.string().email().required('Email is required'),
  otp: yup.string().length(6,'OTP must be 6 digits').required('OTP is required'),
  newPassword: yup.string().min(8,'Minimum 8 characters').required('New password is required'),
})

const ResetPasswordPage = () => {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.resetPassword(data)
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
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
              <h2 className="text-2xl font-black text-slate-900 mb-2">Password Reset!</h2>
              <p className="text-slate-500">Redirecting to login in 3 seconds...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-6">
                <KeyRound size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h2>
              <p className="text-slate-500 mb-8">Enter the OTP sent to your email and choose a new password.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input {...register('email')} label="Email Address" type="email" placeholder="your@email.com" error={errors.email?.message} required />
                <Input {...register('otp')} label="6-Digit OTP" type="text" maxLength={6} placeholder="000000"
                  error={errors.otp?.message} required className="text-center text-2xl tracking-[0.5em] font-mono" />
                <Input {...register('newPassword')} label="New Password" type="password" placeholder="Min 8 characters" error={errors.newPassword?.message} required />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">Reset Password</Button>
              </form>
              <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-primary-600 mt-4 font-medium">Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default ResetPasswordPage
