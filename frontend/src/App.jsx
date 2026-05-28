import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAccessToken } from './store/slices/authSlice'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'

// Auth pages
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ForgotPasswordPage from './features/auth/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/ResetPasswordPage'
import VerifyEmailPage from './features/auth/VerifyEmailPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import EmployeeListPage from './features/employees/EmployeeListPage'
import EmployeeFormPage from './features/employees/EmployeeFormPage'
import EmployeeDetailPage from './features/employees/EmployeeDetailPage'
import DepartmentPage from './features/departments/DepartmentPage'
import AttendancePage from './features/attendance/AttendancePage'
import LeavePage from './features/leave/LeavePage'
import PayrollPage from './features/payroll/PayrollPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './features/admin/AdminPage'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(s => s.auth)

  useEffect(() => {
    const rt = localStorage.getItem('refreshToken')
    if (rt && !isAuthenticated) dispatch(refreshAccessToken())
  }, [])

  const homeRoute = user?.role === 'ROLE_EMPLOYEE' ? '/profile' : '/dashboard'

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to={homeRoute} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/new" element={<EmployeeFormPage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
        <Route path="departments" element={<DepartmentPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="admin" element={
          <ProtectedRoute roles={['ROLE_ADMIN','ROLE_SUPER_ADMIN']}>
            <AdminPage />
          </ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
          <h1 className="text-8xl font-black text-slate-200">404</h1>
          <p className="text-slate-500 mt-2 mb-6">Page not found</p>
          <a href="/dashboard" className="btn-primary">← Back to Dashboard</a>
        </div>
      } />
    </Routes>
  )
}
export default App
