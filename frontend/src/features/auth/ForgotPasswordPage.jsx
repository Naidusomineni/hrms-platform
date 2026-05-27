import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { authAPI } from '../../api/authAPI'
import { Input, Button, Alert } from '../../components/common/index.jsx'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = yup.object({ email: yup.string().email().required('Email is required') })

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authAPI.forgotPassword(data)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-500 mb-6">We sent a 6-digit OTP to your email address. It expires in 15 minutes.</p>
              <Link to="/reset-password" className="btn-primary w-full justify-center">Enter OTP & Reset Password</Link>
              <Link to="/login" className="btn-ghost w-full justify-center mt-3 text-slate-500">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-6">
                <Mail size={22} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Forgot password?</h2>
              <p className="text-slate-500 mb-8">Enter your email and we'll send you a reset OTP.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input {...register('email')} label="Email Address" type="email" placeholder="you@company.com" error={errors.email?.message} required autoFocus />
                <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">Send Reset OTP</Button>
              </form>
              <Link to="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-6 font-medium">
                <ArrowLeft size={14}/> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default ForgotPasswordPage
