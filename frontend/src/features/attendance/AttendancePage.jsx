import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { attendanceAPI } from '../../api/attendanceAPI'
import { employeeAPI } from '../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Modal, Spinner, EmptyState } from '../../components/common/index.jsx'
import { Plus, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isWeekend, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const statusDot = { PRESENT:'bg-emerald-500', ABSENT:'bg-red-500', HALF_DAY:'bg-amber-500', WORK_FROM_HOME:'bg-blue-500', ON_LEAVE:'bg-purple-500', HOLIDAY:'bg-slate-400', LATE_ARRIVAL:'bg-orange-500' }
const statusBadge = { PRESENT:'success', ABSENT:'danger', HALF_DAY:'warning', WORK_FROM_HOME:'info', ON_LEAVE:'purple', HOLIDAY:'default', LATE_ARRIVAL:'warning' }

const AttendancePage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminHR = ['ROLE_ADMIN','ROLE_HR','ROLE_SUPER_ADMIN'].includes(user?.role)

  const [monthlyData, setMonthlyData] = useState([])
  const [todayList, setTodayList] = useState([])
  const [employees, setEmployees] = useState([])
  const [selectedEmpId, setSelectedEmpId] = useState('')
  const [viewMonth, setViewMonth] = useState(new Date())
  const [markModalOpen, setMarkModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { date: format(new Date(),'yyyy-MM-dd'), status: 'PRESENT' }
  })

  useEffect(() => {
    if (isAdminHR) {
      attendanceAPI.getByDate(format(new Date(),'yyyy-MM-dd')).then(r => setTodayList(r.data.data || [])).catch(() => {})
      employeeAPI.getAll({ size: 200 }).then(r => setEmployees(r.data.data?.content || [])).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!selectedEmpId) return
    setLoading(true)
    attendanceAPI.getMonthly(selectedEmpId, viewMonth.getFullYear(), viewMonth.getMonth()+1)
      .then(r => setMonthlyData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedEmpId, viewMonth])

  const onMark = async (data) => {
    try {
      await attendanceAPI.mark({ ...data, employeeId: Number(data.employeeId) })
      toast.success('Attendance marked')
      setMarkModalOpen(false); reset()
      attendanceAPI.getByDate(format(new Date(),'yyyy-MM-dd')).then(r => setTodayList(r.data.data || []))
      if (data.employeeId === selectedEmpId)
        attendanceAPI.getMonthly(selectedEmpId, viewMonth.getFullYear(), viewMonth.getMonth()+1)
          .then(r => setMonthlyData(r.data.data || []))
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to mark attendance') }
  }

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) })
  const byDate = monthlyData.reduce((acc, a) => { acc[a.date] = a; return acc }, {})
  const summary = monthlyData.reduce((acc, a) => { acc[a.status] = (acc[a.status]||0)+1; return acc }, {})

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth()-1))
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth()+1))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Attendance</h2>
          <p className="text-slate-400 text-sm mt-0.5">Track and manage employee attendance</p>
        </div>
        {isAdminHR && <Button variant="primary" onClick={() => setMarkModalOpen(true)}><Plus size={16}/>Mark Attendance</Button>}
      </div>

      {/* Employee selector */}
      {isAdminHR && (
        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-semibold text-slate-600 shrink-0">View Calendar For:</label>
            <select value={selectedEmpId} onChange={e => setSelectedEmpId(e.target.value)}
              className="input max-w-xs bg-white">
              <option value="">Select employee…</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>)}
            </select>
          </div>
        </Card>
      )}

      {/* Monthly Calendar */}
      {selectedEmpId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{format(viewMonth,'MMMM yyyy')} — Attendance Calendar</h3>
                {Object.keys(summary).length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {Object.entries(summary).map(([status, count]) => (
                      <span key={status} className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={clsx('w-2 h-2 rounded-full', statusDot[status] || 'bg-slate-400')}/>
                        {status.replace('_',' ')}: <strong>{count}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"><ChevronLeft size={18}/></button>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"><ChevronRight size={18}/></button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? <Spinner className="py-8"/> : (
              <>
                <div className="grid grid-cols-7 mb-2">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({length: daysInMonth[0].getDay()}).map((_,i) => <div key={i}/>)}
                  {daysInMonth.map(day => {
                    const ds = format(day,'yyyy-MM-dd')
                    const rec = byDate[ds]
                    const weekend = isWeekend(day)
                    return (
                      <div key={ds} title={rec ? `${rec.status} | In: ${rec.checkInTime||'—'} Out: ${rec.checkOutTime||'—'}` : ''}
                        className={clsx(
                          'aspect-square rounded-xl flex flex-col items-center justify-center text-xs transition-all cursor-default',
                          isToday(day) ? 'ring-2 ring-primary-500 ring-offset-1' : '',
                          weekend ? 'bg-slate-50' : 'bg-white hover:bg-slate-50',
                          rec ? 'shadow-sm' : ''
                        )}>
                        <span className={clsx('font-semibold', isToday(day) ? 'text-primary-600' : weekend ? 'text-slate-400' : 'text-slate-700')}>
                          {format(day,'d')}
                        </span>
                        {rec && <span className={clsx('w-1.5 h-1.5 rounded-full mt-0.5', statusDot[rec.status]||'bg-slate-400')}/>}
                        {rec?.workingHours && <span className="text-[9px] text-slate-400">{rec.workingHours.toFixed(1)}h</span>}
                      </div>
                    )
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
                  {Object.entries(statusDot).map(([key, dot]) => (
                    <span key={key} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={clsx('w-2.5 h-2.5 rounded-full', dot)}/>{key.replace('_',' ')}
                    </span>
                  ))}
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* Today's Attendance List */}
      {isAdminHR && (
        <Card>
          <CardHeader>
            <h3 className="font-bold text-slate-800">Today's Attendance — {format(new Date(),'MMMM d, yyyy')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{todayList.length} records</p>
          </CardHeader>
          {todayList.length === 0 ? (
            <div className="py-10"><EmptyState icon={Clock} title="No attendance today" description="No records marked for today yet"/></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {['Employee','Check In','Check Out','Hours','Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {todayList.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-800">{a.employeeName}</p>
                        <p className="text-xs text-slate-400">{a.employeeNumber}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600 font-mono text-xs">{a.checkInTime || '—'}</td>
                      <td className="px-5 py-3 text-slate-600 font-mono text-xs">{a.checkOutTime || '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{a.workingHours ? `${a.workingHours.toFixed(1)}h` : '—'}</td>
                      <td className="px-5 py-3"><Badge variant={statusBadge[a.status]||'default'}>{a.status?.replace('_',' ')}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Mark Attendance Modal */}
      <Modal isOpen={markModalOpen} onClose={() => { setMarkModalOpen(false); reset() }} title="Mark Attendance"
        footer={<>
          <Button variant="secondary" onClick={() => { setMarkModalOpen(false); reset() }}>Cancel</Button>
          <Button variant="primary" form="att-form" type="submit" loading={isSubmitting}>Mark Attendance</Button>
        </>}>
        <form id="att-form" onSubmit={handleSubmit(onMark)} className="space-y-4">
          <div>
            <label className="label">Employee *</label>
            <select {...register('employeeId',{required:true})} className="input bg-white">
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date *</label>
              <input type="date" {...register('date',{required:true})} className="input"/>
            </div>
            <div>
              <label className="label">Status *</label>
              <select {...register('status',{required:true})} className="input bg-white">
                {['PRESENT','ABSENT','HALF_DAY','WORK_FROM_HOME','ON_LEAVE','HOLIDAY','LATE_ARRIVAL'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Check In Time</label><input type="time" {...register('checkInTime')} className="input"/></div>
            <div><label className="label">Check Out Time</label><input type="time" {...register('checkOutTime')} className="input"/></div>
          </div>
          <div>
            <label className="label">Remarks</label>
            <input type="text" {...register('remarks')} placeholder="Optional remarks…" className="input"/>
          </div>
        </form>
      </Modal>
    </div>
  )
}
export default AttendancePage
