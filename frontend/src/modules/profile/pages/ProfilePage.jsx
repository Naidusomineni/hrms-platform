import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../../api/authAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { updateCurrentUser, logoutUser } from '../../../store/slices/authSlice'
import { Input, Button, Card, CardHeader, CardBody, Alert, Spinner } from '../../../components/common/index.jsx'
import { User, Lock, Shield, Mail, Clock, Monitor, UploadCloud, FileText, Camera, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const pwSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(8,'Min 8 characters').required('New password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('newPassword')],'Passwords do not match').required(),
})

const ProfilePage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
  const photoInputRef = useRef(null)

  const [changingPw, setChangingPw] = useState(false)
  const [loginHistory, setLoginHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [employeeDetails, setEmployeeDetails] = useState(null)
  const [loadingEmployee, setLoadingEmployee] = useState(true)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageVersion, setImageVersion] = useState(Date.now())

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(pwSchema)
  })

  const onChangePassword = async (data) => {
    try {
      await authAPI.changePassword(user?.userId, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully! Redirecting to login...')
      reset()
      setChangingPw(false)
      setTimeout(() => {
        dispatch(logoutUser())
        navigate('/login')
      }, 1500)
    } catch (err) {
      toast.error(err.userFriendlyMessage || err.response?.data?.message || 'Failed to change password')
    }
  }

  const fetchEmployee = async () => {
    try {
      const res = user?.employeeId ? await employeeAPI.getById(user.employeeId) : await employeeAPI.getMe()
      const emp = res.data?.data
      if (emp) {
        setEmployeeDetails(emp)
        setImageError(false)
        const updates = {}
        if (emp.email && emp.email !== user?.email) updates.email = emp.email
        if (emp.fullName && emp.fullName !== user?.fullName) updates.fullName = emp.fullName
        if (emp.profilePictureUrl && emp.profilePictureUrl !== user?.profilePicture) updates.profilePicture = emp.profilePictureUrl
        if (emp.id && emp.id !== user?.employeeId) updates.employeeId = emp.id
        if (Object.keys(updates).length > 0) {
          dispatch(updateCurrentUser(updates))
        }
      }
    } catch {
      // User may not have an employee record yet
    } finally {
      setLoadingEmployee(false)
    }
  }

  useEffect(() => {
    fetchEmployee()
  }, [user?.employeeId, user?.userId])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WEBP image')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingPhoto(true)
      const res = await employeeAPI.uploadPhoto(user?.employeeId, formData)
      const emp = res.data?.data
      if (emp) {
        setEmployeeDetails(emp)
        setImageError(false)
        setImageVersion(Date.now())
        if (emp.profilePictureUrl) {
          dispatch(updateCurrentUser({ profilePicture: emp.profilePictureUrl }))
        }
      }
      toast.success('Profile picture updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingPhoto(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingDoc(true)
      const res = await employeeAPI.uploadDoc(user?.employeeId, formData)
      setEmployeeDetails(res.data?.data)
      toast.success('Document uploaded successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingDoc(false)
      if (e.target) e.target.value = ''
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
    ROLE_SUPER_ADMIN: 'bg-purple-600',
    ROLE_ADMIN: 'bg-blue-600',
    ROLE_HR: 'bg-indigo-600',
    ROLE_MANAGER: 'bg-amber-600',
    ROLE_EMPLOYEE: 'bg-emerald-600'
  }

  const displayName = employeeDetails?.fullName || user?.fullName || 'User'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const rawPhoto = employeeDetails?.profilePictureUrl || user?.profilePicture
  const displayPhoto = rawPhoto && !imageError
    ? `${rawPhoto}${rawPhoto.includes('?') ? '&' : '?'}v=${imageVersion}`
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
      </div>

      {/* Profile Hero Card */}
      <Card>
        <CardBody className="py-6 px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Container with Hover Upload */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-sm border-2 border-white ring-2 ring-slate-200/80 bg-slate-100 flex items-center justify-center">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-white text-2xl font-bold tracking-wider ${roleColors[user?.role] || 'bg-blue-600'}`}>
                    {initials}
                  </div>
                )}
              </div>

              {/* Instant Camera Hover Button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                title="Change profile picture"
                className="absolute inset-0 rounded-2xl bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white cursor-pointer"
              >
                {uploadingPhoto ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Camera size={20} />
                    <span className="text-[10px] font-semibold tracking-wide">Change</span>
                  </>
                )}
              </button>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadingPhoto}
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 truncate">{displayName}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">{employeeDetails?.email || user?.email}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                  loading={uploadingPhoto}
                  className="text-xs self-center sm:self-start"
                >
                  <Camera size={14} />
                  Change Photo
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                  {user?.role?.replace('ROLE_','')}
                </span>
                {employeeDetails?.employeeNumber && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    {employeeDetails.employeeNumber}
                  </span>
                )}
                {employeeDetails?.departmentName && (
                  <span className="text-xs text-slate-500">
                    • {employeeDetails.departmentName}
                  </span>
                )}
                {user?.emailVerified ? (
                  <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Shield size={11}/> Verified
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
                    Email Unverified
                  </span>
                )}
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
            { icon: Mail, label:'Email Address', value: employeeDetails?.email || user?.email },
            { icon: Shield, label:'System Role', value: user?.role?.replace('ROLE_','') },
            { icon: User, label:'Full Name', value: displayName },
            { icon: Clock, label:'Designation', value: employeeDetails?.designation || 'Staff Member' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100"><Icon size={15} className="text-slate-500"/></div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{value || '—'}</p>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Profile Media & Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg"><UploadCloud size={16} className="text-slate-600"/></div>
            <h3 className="font-bold text-slate-800">Profile Media & Files</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Photo upload item */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-400 font-bold text-sm">{initials}</div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Profile Photo</p>
                <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, or WEBP up to 5MB</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {rawPhoto && (
                <a
                  href={rawPhoto}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  <ExternalLink size={13} /> View
                </a>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
                loading={uploadingPhoto}
              >
                <UploadCloud size={14} />
                {rawPhoto ? 'Upload New' : 'Upload Photo'}
              </Button>
            </div>
          </div>

          {/* Resume / Document item */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Official Resume / Document</p>
                <p className="text-xs text-slate-500 mt-0.5">PDF, DOC, or DOCX formats</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {employeeDetails?.resumeUrl && (
                <a
                  href={employeeDetails.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  <ExternalLink size={13} /> View File
                </a>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  disabled={uploadingDoc}
                  onChange={handleDocumentUpload}
                />
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition">
                  <UploadCloud size={14} />
                  {uploadingDoc ? 'Uploading...' : (employeeDetails?.resumeUrl ? 'Replace File' : 'Upload File')}
                </span>
              </label>
            </div>
          </div>
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
                    <div key={h.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100"><Monitor size={14} className="text-slate-500"/></div>
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
