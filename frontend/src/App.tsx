import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { refreshAccessToken } from './store/slices/authSlice';
import { fetchTenantBranding } from './store/slices/tenantSlice';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Modular Auth Pages (Lazy Loaded for high performance chunking)
const LoginPage = lazy(() => import('./modules/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./modules/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./modules/auth/pages/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./modules/auth/pages/VerifyEmailPage'));
const FirstLoginChangePasswordPage = lazy(() => import('./modules/auth/pages/FirstLoginChangePasswordPage'));

// Modular Domain Feature Pages (Lazy Loaded)
const DashboardPage = lazy(() => import('./modules/dashboard/pages/DashboardPage'));
const EmployeeListPage = lazy(() => import('./modules/employee/pages/EmployeeListPage'));
const EmployeeFormPage = lazy(() => import('./modules/employee/pages/EmployeeFormPage'));
const EmployeeDetailPage = lazy(() => import('./modules/employee/pages/EmployeeDetailPage'));
const DepartmentPage = lazy(() => import('./modules/department/pages/DepartmentPage'));
const AttendancePage = lazy(() => import('./modules/attendance/pages/AttendancePage'));
const LeavePage = lazy(() => import('./modules/leave/pages/LeavePage'));
const ApprovalsPage = lazy(() => import('./modules/workflow/pages/ApprovalsPage'));
const DocumentVaultPage = lazy(() => import('./modules/document/pages/DocumentVaultPage'));
const RequestsPage = lazy(() => import('./modules/request/pages/RequestsPage'));
const PayrollPage = lazy(() => import('./modules/payroll/pages/PayrollPage'));
const NotificationPage = lazy(() => import('./modules/notification/pages/NotificationPage'));
const ProfilePage = lazy(() => import('./modules/profile/pages/ProfilePage'));
const TenantAdminPage = lazy(() => import('./modules/tenant/pages/TenantAdminPage'));
const PolicyConfigPage = lazy(() => import('./modules/tenant/pages/PolicyConfigPage'));

// Phase 3 & 4 Modules (Lazy Loaded)
const PerformancePage = lazy(() => import('./modules/performance/pages/PerformancePage'));
const RecruitmentPage = lazy(() => import('./modules/recruitment/pages/RecruitmentPage'));
const AssetPage = lazy(() => import('./modules/asset/pages/AssetPage'));
const ReportsPage = lazy(() => import('./modules/report/pages/ReportsPage'));
const HelpdeskPage = lazy(() => import('./modules/helpdesk/pages/HelpdeskPage'));
const AnnouncementsPage = lazy(() => import('./modules/communication/pages/AnnouncementsPage'));
const ShiftRosterPage = lazy(() => import('./modules/shift/pages/ShiftRosterPage'));

// Phase 4 Modules (Lazy Loaded)
const OffboardingPage = lazy(() => import('./modules/offboarding/pages/OffboardingPage'));
const WorkforceIntelligencePage = lazy(() => import('./modules/intelligence/pages/WorkforceIntelligencePage'));
const ExpenseClaimsPage = lazy(() => import('./modules/expense/pages/ExpenseClaimsPage'));

// Phase 7 Modules (Native Live Video Interviews)
const CandidateLobbyPage = lazy(() => import('./modules/recruitment/pages/CandidateLobbyPage'));
const LiveInterviewRoomPage = lazy(() => import('./modules/recruitment/pages/LiveInterviewRoomPage'));

