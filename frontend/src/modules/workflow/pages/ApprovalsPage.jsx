import React, { useState, useEffect } from 'react'
import { workflowAPI } from '../../../api/workflowAPI'
import { 
  CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, AlertCircle, 
  ArrowRight, Filter, RefreshCw, Send, Check, X, ShieldAlert, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function ApprovalsPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')

  const fetchInbox = async () => {
    try {
      setLoading(true)
      const res = await workflowAPI.getInbox()
      setTasks(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load approval inbox')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInbox()
  }, [])

  const handleDecision = async (decision, taskToApprove = null) => {
    const target = taskToApprove || selectedTask
    if (!target) return
    try {
      setSubmitting(true)
      await workflowAPI.recordDecision(target.instanceId, {
        decision,
        comments: comments || (decision === 'APPROVED' ? 'Approved in Command Center' : 'Rejected by Approver')
      })
      toast.success(`Workflow request #${target.entityId} ${decision.toLowerCase()} successfully!`)
      setSelectedTask(null)
      setComments('')
      fetchInbox()
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to record ${decision}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredTasks = activeFilter === 'ALL'
    ? tasks
    : tasks.filter(t => t.entityType === activeFilter)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Approvals Command Center</h1>
            <span className="bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Governance Hub
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Orchestrate multi-tier sequential sign-offs across Leaves, Missed Punches, WFH, Overtime, and Claims.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/policies')}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-slate-900"
          >
            <UserCheck size={14} />
            Out-of-Office Delegation
          </button>
          <button
            onClick={fetchInbox}
            className="btn-secondary text-xs inline-flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white font-mono text-xs font-bold px-3 py-2 rounded-lg">
              {tasks.length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {['ALL', 'LEAVE', 'ATTENDANCE_REGULARIZATION', 'WORK_FROM_HOME', 'OVERTIME', 'EXPENSE'].map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
              activeFilter === type
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'ALL' ? 'All Queued' : type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
          Loading pending approval tasks...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <ShieldCheck className="mx-auto text-emerald-500 mb-3" size={44} />
          <h3 className="text-base font-bold text-slate-800">Inbox Zero Reached!</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All requests assigned to your approval hierarchy have been reviewed. Out-of-office delegations remain active.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredTasks.map(task => (
            <div
              key={task.instanceId}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                      {task.entityType}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Ref #{task.entityId}</span>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Step {task.currentStepOrder} of {task.totalSteps}: {task.currentStepName}
                    </span>
                    <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-medium">
                      SLA: 24h Window
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{task.workflowName}</h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      Initiated by: <strong className="text-slate-800">{task.submitterEmail}</strong>
                    </span>
                    <span>•</span>
                    <span>Submitted: {new Date(task.initiatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecision('APPROVED', task)}
                    disabled={submitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <Check size={14} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision('REJECTED', task)}
                    disabled={submitting}
                    className="bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                  >
                    <X size={14} />
                    Reject
                  </button>
                  <button
                    onClick={() => { setSelectedTask(task); setComments('') }}
                    className="btn-secondary text-xs px-3.5 py-1.5"
                  >
                    Detailed Review
                  </button>
                </div>
              </div>

              {/* History timeline preview */}
              {task.history && task.history.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-600 shrink-0">Prior Step Sign-offs:</span>
                  {task.history.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px] shrink-0"
                    >
                      <strong className="text-slate-700">Step {h.stepOrder}:</strong>
                      <span className={h.decision === 'APPROVED' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                        {h.decision}
                      </span>
                      <span className="text-slate-400">by {h.approverName}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Request #{selectedTask.entityId}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTask.workflowName}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Submitter:</span>
                  <strong className="text-slate-800">{selectedTask.submitterEmail}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Step:</span>
                  <span className="font-semibold text-slate-800">
                    Step {selectedTask.currentStepOrder} of {selectedTask.totalSteps} ({selectedTask.currentStepName})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Required Role:</span>
                  <span className="font-mono text-slate-700">{selectedTask.requiredRole || 'REPORTING_MANAGER'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Submitted At:</span>
                  <span className="text-slate-700">{new Date(selectedTask.initiatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Approver Remarks & Audit Trail Note
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  placeholder="Provide comments visible to employee and HR audit logs..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              <div className="p-4 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDecision('REJECTED')}
                  disabled={submitting}
                  className="bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <X size={14} />
                  Reject Request
                </button>
                <button
                  onClick={() => handleDecision('APPROVED')}
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-5 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check size={14} />
                  Authorize & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
