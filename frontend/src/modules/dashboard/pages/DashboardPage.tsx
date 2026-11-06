import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../store/hooks'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { Users, User, Building2, UserCheck, Clock, CalendarDays, TrendingUp, Gift, ChevronRight } from 'lucide-react'
import { dashboardAPI } from '../../../api/dashboardAPI'
import { StatCard, Card, CardHeader, CardBody, Spinner, Badge } from '../../../components/common'
import type { DashboardStats } from '../../../types'
import { format } from 'date-fns'

const COLORS = ['#2563eb','#0d9488','#d97706','#dc2626','#7c3aed','#0891b2','#65a30d']

const statusBadge: Record<string, string> = {
  ACTIVE: 'success',
  PROBATION: 'warning',
  ON_LEAVE: 'info',
  TERMINATED: 'danger',
  RESIGNED: 'danger',
  INACTIVE: 'default'
}

const DashboardPage: React.FC = () => {
  const { user } = useAppSelector(s => s.auth)
  const navigate = useNavigate()
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN','ROLE_IT_ADMIN'].includes(user?.role || '')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState<boolean>(isAdminHR)

  useEffect(() => {
    if (!isAdminHR) return
    dashboardAPI.getAdminStats()
      .then(r => setStats(r.data?.data || null))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAdminHR])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  if (!isAdminHR) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="card">
          <CardHeader>
            <h3 className="font-bold text-slate-900">Employee Home</h3>
            <p className="text-sm text-slate-500">Quick access to your profile, attendance, and leave requests.</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard title="My Profile" value={user?.fullName || 'Profile'} icon={User} badgeColor="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200" onClick={() => navigate('/profile')} />
              <StatCard title="Attendance" value="View records" icon={Clock} badgeColor="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200" onClick={() => navigate('/attendance')} />
              <StatCard title="Leave" value="Apply / track" icon={CalendarDays} badgeColor="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200" onClick={() => navigate('/leaves')} />
            </div>
          </CardBody>
        </div>
      </div>
    )
  }

  const deptData = stats?.employeesByDepartment
    ? Object.entries(stats.employeesByDepartment).map(([name, count]) => ({ name, count: Number(count) }))
    : []

  const trendData = stats?.headcountTrend
    ? Object.entries(stats.headcountTrend).map(([month, count]) => ({ month, count: Number(count) }))
    : []

  const attendanceData = [
    { name: 'Present', value: Number(stats?.presentToday || 0), color: '#10b981' },
    { name: 'Absent', value: Number(stats?.absentToday || 0), color: '#ef4444' },
    { name: 'On Leave', value: Number(stats?.onLeaveToday || 0), color: '#f59e0b' },
  ].filter(d => d.value > 0)

  const safeRecentHires = Array.isArray(stats?.recentHires) ? stats.recentHires : []
  const safeUpcomingBirthdays = Array.isArray(stats?.upcomingBirthdays) ? stats.upcomingBirthdays : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Corporate Executive Welcome Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/80 dark:border-emerald-800/60 uppercase tracking-wider">
                Executive Command Center
              </span>
              <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
              {greeting()}, {user?.fullName || 'Administrator'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enterprise operations telemetry and organizational KPIs across departments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl px-4 py-2.5 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{stats?.activeEmployees || 0}</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Active Staff</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl px-4 py-2.5 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 leading-none">{stats?.pendingLeaveRequests || 0}</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Pending Leaves</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees ?? '—'}
          icon={Users}
          badgeColor="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800"
          subtitle="All registered employee records"
          onClick={() => navigate('/employees')}
        />
        <StatCard
          title="Departments"
          value={stats?.totalDepartments ?? '—'}
          icon={Building2}
          badgeColor="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200/80 dark:border-purple-800"
          subtitle="Active operational units"
          onClick={() => navigate('/departments')}
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday ?? 0}
          icon={UserCheck}
          badgeColor="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800"
          subtitle={`Absent: ${stats?.absentToday ?? 0} • On Leave: ${stats?.onLeaveToday ?? 0}`}
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pendingLeaveRequests ?? 0}
          icon={CalendarDays}
          badgeColor="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-800"
          subtitle="Awaiting manager sign-off"
          onClick={() => navigate('/leaves')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Bar Chart */}
        <div className="card">
          <CardHeader>
            <h3 className="font-bold text-slate-800">Employees by Department</h3>
            <p className="text-sm text-slate-400 mt-0.5">Headcount distribution</p>
          </CardHeader>
          <CardBody>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} margin={{ top:5, right:15, left:-15, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', fontSize:'13px' }} />
                  <Bar dataKey="count" name="Employees" radius={[8,8,0,0]}>
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No department data yet</div>
            )}
          </CardBody>
        </div>

        {/* Headcount Trend Area Chart */}
        <div className="card">
          <CardHeader>
            <h3 className="font-bold text-slate-800">Headcount Trend</h3>
            <p className="text-sm text-slate-400 mt-0.5">Trailing 6-month growth</p>
          </CardHeader>
          <CardBody>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top:5, right:15, left:-15, bottom:5 }}>
                  <defs>
                    <linearGradient id="headcountGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', fontSize:'13px' }} />
                  <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#headcountGrad)" name="Headcount" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No trend data yet</div>
            )}
          </CardBody>
        </div>

        {/* Attendance Pie */}
        <Card className="card">
          <CardHeader>
            <h3 className="font-bold text-slate-800">Today's Attendance</h3>
            <p className="text-sm text-slate-400 mt-0.5">{format(new Date(),'MMM d, yyyy')}</p>
          </CardHeader>
          <CardBody>
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {attendanceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 4px 24px rgba(0,0,0,0.1)', fontSize:'13px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Clock size={36} className="mb-2 text-slate-200" />
                <p className="text-sm">No attendance recorded today</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hires */}
        {safeRecentHires.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-primary-600"/>Recent Hires</h3>
                <button onClick={() => navigate('/employees')} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-medium">View all<ChevronRight size={13}/></button>
              </div>
            </CardHeader>
            <div className="divide-y divide-slate-50">
              {safeRecentHires.slice(0,5).map(emp => (
                <div key={emp.id} onClick={() => navigate(`/employees/${emp.id}`)}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{emp.fullName || `${emp.firstName} ${emp.lastName}`}</p>
                    <p className="text-xs text-slate-400 truncate">{emp.designation} · {emp.departmentName || 'Unassigned'}</p>
                  </div>
                  <Badge variant={statusBadge[emp.employmentStatus || ''] || 'default'}>
                    {emp.employmentStatus?.replace('_',' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upcoming Birthdays */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Gift size={16} className="text-pink-500"/>Upcoming Birthdays</h3>
          </CardHeader>
          {safeUpcomingBirthdays.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {safeUpcomingBirthdays.map((b, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-lg shrink-0">🎂</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.department || 'Unassigned'} · {b.dateOfBirth ? format(new Date(b.dateOfBirth),'MMMM d') : 'Date unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CardBody>
              <div className="flex items-center justify-center h-36 text-slate-500 text-sm">
                No upcoming birthdays in the next 7 days.
              </div>
            </CardBody>
          )}
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage

