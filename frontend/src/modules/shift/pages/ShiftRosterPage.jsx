import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { shiftAPI } from '../../../api/shiftAPI'
import { employeeAPI } from '../../../api/employeeAPI'
import { Button, Badge, Card, CardHeader, CardBody, Spinner, EmptyState, Modal, Input } from '../../../components/common'
import {
  CalendarClock, Plus, RefreshCw, Clock, ArrowLeftRight, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Moon, Sun, ShieldCheck, User,
  Calendar, Check, X, AlertCircle
} from 'lucide-react'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const shiftColorMap = {
  GEN_0918: 'bg-blue-50 text-blue-700 border-blue-200',
  MORN_0615: 'bg-amber-50 text-amber-700 border-amber-200',
  NIGHT_2106: 'bg-purple-50 text-purple-700 border-purple-200',
}

const ShiftRosterPage = () => {
  const { user } = useSelector(s => s.auth)
  const isAdminOrHR = ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)
  const isManager = ['ROLE_MANAGER', 'ROLE_ADMIN', 'ROLE_HR', 'ROLE_SUPER_ADMIN'].includes(user?.role)

  const [activeTab, setActiveTab] = useState('roster') // 'roster' | 'swaps' | 'shifts'
  const [loading, setLoading] = useState(false)
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])

  // Calendar State
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [rosterData, setRosterData] = useState([])

  // Swaps State
  const [incomingSwaps, setIncomingSwaps] = useState([])
  const [outgoingSwaps, setOutgoingSwaps] = useState([])
  const [pendingManagerSwaps, setPendingManagerSwaps] = useState([])

  // Modals
  const [assignModal, setAssignModal] = useState(false)
  const [swapModal, setSwapModal] = useState(false)
  const [createShiftModal, setCreateShiftModal] = useState(false)

  // Form states
  const [assignForm, setAssignForm] = useState({
    employeeIds: [],
    shiftId: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
    rotationPattern: 'STANDARD',
    notes: ''
  })

  const [swapForm, setSwapForm] = useState({
    targetEmployeeId: '',
    swapDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    reason: ''
  })

  const [shiftForm, setShiftForm] = useState({
    name: '',
    shiftCode: '',
    startTime: '09:00:00',
    endTime: '18:00:00',
    gracePeriodMins: 15,
    breakDurationMins: 60,
    isNightShift: false,
    nightAllowanceRate: 0.00
  })

  const [submitting, setSubmitting] = useState(false)

  // Week days calculation (Mon - Sun)
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i))

  const fetchShifts = async () => {
    try {
      const res = await shiftAPI.getShifts()
      setShifts(res.data?.data || [])
    } catch {
      // ignore
    }
  }

  const fetchEmployees = async () => {
    if (!isAdminOrHR && !isManager) return
    try {
      const res = await employeeAPI.getAll({ page: 0, size: 100 })
      setEmployees(res.data?.data?.content || [])
    } catch {
      // ignore
    }
  }

  const fetchRoster = async () => {
    setLoading(true)
    try {
      const start = format(currentWeekStart, 'yyyy-MM-dd')
      const end = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd')
      const res = await shiftAPI.getRosterSchedule({ startDate: start, endDate: end })
      setRosterData(res.data?.data || [])
    } catch {
      toast.error('Failed to load roster schedules')
    } finally {
      setLoading(false)
    }
  }

  const fetchSwaps = async () => {
    if (user?.employeeId) {
      try {
        const [inc, out] = await Promise.all([
          shiftAPI.getIncomingSwaps(user.employeeId),
          shiftAPI.getOutgoingSwaps(user.employeeId)
        ])
        setIncomingSwaps(inc.data?.data || [])
        setOutgoingSwaps(out.data?.data || [])
      } catch {
        // ignore
      }
    }
    if (isManager) {
      try {
        const res = await shiftAPI.getPendingManagerSwaps()
        setPendingManagerSwaps(res.data?.data || [])
      } catch {
        // ignore
      }
    }
  }

  useEffect(() => {
    fetchShifts()
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (activeTab === 'roster') {
      fetchRoster()
    } else if (activeTab === 'swaps') {
      fetchSwaps()
    }
  }, [activeTab, currentWeekStart])

  // Group roster by employee
  const employeeRosterMap = {}
  rosterData.forEach(r => {
    if (!employeeRosterMap[r.employeeId]) {
      employeeRosterMap[r.employeeId] = {
        employeeName: r.employeeName,
        employeeNumber: r.employeeNumber,
        departmentName: r.departmentName,
        days: {}
      }
    }
    employeeRosterMap[r.employeeId].days[r.effectiveDate] = r
  })

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!assignForm.shiftId || assignForm.employeeIds.length === 0) {
      toast.error('Please select at least one employee and a shift')
      return
    }

    setSubmitting(true)
    try {
      await shiftAPI.assignRoster({
        employeeIds: assignForm.employeeIds.map(Number),
        shiftId: Number(assignForm.shiftId),
        startDate: assignForm.startDate,
        endDate: assignForm.endDate,
        rotationPattern: assignForm.rotationPattern,
        notes: assignForm.notes
      })
      toast.success('Roster schedule assigned')
      setAssignModal(false)
      fetchRoster()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign roster')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateShift = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await shiftAPI.createShift({
        ...shiftForm,
        nightAllowanceRate: Number(shiftForm.nightAllowanceRate)
      })
      toast.success('Shift definition created')
      setCreateShiftModal(false)
      fetchShifts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shift')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSwapSubmit = async (e) => {
    e.preventDefault()
    if (!user?.employeeId) {
      toast.error('Only staff with employee records can submit swaps')
      return
    }
    setSubmitting(true)
    try {
      await shiftAPI.createSwapRequest({
        requesterEmployeeId: user.employeeId,
        targetEmployeeId: Number(swapForm.targetEmployeeId),
        swapDate: swapForm.swapDate,
        reason: swapForm.reason
      })
      toast.success('Shift swap request sent to peer for consent')
      setSwapModal(false)
      fetchSwaps()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request shift swap')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePeerRespond = async (swapId, action) => {
    try {
      await shiftAPI.peerRespondSwap(swapId, user.employeeId, { action })
      toast.success(action === 'ACCEPT' ? 'Swap accepted! Forwarded to manager.' : 'Swap declined.')
      fetchSwaps()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  const handleManagerReview = async (swapId, action) => {
    const remarks = prompt(action === 'APPROVE' ? 'Manager Approval Remarks (optional):' : 'Rejection Reason:')
    if (remarks === null) return
    try {
      await shiftAPI.managerReviewSwap(swapId, { action, remarks })
      toast.success(action === 'APPROVE' ? 'Shift swap approved and roster schedules mutated!' : 'Shift swap rejected.')
      fetchSwaps()
      if (activeTab === 'roster') fetchRoster()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarClock className="text-primary-600 h-7 w-7" />
            Shift & Roster Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Workforce schedule rosters, peer shift-swap workflow, and night differential allowances
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="md" onClick={() => { fetchRoster(); fetchSwaps() }}>
            <RefreshCw size={15} className={clsx(loading && 'animate-spin')} />
            Refresh
          </Button>

          <Button variant="secondary" size="md" onClick={() => setSwapModal(true)}>
            <ArrowLeftRight size={15} />
            Request Shift Swap
          </Button>

          {isManager && (
            <Button variant="primary" size="md" onClick={() => setAssignModal(true)}>
              <Plus size={16} />
              Assign Roster
            </Button>
          )}

          {isAdminOrHR && (
            <Button variant="secondary" size="md" onClick={() => setCreateShiftModal(true)}>
              <Clock size={15} />
              New Shift
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('roster')}
          className={clsx(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'roster'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <Calendar size={16} />
          Weekly Roster Schedule
        </button>

        <button
          onClick={() => setActiveTab('swaps')}
          className={clsx(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'swaps'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <ArrowLeftRight size={16} />
          Shift Swaps
          {(incomingSwaps.filter(s => s.peerStatus === 'PENDING_PEER').length > 0 || (isManager && pendingManagerSwaps.length > 0)) && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={clsx(
            'px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2',
            activeTab === 'shifts'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          )}
        >
          <Clock size={16} />
          Active Shifts ({shifts.length})
        </button>
      </div>

      {/* TAB 1: WEEKLY ROSTER GRID */}
      {activeTab === 'roster' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))}
                >
                  <ChevronLeft size={16} /> Prev Week
                </Button>

                <span className="font-bold text-sm text-slate-800">
                  {format(currentWeekStart, 'dd MMM yyyy')} â€” {format(addDays(currentWeekStart, 6), 'dd MMM yyyy')}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
                >
                  Next Week <ChevronRight size={16} />
                </Button>

                <button
                  onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                  className="text-xs font-semibold text-primary-600 hover:underline ml-2"
                >
                  Today
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-blue-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> General Day (09:00 - 18:00)
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Morning (06:00 - 15:00)
                </span>
                <span className="inline-flex items-center gap-1.5 text-purple-700 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Night (21:00 - 06:00)
                </span>
              </div>
            </div>
          </CardHeader>

          <CardBody className="p-0 overflow-x-auto">
            {loading ? (
              <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
            ) : Object.keys(employeeRosterMap).length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={CalendarClock}
                  title="No shifts scheduled for this week"
                  description="Use the Assign Roster button to generate shift rotations for employees."
                  action={
                    isManager && (
                      <Button variant="primary" size="sm" onClick={() => setAssignModal(true)}>
                        <Plus size={14} /> Assign Roster
                      </Button>
                    )
                  }
                />
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4 w-56 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Employee</th>
                    {weekDays.map(day => (
                      <th key={day.toISOString()} className="py-3 px-3 text-center min-w-[120px]">
                        <p className="font-bold text-slate-800">{format(day, 'EEE')}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{format(day, 'dd MMM')}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(employeeRosterMap).map(([empId, empData]) => (
                    <tr key={empId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 sticky left-0 bg-white border-r border-slate-200 z-10 shadow-2xs">
                        <p className="font-bold text-slate-800">{empData.employeeName}</p>
                        <p className="text-[10px] text-slate-400">{empData.employeeNumber} â€¢ {empData.departmentName || 'General'}</p>
                      </td>

                      {weekDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd')
                        const shiftAssignment = empData.days[dateStr]

                        return (
                          <td key={dateStr} className="py-2 px-2 text-center align-middle">
                            {shiftAssignment ? (
                              <div className={clsx(
                                'p-2 rounded-xl border text-center transition-all',
                                shiftColorMap[shiftAssignment.shiftCode] || 'bg-slate-50 border-slate-200 text-slate-700'
                              )}>
                                <p className="font-bold truncate text-[11px]">{shiftAssignment.shiftName}</p>
                                <p className="text-[10px] opacity-80 mt-0.5">
                                  {shiftAssignment.startTime ? shiftAssignment.startTime.substring(0, 5) : ''} - {shiftAssignment.endTime ? shiftAssignment.endTime.substring(0, 5) : ''}
                                </p>
                                {shiftAssignment.status === 'SWAPPED' && (
                                  <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-white/80 px-1.5 py-0.2 rounded border">
                                    SWAPPED
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-mono text-xs">â€”</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 2: SHIFT SWAP WORKFLOW HUB */}
      {activeTab === 'swaps' && (
        <div className="space-y-6">
          {/* Manager Approvals Queue */}
          {isManager && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-primary-600" size={16} />
                    Manager Approval Queue (Awaiting Leadership Sign-Off)
                  </h3>
                  <Badge variant="purple">{pendingManagerSwaps.length} Pending</Badge>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                {pendingManagerSwaps.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No peer-accepted shift swaps currently awaiting manager approval.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingManagerSwaps.map(swap => (
                      <div key={swap.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900">
                            Swap for {swap.swapDate}: <span className="text-primary-700">{swap.requesterEmployeeName}</span> ({swap.requesterShiftName}) â‡„ <span className="text-primary-700">{swap.targetEmployeeName}</span> ({swap.targetShiftName})
                          </p>
                          <p className="text-xs text-slate-500 italic">"{swap.reason}"</p>
                          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Accepted by peer ({swap.targetEmployeeName})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="danger" size="sm" onClick={() => handleManagerReview(swap.id, 'REJECT')}>
                            <X size={13} /> Reject
                          </Button>
                          <Button variant="success" size="sm" onClick={() => handleManagerReview(swap.id, 'APPROVE')}>
                            <Check size={13} /> Approve & Mutate Roster
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Incoming Peer Requests */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ArrowLeftRight className="text-blue-600" size={16} />
                Incoming Swap Requests (From Peers)
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {incomingSwaps.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  No peers have requested to swap shifts with you.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {incomingSwaps.map(swap => (
                    <div key={swap.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">
                          {swap.requesterEmployeeName} wants to swap on <span className="text-primary-600">{swap.swapDate}</span>
                        </p>
                        <p className="text-xs text-slate-600">
                          Their Shift: <strong className="text-slate-800">{swap.requesterShiftName}</strong> ({swap.requesterShiftTime}) â‡„ Your Shift: <strong className="text-slate-800">{swap.targetShiftName}</strong> ({swap.targetShiftTime})
                        </p>
                        <p className="text-xs text-slate-500 italic">"{swap.reason}"</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {swap.peerStatus === 'PENDING_PEER' ? (
                          <>
                            <Button variant="danger" size="sm" onClick={() => handlePeerRespond(swap.id, 'DECLINE')}>
                              <X size={13} /> Decline
                            </Button>
                            <Button variant="success" size="sm" onClick={() => handlePeerRespond(swap.id, 'ACCEPT')}>
                              <Check size={13} /> Accept Swap
                            </Button>
                          </>
                        ) : (
                          <Badge variant={swap.peerStatus === 'PEER_ACCEPTED' ? 'success' : 'danger'}>
                            {swap.peerStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Outgoing Requests */}
          <Card>
            <CardHeader>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Clock className="text-slate-400" size={16} />
                My Outgoing Swap Requests
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              {outgoingSwaps.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  You have not submitted any shift swap requests.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {outgoingSwaps.map(swap => (
                    <div key={swap.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">
                          Requested swap with {swap.targetEmployeeName} for {swap.swapDate}
                        </p>
                        <p className="text-slate-500 mt-0.5">
                          Peer: <strong className="text-slate-700">{swap.peerStatus}</strong> â€¢ Manager: <strong className="text-slate-700">{swap.managerStatus}</strong>
                        </p>
                      </div>
                      <Badge variant={swap.status === 'APPROVED' ? 'success' : (swap.status === 'REJECTED' ? 'danger' : 'warning')}>
                        {swap.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: ACTIVE SHIFTS REGISTRY */}
      {activeTab === 'shifts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map(shift => (
            <div key={shift.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary-600">{shift.shiftCode}</span>
                {shift.isNightShift ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    <Moon size={12} /> Night Shift
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <Sun size={12} /> Day Shift
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{shift.name}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Clock size={13} /> Timing: <strong>{shift.startTime}</strong> to <strong>{shift.endTime}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Grace Period</span>
                  <span className="font-semibold text-slate-800">{shift.gracePeriodMins} mins</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Night Allowance</span>
                  <span className="font-semibold text-slate-800">INR {shift.nightAllowanceRate?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ASSIGN ROSTER */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Schedule Workforce Shift Roster"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="label">Target Employees <span className="text-red-500">*</span></label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50 space-y-1">
              {employees.map(e => (
                <label key={e.id} className="flex items-center gap-2 text-xs text-slate-700 p-1 hover:bg-white rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={assignForm.employeeIds.includes(e.id)}
                    onChange={evt => {
                      if (evt.target.checked) {
                        setAssignForm(prev => ({ ...prev, employeeIds: [...prev.employeeIds, e.id] }))
                      } else {
                        setAssignForm(prev => ({ ...prev, employeeIds: prev.employeeIds.filter(id => id !== e.id) }))
                      }
                    }}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="font-semibold text-slate-800">{e.fullName}</span>
                  <span className="text-slate-400">({e.employeeNumber}) â€” {e.department?.name || 'Staff'}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{assignForm.employeeIds.length} employee(s) selected</p>
          </div>

          <div>
            <label className="label">Shift <span className="text-red-500">*</span></label>
            <select
              value={assignForm.shiftId}
              onChange={e => setAssignForm({ ...assignForm, shiftId: e.target.value })}
              className="input bg-white text-xs"
              required
            >
              <option value="">Select Shift Definition...</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.shiftCode}) â€¢ {s.startTime} - {s.endTime}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              required
              value={assignForm.startDate}
              onChange={e => setAssignForm({ ...assignForm, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={assignForm.endDate}
              onChange={e => setAssignForm({ ...assignForm, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Schedule Roster</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: REQUEST SHIFT SWAP */}
      <Modal
        isOpen={swapModal}
        onClose={() => setSwapModal(false)}
        title="Request Peer Shift Swap"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSwapSubmit} className="space-y-4">
          <Input
            label="Date to Swap"
            type="date"
            required
            value={swapForm.swapDate}
            onChange={e => setSwapForm({ ...swapForm, swapDate: e.target.value })}
          />

          <div>
            <label className="label">Swap With Peer Employee <span className="text-red-500">*</span></label>
            <select
              value={swapForm.targetEmployeeId}
              onChange={e => setSwapForm({ ...swapForm, targetEmployeeId: e.target.value })}
              className="input bg-white text-xs"
              required
            >
              <option value="">Select Peer Employee...</option>
              {(employees.length > 0
                ? employees.filter(e => e.id !== user?.employeeId)
                : Object.entries(employeeRosterMap)
                    .filter(([empId]) => Number(empId) !== Number(user?.employeeId))
                    .map(([empId, info]) => ({
                      id: Number(empId),
                      fullName: info.employeeName,
                      employeeNumber: info.employeeNumber,
                      department: { name: info.departmentName || 'Colleague' }
                    }))
              ).map(e => (
                <option key={e.id} value={e.id}>
                  {e.fullName} {e.employeeNumber ? `(${e.employeeNumber})` : ''} â€” {e.department?.name || 'Staff'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reason for Swap Request <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              required
              className="input text-xs"
              placeholder="State the reason for swapping (e.g. medical appointment, exam, family event)..."
              value={swapForm.reason}
              onChange={e => setSwapForm({ ...swapForm, reason: e.target.value })}
            />
          </div>

          <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <strong>Process:</strong> Once requested, the peer must first accept. After peer acceptance, your department manager will review and approve to mutate both schedules.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setSwapModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Send Swap Request</Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: CREATE SHIFT DEFINITION */}
      <Modal
        isOpen={createShiftModal}
        onClose={() => setCreateShiftModal(false)}
        title="Create New Shift Definition"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateShift} className="space-y-4">
          <Input
            label="Shift Name"
            placeholder="e.g. Afternoon Production Shift"
            required
            value={shiftForm.name}
            onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
          />

          <Input
            label="Shift Code"
            placeholder="e.g. AFT_1422"
            required
            value={shiftForm.shiftCode}
            onChange={e => setShiftForm({ ...shiftForm, shiftCode: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              step="1"
              required
              value={shiftForm.startTime}
              onChange={e => setShiftForm({ ...shiftForm, startTime: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              step="1"
              required
              value={shiftForm.endTime}
              onChange={e => setShiftForm({ ...shiftForm, endTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Grace Period (mins)"
              type="number"
              value={shiftForm.gracePeriodMins}
              onChange={e => setShiftForm({ ...shiftForm, gracePeriodMins: e.target.value })}
            />
            <Input
              label="Night Allowance (INR)"
              type="number"
              value={shiftForm.nightAllowanceRate}
              onChange={e => setShiftForm({ ...shiftForm, nightAllowanceRate: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={shiftForm.isNightShift}
              onChange={e => setShiftForm({ ...shiftForm, isNightShift: e.target.checked })}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            Mark as Overnight / Night Shift (Eligible for differential allowance)
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateShiftModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Register Shift</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ShiftRosterPage
