import React, { useState, useEffect } from 'react'
import { workflowAPI } from '../../../api/workflowAPI'
import { CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ApprovalsPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleDecision = async (decision) => {
    if (!selectedTask) return
    try {
      setSubmitting(true)
      await workflowAPI.recordDecision(selectedTask.instanceId, {
        decision,
        comments: comments || (decision === 'APPROVED' ? 'Approved' : 'Rejected')
      })
      toast.success(`Workflow request ${decision.toLowerCase()} successfully!`)
      setSelectedTask(null)
      setComments('')
      fetchInbox()
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to record ${decision}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Unified Approval Inbox</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and orchestrate multi-tier approval chains across Leave, WFH, Regularization, and Expenses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200">
            {tasks.length} Pending Actions
          </span>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Loading pending approval tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="mx-auto text-emerald-500 mb-3" size={48} />
          <h3 className="text-base font-bold text-slate-800">All Caught Up!</h3>
          <p className="text-sm text-slate-500 mt-1">There are no pending workflow approvals requiring your action.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => (
            <div key={task.instanceId} className="card p-5 border border-slate-200 hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {task.entityType}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Ref #{task.entityId}</span>
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Step {task.currentStepOrder} of {task.totalSteps}: {task.currentStepName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{task.workflowName}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Submitted by: <strong className="text-slate-700">{task.submitterEmail}</strong></span>
                    <span>•</span>
                    <span>Date: {new Date(task.initiatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => { setSelectedTask(task); setComments('') }}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Review Action
                  </button>
                </div>
              </div>

              {/* History timeline preview */}
              {task.history && task.history.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-600">
                  <Clock size={14} className="text-slate-400" />
                  <span className="font-medium text-slate-500">Prior Steps:</span>
                  {task.history.map((h, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      <span className="font-semibold text-slate-700">Step {h.stepOrder}</span>
                      <span className={h.decision === 'APPROVED' ? 'text-emerald-600' : 'text-red-600'}>({h.decision})</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedTask.entityType} APPROVAL</span>
                <h3 className="text-lg font-black text-slate-900">{selectedTask.workflowName}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Submitter:</span>
                <strong className="text-slate-800">{selectedTask.submitterEmail}</strong>
              </div>
              <div className="flex justify-between">
                <span>Approval Step:</span>
                <strong className="text-amber-700">{selectedTask.currentStepName} (Step {selectedTask.currentStepOrder} of {selectedTask.totalSteps})</strong>
              </div>
              <div className="flex justify-between">
                <span>Next Tier:</span>
                <span>{selectedTask.currentStepOrder < selectedTask.totalSteps ? 'HR / Management Verification' : 'Final Direct Approval'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Decision Remarks / Feedback</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder="Optional notes or reason for decision..."
                className="w-full text-sm rounded-xl border border-slate-300 p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('REJECTED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200"
              >
                <XCircle size={15} />
                Reject
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDecision('APPROVED')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md"
              >
                <CheckCircle2 size={15} />
                Approve Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
