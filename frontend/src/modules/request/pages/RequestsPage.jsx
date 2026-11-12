import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { requestAPI } from '../../../api/requestAPI'
import { attendanceAPI } from '../../../api/attendanceAPI'
import { 
  Send, Home, Clock, DollarSign, Plane, CheckCircle2, XCircle, 
  AlertCircle, Briefcase, FileCheck, ShieldAlert, Calendar, Plus, RefreshCw, Layers
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestsPage() {
  const { user } = useSelector(s => s.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  // Form state
  const [requestType, setRequestType] = useState('WORK_FROM_HOME')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [checkInTime, setCheckInTime] = useState('10:00')
  const [checkOutTime, setCheckOutTime] = useState('19:00')
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      if (!user?.employeeId) {
        setRequests([])
        return
      }
      const res = await requestAPI.getForEmployee(user.employeeId)
      setRequests(res.data.data?.content || [])
    } catch (err) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user?.employeeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.employeeId) {
      toast.error('Employee profile not linked yet')
      return
    }
    try {
      setSubmitting(true)

      // Direct Attendance Regularization handling
      if (requestType === 'ATTENDANCE_REGULARIZATION') {
        await attendanceAPI.submitRegularization({
          employeeId: user.employeeId,
          date: startDate,
          requestedCheckIn: checkInTime || null,
          requestedCheckOut: checkOutTime || null,
          reason: description || title || 'Missed punch regularization'
        })
        toast.success('Attendance regularization submitted to manager!')
      } else {
        // Universal Employee Request Engine
        await requestAPI.create({
          employeeId: user.employeeId,
          requestType,
          title,
          startDate: startDate || null,
          endDate: endDate || null,
          amount: amount ? parseFloat(amount) : null,
          description
        })
        toast.success(`${requestType.replace('_', ' ')} submitted for workflow review!`)
      }

      setShowModal(false)
      setTitle('')
      setDescription('')
      setAmount('')
      setStartDate('')
      setEndDate('')
      fetchRequests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'WORK_FROM_HOME': return <Home size={16} className="text-blue-600" />
      case 'ATTENDANCE_REGULARIZATION': return <Clock size={16} className="text-amber-600" />
      case 'ON_DUTY': return <Briefcase size={16} className="text-indigo-600" />
      case 'OVERTIME': return <Calendar size={16} className="text-emerald-600" />
      case 'EXPENSE_CLAIM': return <DollarSign size={16} className="text-slate-700" />
      case 'TRAVEL_REQUEST': return <Plane size={16} className="text-purple-600" />
      default: return <FileCheck size={16} className="text-slate-500" />
    }
  }

  const filteredRequests = activeFilter === 'ALL'
    ? requests
    : requests.filter(r => r.requestType === activeFilter)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Request Center</h1>
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Self-Service Hub
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Submit and track attendance regularizations, work from home, client visits, overtime claims, and expense approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRequests}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-xs inline-flex items-center gap-2 px-4 py-2"
          >
            <Plus size={15} />
            Raise New Request
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['ALL', 'WORK_FROM_HOME', 'ATTENDANCE_REGULARIZATION', 'ON_DUTY', 'OVERTIME', 'EXPENSE_CLAIM'].map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeFilter === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'ALL' ? 'All Requests' : type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Requests History Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
          Loading self-service requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <FileCheck className="mx-auto text-slate-300 mb-3" size={44} />
          <h3 className="text-base font-bold text-slate-800">No Requests on Record</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Raise New Request" to submit an attendance correction, remote work authorization, or field visit notice.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Request Category & Title</th>
                <th className="py-3 px-4">Effective Window / Amount</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4">Date Filed</th>
                <th className="py-3 px-4">Reviewer Sign-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0">
                        {getTypeIcon(req.requestType)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{req.title}</span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {req.requestType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {req.startDate ? `${req.startDate} ${req.endDate && req.endDate !== req.startDate ? `to ${req.endDate}` : ''}` : req.amount ? `$${req.amount.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {req.status === 'APPROVED' && <CheckCircle2 size={12} />}
                      {req.status === 'REJECTED' && <XCircle size={12} />}
                      {req.status === 'PENDING' && <Clock size={12} />}
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {req.approverComments ? (
                      <span className="italic text-slate-700">"{req.approverComments}"</span>
                    ) : (
                      <span className="text-slate-400">Under manager review</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Operations Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">Enforces automatic conflict check against existing leave records.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Request Category *</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="WORK_FROM_HOME">Work From Home (WFH)</option>
                  <option value="ATTENDANCE_REGULARIZATION">Missed Punch / Attendance Regularization</option>
                  <option value="ON_DUTY">On-Duty / Client Visit / Field Trip</option>
                  <option value="OVERTIME">Overtime Pre-Authorization</option>
                  <option value="SHIFT_CHANGE">Shift Swap Request</option>
                  <option value="EXPENSE_CLAIM">Expense Reimbursement Claim</option>
                  <option value="TRAVEL_REQUEST">Travel & Advance Request</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  placeholder={
                    requestType === 'ATTENDANCE_REGULARIZATION'
                      ? 'e.g. Turnstile scanner failed on entry'
                      : requestType === 'ON_DUTY'
                      ? 'e.g. Client presentation at ACME Corp HQ'
                      : 'e.g. Remote work due to urgent home errand'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Dynamic Sub-forms based on Type */}
              {requestType === 'ATTENDANCE_REGULARIZATION' ? (
                <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Occurrence Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2 bg-white text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Actual Check-In</label>
                      <input
                        type="time"
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Actual Check-Out</label>
                      <input
                        type="time"
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2 bg-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : requestType === 'EXPENSE_CLAIM' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Claim Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason & Business Context *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the operational reason for this request..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* Conflict Prevention Note */}
              <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/80 p-3 rounded-lg text-amber-900 text-[11px]">
                <ShieldAlert size={15} className="shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Conflict Guard Active:</strong> The engine automatically prevents overlapping WFH and regularization requests on days with approved leaves.
                </span>
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5"
                >
                  <Send size={13} />
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
