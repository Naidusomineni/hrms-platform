import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { authAPI } from '../../../api/authAPI'
import { updateCurrentUser, logoutUser } from '../../../store/slices/authSlice'
import { Input, Button, Card, CardBody, Alert } from '../../../components/common/index.jsx'
import { ShieldCheck, Lock, ArrowRight, LogOut, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const schema = yup.object({
  currentPassword: yup.string().required('Temporary password is required'),
  newPassword: yup
    .string()
    .min(8, 'New password must be at least 8 characters')
    .notOneOf([yup.ref('currentPassword')], 'New password must be different from temporary password')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords do not match')
    .required('Confirm password is required'),
})

const FirstLoginChangePasswordPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  const onSubmit = async (data) => {
    try {
      await authAPI.changePassword(user?.userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      dispatch(updateCurrentUser({ mustChangePassword: false }))
      toast.success('Permanent password set successfully! Welcome aboard.')
      const home = user?.role === 'ROLE_EMPLOYEE' ? '/profile' : '/dashboard'
      navigate(home, { replace: true })
    } catch (err) {
      toast.error(err.userFriendlyMessage || err.response?.data?.message || 'Failed to update password')
    }
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden select-none">
      {/* Subtle ambient pastel glow */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <Card className="border border-slate-200/90 shadow-xl rounded-3xl p-2 sm:p-4">
          <CardBody className="p-6 sm:p-8 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
                  Initial Onboarding Security
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">Create Permanent Password</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Welcome, <strong className="text-slate-800">{user?.fullName || 'Employee'}</strong>! Because you logged in with temporary credentials, corporate policy requires setting a permanent password before continuing.
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1.5 text-slate-600">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                <Lock size={13} className="text-primary-600" /> Password Security Guidelines:
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Minimum 8 characters in length
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Must differ from your temporary credentials
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Do not disclose this password to anyone
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                {...register('currentPassword')}
                label="Current Temporary Password"
                type="password"
                placeholder="Enter temporary password received via email"
                error={errors.currentPassword?.message}
                required
              />

              <Input
                {...register('newPassword')}
                label="New Permanent Password"
                type="password"
                placeholder="Min 8 characters (letters, numbers, symbols)"
                error={errors.newPassword?.message}
                required
              />

              <Input
                {...register('confirmPassword')}
                label="Confirm New Password"
                type="password"
                placeholder="Re-type new permanent password"
                error={errors.confirmPassword?.message}
                required
              />

              <div className="pt-2 flex flex-col gap-2.5">
                <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full">
                  Set Permanent Password & Enter Portal <ArrowRight size={16} />
                </Button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 py-2 transition-colors"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </form>

          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default FirstLoginChangePasswordPage
