import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { attendanceAPI } from '../../api/attendanceAPI'
import { Modal, Button } from '../common/index.jsx'
import {
  LayoutDashboard, Users, Building2, Clock, CalendarDays,
  DollarSign, User, LogOut, ChevronLeft, ChevronRight,
  Briefcase, Shield, BarChart3, CheckSquare, FileText, Send,
  Target, Laptop, AlertCircle, XCircle, UserMinus, LifeBuoy, Megaphone, CalendarClock, BrainCircuit, Receipt, Sparkles
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NAV_GROUPS = [
  {
    title: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    ]
  },
  {
    title: 'Time & Attendance',
    items: [
      { path: '/attendance', label: 'Attendance', icon: Clock, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/shifts', label: 'Shift & Roster', icon: CalendarClock, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/leaves', label: 'Leave Management', icon: CalendarDays, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    ]
  },
  {
    title: 'Organization',
    items: [
      { path: '/approvals', label: 'Approvals Inbox', icon: CheckSquare, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
      { path: '/requests', label: 'My Requests', icon: Send, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/employees', label: 'Employees', icon: Users, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
      { path: '/departments', label: 'Departments', icon: Building2, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR'] },
      { path: '/documents', label: 'Document Vault', icon: FileText, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    ]
  },
  {
    title: 'Talent & HR',
    items: [
      { path: '/recruitment', label: 'Recruitment / ATS', icon: Briefcase, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
      { path: '/performance', label: 'Performance & OKR', icon: Target, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/intelligence', label: 'AI HR & Insights', icon: BrainCircuit, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/offboarding', label: 'Offboarding & F&F', icon: UserMinus, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    ]
  },
  {
    title: 'Finance & Ops',
    items: [
      { path: '/payroll', label: 'Payroll', icon: DollarSign, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/expenses', label: 'Expense Claims', icon: Receipt, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/assets', label: 'Assets & Hardware', icon: Laptop, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/helpdesk', label: 'IT Service Desk', icon: LifeBuoy, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
      { path: '/reports', label: 'Reports & Tax BI', icon: BarChart3, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    ]
  },
  {
    title: 'System',
    items: [
      { path: '/admin', label: 'Admin Panel', icon: Shield, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'] },
      { path: '/profile', label: 'My Profile', icon: User, roles: ['ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    ]
  }
]

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarOpen } = useSelector(s => s.ui)
  const { user } = useSelector(s => s.auth)
  const { tenant } = useSelector(s => s.tenant)

  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [activeShiftInfo, setActiveShiftInfo] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  // Smart Logout Flow
  const handleLogoutClick = async () => {
    if (!user?.employeeId) {
      await directSignOut()
      return
    }

    try {
      const res = await attendanceAPI.getTodayStatus(user.employeeId)
      const data = res.data?.data
      if (data && data.checkInTime && !data.checkOutTime) {
        setActiveShiftInfo(data)
        setLogoutModalOpen(true)
        return
      }
    } catch {
      // ignore
    }

    await directSignOut()
  }

  const directSignOut = async () => {
    setLoggingOut(true)
    try {
      await dispatch(logoutUser())
      navigate('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleClockOutAndSignOut = async () => {
    setLoggingOut(true)
    try {
      if (user?.employeeId) {
        await attendanceAPI.punch({
          employeeId: user.employeeId,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm:ss'),
          punchType: 'CHECK_OUT',
          latitude: 0.0,
          longitude: 0.0,
          remarks: 'Auto clocked-out during portal sign-out'
        }).catch(() => {})
        toast.success('Shift closed & punched out successfully!')
      }
      await dispatch(logoutUser())
      navigate('/login')
    } finally {
      setLoggingOut(false)
      setLogoutModalOpen(false)
    }
  }

  const roleLabel = user?.role?.replace('ROLE_', '') || 'USER'
  const roleColors = {
    SUPER_ADMIN: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    ADMIN: 'bg-red-500/20 text-red-300 border border-red-500/30',
    HR: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    MANAGER: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    EMPLOYEE: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  }

  // Filter groups and items by user role
  const filteredGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(user?.role))
  })).filter(group => group.items.length > 0)

  // Clean company display name (avoid awkward truncation)
  const companyShortName = tenant?.name
    ? (tenant.name.length > 20 ? tenant.name.split(' ').slice(0, 2).join(' ') : tenant.name)
    : 'HRMS Platform'

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col z-40 transition-all duration-300 border-r border-slate-800/80 shadow-2xl',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* 1. Tenant Brand Header (White-Labeled) */}
      <div className={clsx(
        "flex items-center h-16 border-b border-slate-800/80 transition-all duration-300 shrink-0",
        sidebarOpen ? "justify-between px-4" : "justify-center px-2"
      )}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name || 'Company Logo'}
                className="h-8 max-w-[105px] object-contain shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-md font-black text-white text-sm shrink-0">
                {tenant?.name ? tenant.name.charAt(0).toUpperCase() : <Briefcase size={16} className="text-white" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white text-sm block truncate leading-tight" title={tenant?.name || 'HRMS'}>
                {companyShortName}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium truncate flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                {tenant?.subscriptionTier || 'ENTERPRISE'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => dispatch(toggleSidebar())}
            title={`${tenant?.name || 'HRMS'} (Click to expand)`}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md text-white font-bold text-sm cursor-pointer hover:scale-105 transition-all shrink-0"
          >
            {tenant?.name ? tenant.name.charAt(0).toUpperCase() : 'H'}
          </button>
        )}

        {sidebarOpen && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 ml-1"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* 2. Grouped Navigation with Tenant Brand Styling */}
      <nav className={clsx(
        "flex-1 py-3 transition-all overflow-x-hidden",
        sidebarOpen ? "overflow-y-auto sidebar-scroll px-3 space-y-4" : "overflow-y-auto no-scrollbar px-2 space-y-3"
      )}>
        {filteredGroups.map((group, gIdx) => (
          <div key={group.title || gIdx} className="space-y-0.5">
            {sidebarOpen ? (
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none">
                {group.title}
              </div>
            ) : (
              gIdx > 0 && <div className="w-6 h-[1px] bg-slate-800 mx-auto my-2" />
            )}

            {group.items.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!sidebarOpen ? item.label : undefined}
                  className={({ isActive }) => clsx(
                    'sidebar-link group relative',
                    sidebarOpen
                      ? 'gap-3 px-3 py-2 rounded-xl text-[13.5px]'
                      : 'justify-center w-10 h-10 mx-auto rounded-xl p-0',
                    isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {/* Left Brand Active Indicator Bar */}
                      {isActive && sidebarOpen && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary-500 rounded-r-full shadow-sm" />
                      )}

                      <Icon
                        size={18}
                        className={clsx(
                          "shrink-0 sidebar-icon transition-colors",
                          isActive ? "text-primary-400" : "text-slate-400 group-hover:text-slate-200"
                        )}
                      />

                      {sidebarOpen && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* 3. User Identity & Clean Logout Footer */}
      <div className={clsx(
        "border-t border-slate-800/80 transition-all shrink-0 bg-slate-900/90",
        sidebarOpen ? "p-3 space-y-2" : "py-3 px-2 flex flex-col items-center gap-2"
      )}>
        {sidebarOpen ? (
          user && (
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-800/70 border border-slate-750">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary-600 flex items-center justify-center font-bold text-xs shrink-0 text-white border border-slate-700">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <span>{user.fullName?.charAt(0) || 'U'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">{user.fullName}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={clsx('text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider', roleColors[roleLabel] || roleColors.EMPLOYEE)}>
                    {roleLabel}
                  </span>
                </div>
              </div>
            </div>
          )
        ) : (
          user && (
            <div
              className="w-10 h-10 rounded-xl overflow-hidden bg-primary-600 flex items-center justify-center font-bold text-xs shrink-0 text-white border border-slate-700 cursor-pointer shadow-sm hover:scale-105 transition-all"
              title={`${user.fullName} (${roleLabel})`}
              onClick={() => navigate('/profile')}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <span>{user.fullName?.charAt(0) || 'U'}</span>
              )}
            </div>
          )
        )}

        <button
          onClick={handleLogoutClick}
          disabled={loggingOut}
          className={clsx(
            "transition-all duration-150 text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium cursor-pointer flex items-center",
            sidebarOpen
              ? "gap-2.5 w-full px-3 py-1.5 rounded-lg text-xs"
              : "justify-center w-10 h-10 mx-auto rounded-xl p-0"
          )}
          title={!sidebarOpen ? 'Sign Out' : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {sidebarOpen && <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>}
        </button>
      </div>

      {/* Smart Workday Logout Modal */}
      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Active Workday Session In Progress"
      >
        <div className="space-y-4 text-slate-800">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-sm text-amber-950 mb-0.5">You are currently clocked in</p>
              Your shift was started today at <strong>{activeShiftInfo?.checkInTime}</strong>.
              Would you like to punch out your shift before logging out?
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              variant="primary"
              loading={loggingOut}
              onClick={handleClockOutAndSignOut}
              className="w-full bg-rose-600 hover:bg-rose-700 py-3 flex items-center justify-center gap-2 font-bold"
            >
              <XCircle size={16} /> Clock Out & Sign Out
            </Button>

            <Button
              variant="secondary"
              loading={loggingOut}
              onClick={directSignOut}
              className="w-full py-2.5 text-xs text-slate-600 hover:text-slate-900"
            >
              Sign Out Only (Keep Working Hours Running)
            </Button>

            <button
              type="button"
              onClick={() => setLogoutModalOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 py-1 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  )
}

export default Sidebar