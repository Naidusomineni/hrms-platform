import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../../store/slices/authSlice'
import { Input, Button, Select } from '../../components/common/index.jsx'
import { Briefcase } from 'lucide-react'

const schema = yup.object({
  firstName: yup.string().min(2).max(50).required('First name is required'),
  lastName:  yup.string().min(2).max(50).required('Last name is required'),
  email:     yup.string().email().required('Email is required'),
  password:  yup.string().min(8).required('Password is required'),
  role:      yup.string().required('Role is required'),
})

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading } = useSelector(s => s.auth)
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data))
    if (registerUser.fulfilled.match(result)) navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 gradient-primary rounded-2xl shadow-lg mb-4">
            <Briefcase size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-1">Join the HRMS platform</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input {...register('firstName')} label="First Name" placeholder="John" error={errors.firstName?.message} required />
              <Input {...register('lastName')} label="Last Name" placeholder="Doe" error={errors.lastName?.message} required />
            </div>
            <Input {...register('email')} label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} required />
            <Input {...register('password')} label="Password" type="password" placeholder="Min 8 characters" error={errors.password?.message} required />
            <Select {...register('role')} label="Role" error={errors.role?.message} required>
              <option value="">Select role</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_HR">HR</option>
              <option value="ROLE_EMPLOYEE">Employee</option>
            </Select>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-2">Create Account</Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
export default RegisterPage