// Global Fallback Loading Indicator for code-split route chunks
const RouteLoadingFallback: React.FC = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading module...</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchTenantBranding() as any);
    const rt = localStorage.getItem('refreshToken');
    if (rt && !isAuthenticated) {
      dispatch(refreshAccessToken() as any);
    }
  }, [dispatch, isAuthenticated]);

  const homeRoute = user?.mustChangePassword
    ? '/first-login-change-password'
    : user?.role === 'ROLE_EMPLOYEE'
    ? '/profile'
    : '/dashboard';

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>

      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={homeRoute} replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route
        path="/first-login-change-password"
        element={isAuthenticated ? <FirstLoginChangePasswordPage /> : <Navigate to="/login" replace />}
      />

      {/* Candidate Public Guest Interview Routes */}
      <Route path="/interview/guest/:guestToken" element={<CandidateLobbyPage />} />
      <Route path="/interview/guest/:guestToken/room" element={<LiveInterviewRoomPage isGuest={true} />} />

      {/* Full-Screen In-App Interview Workspace for Evaluator */}
      <Route
        path="/recruitment/interview/:sessionId"
        element={
          <ProtectedRoute>
            <LiveInterviewRoomPage isGuest={false} />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={homeRoute} replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="approvals" element={<ProtectedRoute moduleKey="APPROVALS"><ApprovalsPage /></ProtectedRoute>} />
        <Route path="requests" element={<ProtectedRoute moduleKey="REQUESTS"><RequestsPage /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute moduleKey="ATTENDANCE"><AttendancePage /></ProtectedRoute>} />
        <Route path="shifts" element={<ProtectedRoute moduleKey="SHIFTS"><ShiftRosterPage /></ProtectedRoute>} />
        <Route path="intelligence" element={<ProtectedRoute moduleKey="INTELLIGENCE"><WorkforceIntelligencePage /></ProtectedRoute>} />
        <Route path="leaves" element={<ProtectedRoute moduleKey="LEAVES"><LeavePage /></ProtectedRoute>} />
        <Route path="documents" element={<ProtectedRoute moduleKey="DOCUMENTS"><DocumentVaultPage /></ProtectedRoute>} />
        <Route path="employees" element={<ProtectedRoute moduleKey="EMPLOYEES"><EmployeeListPage /></ProtectedRoute>} />
        <Route
          path="employees/new"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN']} moduleKey="EMPLOYEES">
              <EmployeeFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="employees/:id" element={<ProtectedRoute moduleKey="EMPLOYEES"><EmployeeDetailPage /></ProtectedRoute>} />
        <Route
          path="employees/:id/edit"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN']} moduleKey="EMPLOYEES">
              <EmployeeFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="departments" element={<ProtectedRoute moduleKey="DEPARTMENTS"><DepartmentPage /></ProtectedRoute>} />
        <Route path="payroll" element={<ProtectedRoute moduleKey="PAYROLL"><PayrollPage /></ProtectedRoute>} />
        <Route path="expenses" element={<ProtectedRoute moduleKey="EXPENSES"><ExpenseClaimsPage /></ProtectedRoute>} />
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="performance" element={<ProtectedRoute moduleKey="PERFORMANCE"><PerformancePage /></ProtectedRoute>} />
        <Route path="recruitment" element={<ProtectedRoute moduleKey="RECRUITMENT"><RecruitmentPage /></ProtectedRoute>} />
        <Route path="assets" element={<ProtectedRoute moduleKey="ASSETS"><AssetPage /></ProtectedRoute>} />
        <Route path="helpdesk" element={<ProtectedRoute moduleKey="HELPDESK"><HelpdeskPage /></ProtectedRoute>} />
        <Route path="announcements" element={<ProtectedRoute moduleKey="COMMUNICATION"><AnnouncementsPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute moduleKey="REPORTS"><ReportsPage /></ProtectedRoute>} />
        <Route path="offboarding" element={<ProtectedRoute moduleKey="OFFBOARDING"><OffboardingPage /></ProtectedRoute>} />
        <Route
          path="policies"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_HR']}>
              <PolicyConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_IT_ADMIN']}>
              <TenantAdminPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <h1 className="text-8xl font-black text-slate-200">404</h1>
            <p className="text-slate-500 mt-2 mb-6">Page not found</p>
            <a href="/dashboard" className="btn-primary">
              ← Back to Dashboard
            </a>
          </div>
        }
      />
    </Routes>
    </Suspense>
  );
};

export default App;

