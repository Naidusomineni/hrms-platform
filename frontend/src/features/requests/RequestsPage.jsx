import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { requestAPI } from '../../api/requestAPI'
import { Send, Home, Clock, DollarSign, Plane, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RequestsPage() {
  const { user } = useSelector(s => s.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [requestType, setRequestType] = useState('WORK_FROM_HOME')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const empId = user?.employeeId || 2
      const res = await requestAPI.getForEmployee(empId)
      setRequests(res.data.data?.content || [])
    } catch (err) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      await requestAPI.create({
        employeeId: user?.employeeId || 2,
        requestType,
        title,
        startDate: startDate || null,
        endDate: endDate || null,
        amount: amount ? parseFloat(amount) : null,
        description
      })
      toast.success('Request submitted for approval!')
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
      case 'WORK_FROM_HOME': return <Home size={18} className="text-blue-500" />
      case 'EXPENSE_CLAIM': return <DollarSign size={18} className="text-emerald-500" />
      case 'TRAVEL_REQUEST': return <Plane size={18} className="text-purple-500" />
      default: return <Clock size={18} className="text-amber-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Self-Service Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Submit and track Work From Home (WFH), Shift Swaps, Expense Reimbursements, and Travel requests.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs inline-flex items-center gap-2 px-4 py-2"
        >
          <Send size={15} />
          New Request
        </button>
      </div>

      {/* Requests History Table */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="card p-12 text-center">
          <Send className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-base font-bold text-slate-800">No Requests Submitted Yet</h3>
          <p className="text-sm text-slate-500 mt-1">Click "New Request" to submit WFH, expense claims, or schedule changes.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Type & Title</th>
                <th className="p-3.5">Duration / Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Submitted On</th>
                <th className="p-3.5">Reviewer Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        {getTypeIcon(req.requestType)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{req.title}</span>
                        <span className="text-[11px] text-slate-400">{req.requestType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    {req.startDate ? `${req.startDate} to ${req.endDate || req.startDate}` : req.amount ? `$${req.amount.toFixed(2)}` : '—'}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="p-3.5 text-slate-500 italic">{req.approverComments || 'Pending review'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Submit Operations Request</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="WORK_FROM_HOME">Work From Home (WFH)</option>
                  <option value="SHIFT_CHANGE">Shift Change / Swap</option>
                  <option value="EXPENSE_CLAIM">Expense Reimbursement Claim</option>
                  <option value="TRAVEL_REQUEST">Travel & Advance Request</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Request Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote working for personal errand"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {requestType === 'EXPENSE_CLAIM' ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Justification</label>
                <textarea
                  rows={3}
                  placeholder="Provide context for manager review..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2"
                >
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
