import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slices/authSlice'
import { toggleSidebar } from '../../store/slices/uiSlice'
import {
  LayoutDashboard, Users, Building2, Clock, CalendarDays,
  DollarSign, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Briefcase, Shield, BarChart3
} from 'lucide-react'
import { clsx } from 'clsx'

const NAV = [
  { path:'/dashboard',   label:'Dashboard',   icon:LayoutDashboard, roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/employees',   label:'Employees',   icon:Users,           roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER'] },
  { path:'/departments', label:'Departments', icon:Building2,       roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR'] },
  { path:'/attendance',  label:'Attendance',  icon:Clock,           roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/leaves',      label:'Leave',       icon:CalendarDays,    roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/payroll',     label:'Payroll',     icon:DollarSign,      roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/profile',     label:'My Profile',  icon:User,            roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_HR','ROLE_MANAGER','ROLE_EMPLOYEE'] },
  { path:'/admin',       label:'Admin Panel', icon:Shield,          roles:['ROLE_SUPER_ADMIN','ROLE_ADMIN'] },
]

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sidebarOpen } = useSelector(s => s.ui)
  const { user } = useSelector(s => s.auth)

  const visibleNav = NAV.filter(n => n.roles.includes(user?.role))

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
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
      'fixed left-0 top-0 h-full bg-slate-900 text-white flex flex-col z-40 transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg">
              <Briefcase size={16} className="text-white" />
            </div>
            <div>
              <span className="font-black text-white text-base">HRMS</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">Enterprise</span>
            </div>
          </div>
        )}
        <button onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-auto text-slate-400 hover:text-white">
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto px-2">
        {visibleNav.map(item => {
          const Icon = item.icon
          return (
            <NavLink key={item.path} to={item.path} title={!sidebarOpen ? item.label : undefined}
              className={({ isActive }) => clsx(
                'sidebar-link group relative',
                isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
              )}>
              <Icon size={19} className="shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs
                  rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none
                  z-50 transition-opacity shadow-xl border border-slate-700">
                  {item.label}
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-slate-800 p-3">
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 mb-3 px-2 py-2.5 rounded-xl bg-slate-800">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
              {user.fullName?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
              <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-semibold', roleColors[roleLabel] || roleColors.EMPLOYEE)}>
                {roleLabel}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400
            hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 text-sm font-medium"
          title={!sidebarOpen ? 'Logout' : undefined}>
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
