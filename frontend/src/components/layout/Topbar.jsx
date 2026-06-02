import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Bell, Search, Moon, Sun } from 'lucide-react'
import { toggleTheme } from '../../store/slices/uiSlice'
import { notificationAPI } from '../../api/notificationAPI'
import { clsx } from 'clsx'

const titles = {
  '/dashboard':'Dashboard', '/employees':'Employees', '/employees/new':'Add Employee',
  '/departments':'Departments', '/attendance':'Attendance', '/leaves':'Leave Management',
  '/payroll':'Payroll', '/notifications':'Notifications', '/profile':'My Profile', '/admin':'Admin Panel',
}

const Topbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { theme } = useSelector(s => s.ui)
  const [unreadCount, setUnreadCount] = useState(0)

  const pageTitle = titles[location.pathname] ||
    (location.pathname.includes('/employees/') ? 'Employee Details' : 'HRMS')

  useEffect(() => {
    if (user?.userId) {
      notificationAPI.getUnreadCount(user.userId)
        .then(res => setUnreadCount(res.data?.data || 0))
        .catch(() => {})
    }
  }, [user?.userId])

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
        <p className="text-xs text-slate-400 dark:text-slate-400">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors" title="Toggle theme">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <Bell size={18} className="text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center text-white text-sm font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
            <p className="text-xs text-slate-400">{user?.role?.replace('ROLE_','')}</p>
          </div>
        </button>
      </div>
    </header>
  )
}

export default Topbar
