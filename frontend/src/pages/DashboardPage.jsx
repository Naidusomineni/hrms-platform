import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { Users, Building2, UserCheck, UserX, Clock, CalendarDays, Briefcase, TrendingUp, Gift, ChevronRight } from 'lucide-react'
import { dashboardAPI } from '../api/dashboardAPI'
import { StatCard, Card, CardHeader, CardBody, Spinner, Badge } from '../components/common/index.jsx'
import { format } from 'date-fns'

const COLORS = ['#2563eb','#0d9488','#d97706','#dc2626','#7c3aed','#0891b2','#65a30d']

const statusBadge = { ACTIVE:'success', PROBATION:'warning', ON_LEAVE:'info', TERMINATED:'danger', RESIGNED:'danger', INACTIVE:'default' }

const DashboardPage = () => {
  const { user } = useSelector(s => s.auth)
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.getAdminStats()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const deptData = stats?.employeesByDepartment
    ? Object.entries(stats.employeesByDepartment).map(([name, count]) => ({ name, count }))
    : []

  const attendanceData = [
    { name: 'Present', value: Number(stats?.presentToday || 0), color: '#10b981' },
    { name: 'Absent', value: Number(stats?.absentToday || 0), color: '#ef4444' },
    { name: 'On Leave', value: Number(stats?.onLeaveToday || 0), color: '#f59e0b' },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 2px 2px,white 1px,transparent 0)',backgroundSize:'32px 32px'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{greeting()}, {user?.fullName?.split(' ')[0]}! 👋</h2>
            <p className="text-blue-200 mt-1">{format(new Date(),'EEEE, MMMM do yyyy')}</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center border border-white/20">
              <p className="text-2xl font-black">{stats?.activeEmployees || 0}</p>
              <p className="text-xs text-blue-200">Active Staff</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center border border-white/20">
              <p className="text-2xl font-black">{stats?.pendingLeaveRequests || 0}</p>
              <p className="text-xs text-blue-200">Pending Leaves</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={stats?.totalEmployees ?? '—'}
          icon={Users} gradient="gradient-primary" subtitle="All registered employees"
          onClick={() => navigate('/employees')} />
        <StatCard title="Departments" value={stats?.totalDepartments ?? '—'}
          icon={Building2} gradient="gradient-purple" subtitle="Active departments"
          onClick={() => navigate('/departments')} />
        <StatCard title="Present Today" value={stats?.presentToday ?? '—'}
          icon={UserCheck} gradient="gradient-success" subtitle={`Absent: ${stats?.absentToday ?? 0}`} />
        <StatCard title="Pending Leaves" value={stats?.pendingLeaveRequests ?? '—'}
          icon={CalendarDays} gradient="gradient-warning" subtitle="Awaiting review"
          onClick={() => navigate('/leaves')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Bar Chart */}
        <div className="lg:col-span-2 card">
          <CardHeader>
            <h3 className="font-bold text-slate-800">Employees by Department</h3>
            <p className="text-sm text-slate-400 mt-0.5">Headcount distribution</p>
          </CardHeader>
          <CardBody>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData} margin={{ top:5, right:20, left:0, bottom:5 }}>
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

        {/* Attendance Pie */}
        <card className="card">
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
        </card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Hires */}
        {stats?.recentHires?.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-primary-600"/>Recent Hires</h3>
                <button onClick={() => navigate('/employees')} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-medium">View all<ChevronRight size={13}/></button>
              </div>
            </CardHeader>
            <div className="divide-y divide-slate-50">
              {stats.recentHires.slice(0,5).map(emp => (
                <div key={emp.id} onClick={() => navigate(`/employees/${emp.id}`)}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {emp.firstName?.charAt(0)}{emp.lastName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{emp.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{emp.designation} · {emp.departmentName || 'Unassigned'}</p>
                  </div>
                  <Badge variant={statusBadge[emp.employmentStatus] || 'default'}>
                    {emp.employmentStatus?.replace('_',' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upcoming Birthdays */}
        {stats?.upcomingBirthdays?.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Gift size={16} className="text-pink-500"/>Upcoming Birthdays</h3>
            </CardHeader>
            <div className="divide-y divide-slate-50">
              {stats.upcomingBirthdays.map((b, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-lg shrink-0">🎂</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{b.name}</p>
                    <p className="text-xs text-slate-400">{b.department} · {b.dateOfBirth ? format(new Date(b.dateOfBirth),'MMMM d') : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
export default DashboardPage
