import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSelector } from 'react-redux'
import { authAPI } from '../api/authAPI'
import { employeeAPI } from '../api/employeeAPI'
import { Input, Button, Card, CardHeader, CardBody, Alert, Spinner } from '../components/common/index.jsx'
import { User, Lock, Shield, Mail, Clock, Monitor, UploadCloud, FileText } from 'lucide-react'
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
  const [employeeDetails, setEmployeeDetails] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

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

  const fetchEmployee = async () => {
    if (!user?.employeeId) {
      setLoadingEmployee(false)
      return
    }
    try {
      const res = await employeeAPI.getById(user.employeeId)
      setEmployeeDetails(res.data.data)
    } catch {
      toast.error('Failed to load profile details')
    } finally {
      setLoadingEmployee(false)
    }
  }

  useEffect(() => {
    fetchEmployee()
  }, [user?.employeeId])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image')
      return
    }
    if (!user?.employeeId) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingPhoto(true)
      const res = await employeeAPI.uploadPhoto(user.employeeId, formData)
      setEmployeeDetails(res.data.data)
      toast.success('Profile picture uploaded successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingPhoto(false)
      e.target.value = null
    }
  }

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file')
      return
    }
    if (!user?.employeeId) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingDoc(true)
      const res = await employeeAPI.uploadDoc(user.employeeId, formData)
      setEmployeeDetails(res.data.data)
      toast.success('Document uploaded successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingDoc(false)
      e.target.value = null
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
            <div className={`w-20 h-20 ${roleColors[user?.role] || 'gradient-primary'} rounded-2xl overflow-hidden shadow-lg`}>
              {employeeDetails?.profilePictureUrl
                ? <img src={employeeDetails.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                : <div className="flex items-center justify-center w-full h-full text-white text-3xl font-black">{user?.fullName?.charAt(0)}</div>
              }
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg"><UploadCloud size={16} className="text-slate-600"/></div>
            <h3 className="font-bold text-slate-800">Profile Uploads</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {user?.employeeId ? (
            <>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-600">Profile Picture</p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingPhoto}
                  onChange={handlePhotoUpload}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                />
                {employeeDetails?.profilePictureUrl && (
                  <a href={employeeDetails.profilePictureUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">View current profile image</a>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-600">Resume / Document</p>
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  disabled={uploadingDoc}
                  onChange={handleDocumentUpload}
                  className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-700"
                />
                {employeeDetails?.resumeUrl && (
                  <a href={employeeDetails.resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">Download uploaded document</a>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Upload support is available once your employee record is linked.</p>
          )}
        </CardBody>
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
