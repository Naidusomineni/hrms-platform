import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { refreshAccessToken } from './store/slices/authSlice'
import { fetchTenantBranding } from './store/slices/tenantSlice'
import ProtectedRoute from './routes/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'

// Modular Auth Pages
import LoginPage from './modules/auth/pages/LoginPage'
import RegisterPage from './modules/auth/pages/RegisterPage'
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage'
import VerifyEmailPage from './modules/auth/pages/VerifyEmailPage'
import FirstLoginChangePasswordPage from './modules/auth/pages/FirstLoginChangePasswordPage'

// Modular Domain Feature Pages
import DashboardPage from './modules/dashboard/pages/DashboardPage'
import EmployeeListPage from './modules/employee/pages/EmployeeListPage'
import EmployeeFormPage from './modules/employee/pages/EmployeeFormPage'
import EmployeeDetailPage from './modules/employee/pages/EmployeeDetailPage'
import DepartmentPage from './modules/department/pages/DepartmentPage'
import AttendancePage from './modules/attendance/pages/AttendancePage'
import LeavePage from './modules/leave/pages/LeavePage'
import ApprovalsPage from './modules/workflow/pages/ApprovalsPage'
import DocumentVaultPage from './modules/document/pages/DocumentVaultPage'
import RequestsPage from './modules/request/pages/RequestsPage'
import PayrollPage from './modules/payroll/pages/PayrollPage'
import NotificationPage from './modules/notification/pages/NotificationPage'
import ProfilePage from './modules/profile/pages/ProfilePage'
import TenantAdminPage from './modules/tenant/pages/TenantAdminPage'

// Phase 3 & 4 Modules
import PerformancePage from './modules/performance/pages/PerformancePage'
import RecruitmentPage from './modules/recruitment/pages/RecruitmentPage'
import AssetPage from './modules/asset/pages/AssetPage'
import ReportsPage from './modules/report/pages/ReportsPage'
import HelpdeskPage from './modules/helpdesk/pages/HelpdeskPage'
import AnnouncementsPage from './modules/communication/pages/AnnouncementsPage'
import ShiftRosterPage from './modules/shift/pages/ShiftRosterPage'

// Phase 4 Modules
import OffboardingPage from './modules/offboarding/pages/OffboardingPage'
import WorkforceIntelligencePage from './modules/intelligence/pages/WorkforceIntelligencePage'
import ExpenseClaimsPage from './modules/expense/pages/ExpenseClaimsPage'

// Phase 7 Modules (Native Live Video Interviews)
import CandidateLobbyPage from './modules/recruitment/pages/CandidateLobbyPage'
import LiveInterviewRoomPage from './modules/recruitment/pages/LiveInterviewRoomPage'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(fetchTenantBranding())
    const rt = localStorage.getItem('refreshToken')
    if (rt && !isAuthenticated) dispatch(refreshAccessToken())
  }, [])

  const homeRoute = user?.mustChangePassword
    ? '/first-login-change-password'
    : (user?.role === 'ROLE_EMPLOYEE' ? '/profile' : '/dashboard')

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/first-login-change-password" element={isAuthenticated ? <FirstLoginChangePasswordPage /> : <Navigate to="/login" replace />} />

      {/* Candidate Public Guest Interview Routes */}
      <Route path="/interview/guest/:guestToken" element={<CandidateLobbyPage />} />
      <Route path="/interview/guest/:guestToken/room" element={<LiveInterviewRoomPage isGuest={true} />} />

      {/* Full-Screen In-App Interview Workspace for Evaluator */}
      <Route path="/recruitment/interview/:sessionId" element={
        <ProtectedRoute>
          <LiveInterviewRoomPage isGuest={false} />
        </ProtectedRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to={homeRoute} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="shifts" element={<ShiftRosterPage />} />
        <Route path="intelligence" element={<WorkforceIntelligencePage />} />
        <Route path="leaves" element={<LeavePage />} />
        <Route path="documents" element={<DocumentVaultPage />} />
        <Route path="employees" element={<EmployeeListPage />} />
        <Route path="employees/new" element={
          <ProtectedRoute roles={['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN']}>
            <EmployeeFormPage />
          </ProtectedRoute>
        } />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="employees/:id/edit" element={
          <ProtectedRoute roles={['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN']}>
            <EmployeeFormPage />
          </ProtectedRoute>
        } />
        <Route path="departments" element={<DepartmentPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="expenses" element={<ExpenseClaimsPage />} />
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="performance" element={<PerformancePage />} />
        <Route path="recruitment" element={<RecruitmentPage />} />
        <Route path="assets" element={<AssetPage />} />
        <Route path="helpdesk" element={<HelpdeskPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="offboarding" element={<OffboardingPage />} />
        <Route path="admin" element={
          <ProtectedRoute roles={['ROLE_ADMIN','ROLE_SUPER_ADMIN','ROLE_IT_ADMIN']}>
            <TenantAdminPage />
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
