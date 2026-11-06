import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleTheme } from '../../store/slices/uiSlice';
import { notificationAPI } from '../../api/notificationAPI';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
  '/departments': 'Departments',
  '/attendance': 'Attendance',
  '/leaves': 'Leave Management',
  '/payroll': 'Payroll',
  '/expenses': 'Expenses',
  '/documents': 'Documents',
  '/assets': 'Assets',
  '/helpdesk': 'Helpdesk',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
  '/admin': 'Admin Panel',
};

const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { theme } = useAppSelector(s => s.ui);
  const { tenant } = useAppSelector(s => (s as unknown as { tenant: { tenant?: { name?: string } } }).tenant || {});
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [avatarError, setAvatarError] = useState<boolean>(false);

  const pageTitle =
    titles[location.pathname] ||
    (location.pathname.includes('/employees/') ? 'Employee Details' : (tenant?.name || 'HRMS'));

  useEffect(() => {
    if (user?.userId) {
      notificationAPI
        .getUnreadCount(user.userId)
        .then(res => setUnreadCount(res.data?.data || 0))
        .catch(() => {});
    }
  }, [user?.userId]);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shrink-0 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{pageTitle}</h1>
        <p className="text-xs text-slate-400 dark:text-slate-400">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell size={18} className="text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-primary-600 flex items-center justify-center text-white text-xs font-bold border border-slate-200 dark:border-slate-700 shrink-0">
            {user?.profilePicture && !avatarError ? (
              <img
                src={user.profilePicture}
                alt={user.fullName || 'User'}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span>{user?.fullName?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.fullName}</p>
            <p className="text-xs text-slate-400">{user?.role?.replace('ROLE_', '')}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Topbar;

