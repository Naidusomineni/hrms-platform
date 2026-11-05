import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { attendanceAPI } from '../../api/attendanceAPI'
import { Modal, Button } from '../common/index.jsx'
import {
  LayoutDashboard, Users, Building2, Clock, CalendarDays,
  DollarSign, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Briefcase, Shield, BarChart3, CheckSquare, FileText, Send,
  Target, Laptop, AlertCircle, XCircle, UserMinus, LifeBuoy, Megaphone, CalendarClock, BrainCircuit, Receipt
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const NAV = [
  { path:'/dashboard',   label:'Dashboard',       icon:LayoutDashboard, roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/approvals',   label:'Approvals Inbox', icon:CheckSquare,     roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'] },
  { path:'/requests',    label:'My Requests',     icon:Send,            roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/attendance',  label:'Attendance',      icon:Clock,           roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/shifts',      label:'Shift & Roster',  icon:CalendarClock,   roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/intelligence',label:'AI HR & Insights',icon:BrainCircuit,   roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/leaves',      label:'Leave',           icon:CalendarDays,    roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/documents',   label:'Document Vault',  icon:FileText,        roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/announcements',label:'Announcements',  icon:Megaphone,       roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/employees',   label:'Employees',       icon:Users,           roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'] },
  { path:'/departments', label:'Departments',     icon:Building2,       roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR'] },
  { path:'/payroll',     label:'Payroll',         icon:DollarSign,      roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/expenses',    label:'Expense Claims',  icon:Receipt,         roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/performance', label:'Performance & OKR',icon:Target,        roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/recruitment', label:'Recruitment / ATS',icon:Briefcase,     roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'] },
  { path:'/assets',      label:'Assets & Hardware',icon:Laptop,        roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/helpdesk',    label:'IT Service Desk', icon:LifeBuoy,      roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/reports',     label:'Reports & Tax BI', icon:BarChart3,      roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/offboarding', label:'Offboarding & F&F',icon:UserMinus,      roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/profile',     label:'My Profile',      icon:User,            roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/admin',       label:'Admin Panel',     icon:Shield,          roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN'] },
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

  const visibleNav = NAV.filter(n => n.roles.includes(user?.role))

  // Smart Logout Flow (Option A)
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

  const roleLabel = user?.role?.replace('ROLE_','') || 'USER'
  const roleColors = {
    SUPER_ADMIN: 'bg-purple-500/20 text-purple-300',
    ADMIN: 'bg-red-500/20 text-red-300',
    HR: 'bg-blue-500/20 text-blue-300',
    MANAGER: 'bg-amber-500/20 text-amber-300',
    EMPLOYEE: 'bg-emerald-500/20 text-emerald-300',
  }

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col z-40 transition-all duration-300 shadow-xl',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo & Tenant Identity */}
      <div className={clsx(
        "flex items-center h-16 border-b border-slate-800 transition-all duration-300 shrink-0",
        sidebarOpen ? "justify-between px-4" : "justify-center px-2"
      )}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            {tenant?.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name || 'Company Logo'}
                className="h-8 max-w-[120px] object-contain rounded bg-white/10 p-0.5 shrink-0"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg font-black text-white text-sm shrink-0">
                {tenant?.name ? tenant.name.charAt(0).toUpperCase() : <Briefcase size={16} className="text-white" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="font-bold text-white text-sm block truncate" title={tenant?.name || 'HRMS'}>
                {tenant?.name || 'HRMS'}
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium truncate">
                {tenant?.domain ? tenant.domain : 'Enterprise'}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => dispatch(toggleSidebar())}
            title={tenant?.name || 'Expand Sidebar'}
            className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md text-white font-bold text-sm cursor-pointer hover:scale-105 transition-all group relative shrink-0"
          >
            {tenant?.name ? tenant.name.charAt(0).toUpperCase() : 'H'}
            <div className="fixed left-16 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity shadow-xl border border-slate-700 font-normal">
              {tenant?.name || 'Expand Sidebar'}
            </div>
          </button>
        )}

        {sidebarOpen && (
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white shrink-0 ml-2"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={clsx(
        "flex-1 py-3 space-y-1 transition-all overflow-x-hidden",
        sidebarOpen ? "overflow-y-auto sidebar-scroll px-3" : "overflow-y-auto no-scrollbar px-2"
      )}>
        {visibleNav.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={!sidebarOpen ? item.label : undefined}
              className={({ isActive }) => clsx(
                'group relative transition-all duration-150 flex items-center font-medium text-sm',
                sidebarOpen
                  ? 'gap-3 px-3 py-2.5 rounded-xl'
                  : 'justify-center w-10 h-10 mx-auto rounded-xl p-0',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={19} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {!sidebarOpen && (
                <div className="fixed left-16 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs
                  rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none
                  z-50 transition-opacity shadow-xl border border-slate-700 font-medium">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User info + Logout */}
      <div className={clsx(
        "border-t border-slate-800 transition-all shrink-0",
        sidebarOpen ? "p-3" : "py-3 px-2 flex flex-col items-center gap-2"
      )}>
        {sidebarOpen ? (
          user && (
            <div className="flex items-center gap-3 mb-3 px-2 py-2.5 rounded-xl bg-slate-800/90 border border-slate-750">
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
                <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-semibold', roleColors[roleLabel] || roleColors.EMPLOYEE)}>
                  {roleLabel}
                </span>
              </div>
            </div>
          )
        ) : (
          user && (
            <div
              className="w-10 h-10 rounded-xl overflow-hidden bg-primary-600 flex items-center justify-center font-bold text-xs shrink-0 text-white border border-slate-700 cursor-pointer group relative shadow-sm"
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
              <div className="fixed left-16 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity shadow-xl border border-slate-700">
                {user.fullName} <span className="text-slate-400">({roleLabel})</span>
              </div>
            </div>
          )
        )}

        <button
          onClick={handleLogoutClick}
          disabled={loggingOut}
          className={clsx(
            "transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium cursor-pointer flex items-center",
            sidebarOpen
              ? "gap-3 w-full px-3 py-2.5 rounded-xl text-sm"
              : "justify-center w-10 h-10 mx-auto rounded-xl p-0 group relative"
          )}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>{loggingOut ? 'Signing out…' : 'Logout'}</span>}
          {!sidebarOpen && (
            <div className="fixed left-16 ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 transition-opacity shadow-xl border border-slate-700">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* Smart Workday Logout Modal (Option A) */}
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
