import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSelector } from 'react-redux'
import { authAPI } from '../api/authAPI'
import { Input, Button, Card, CardHeader, CardBody, Alert } from '../components/common/index.jsx'
import { User, Lock, Shield, Mail, Clock, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const pwSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8,'Min 8 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')],'Passwords do not match').required(),
})

const ProfilePage = () => {
  const { user } = useSelector(s => s.auth)
  const [changingPw, setChangingPw] = useState(false)
  const [loginHistory, setLoginHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(pwSchema)
  })

  const onChangePassword = async (data) => {
    try {
      await authAPI.changePassword(user?.userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed. Please login again.')
      reset()
      setChangingPw(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    }
  }

  const loadLoginHistory = async () => {
    if (historyLoaded) return
    try {
      const r = await authAPI.getLoginHistory(user?.userId)
      setLoginHistory(r.data.data || [])
      setHistoryLoaded(true)
    } catch {
      toast.error('Failed to load login history')
    }
  }

  const roleColors = {
    ROLE_SUPER_ADMIN: 'gradient-purple', ROLE_ADMIN: 'gradient-danger',
    ROLE_HR: 'gradient-primary', ROLE_MANAGER: 'gradient-warning', ROLE_EMPLOYEE: 'gradient-success'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-black text-slate-900">My Profile</h2>

      {/* Profile Hero */}
      <Card>
        <CardBody className="py-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 ${roleColors[user?.role] || 'gradient-primary'} rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg`}>
              {user?.fullName?.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{user?.fullName}</h3>
              <p className="text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full">
                  {user?.role?.replace('ROLE_','')}
                </span>
                {user?.emailVerified
                  ? <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1"><Shield size={11}/>Verified</span>
                  : <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Email Unverified</span>
                }
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-50 rounded-lg"><User size={16} className="text-primary-600"/></div>
            <h3 className="font-bold text-slate-800">Account Details</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          {[
            { icon: Mail, label:'Email', value: user?.email },
            { icon: Shield, label:'Role', value: user?.role?.replace('ROLE_','') },
            { icon: User, label:'Full Name', value: user?.fullName },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="p-2 bg-white rounded-lg shadow-sm"><Icon size={15} className="text-slate-500"/></div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || '—'}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg"><Lock size={16} className="text-amber-600"/></div>
              <h3 className="font-bold text-slate-800">Change Password</h3>
            </div>
            {!changingPw && <Button variant="outline" size="sm" onClick={() => setChangingPw(true)}>Change</Button>}
          </div>
        </CardHeader>
        {changingPw && (
          <CardBody>
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-4" noValidate>
              <Input {...register('currentPassword')} label="Current Password" type="password" placeholder="Enter current password" error={errors.currentPassword?.message} required />
              <Input {...register('newPassword')} label="New Password" type="password" placeholder="Min 8 characters" error={errors.newPassword?.message} required />
              <Input {...register('confirmPassword')} label="Confirm New Password" type="password" placeholder="Repeat new password" error={errors.confirmPassword?.message} required />
              <Alert type="warning">
                After changing your password, you'll be logged out from all devices and need to sign in again.
              </Alert>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => { setChangingPw(false); reset() }}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isSubmitting}>Save New Password</Button>
              </div>
            </form>
          </CardBody>
        )}
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg"><Clock size={16} className="text-slate-600"/></div>
              <h3 className="font-bold text-slate-800">Login History</h3>
            </div>
            {!historyLoaded && <Button variant="ghost" size="sm" onClick={loadLoginHistory}>Load</Button>}
          </div>
        </CardHeader>
        {historyLoaded && (
          <CardBody>
            {loginHistory.length === 0
              ? <p className="text-sm text-slate-400 text-center py-4">No login history found</p>
              : (
                <div className="space-y-2">
                  {loginHistory.map(h => (
                    <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm"><Monitor size={14} className="text-slate-500"/></div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {h.browser || 'Unknown Browser'} on {h.osName || 'Unknown OS'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {h.loginAt ? format(new Date(h.loginAt),'MMM d, yyyy HH:mm') : '—'} · {h.ipAddress || '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${h.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </CardBody>
        )}
      </Card>
    </div>
  )
}
export default ProfilePage
